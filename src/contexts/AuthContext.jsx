import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, db, googleProvider, firebaseIsConfigured } from '../firebase'
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  updateProfile 
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

const AuthContext = createContext(null)
const ROLES = ['student', 'faculty', 'admin']

const makeProfile = (user, role, details = {}) => ({
  name: details.name || user.displayName || user.email?.split('@')[0] || 'CurioLabs User',
  email: user.email || '',
  role,
  branch: details.branch || '',
  profilePhoto: user.photoURL || '',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
})

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('curiolabs_auth_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('curiolabs_auth_profile')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseIsConfigured || !auth) {
      setLoading(false)
      return
    }

    try {
      const unsub = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user)
        if (!user) {
          setProfile(null)
          localStorage.removeItem('curiolabs_auth_user')
          localStorage.removeItem('curiolabs_auth_profile')
          setLoading(false)
          return
        }

        try {
          if (db) {
            const snapshot = await getDoc(doc(db, 'users', user.uid))
            if (snapshot.exists()) {
              const data = snapshot.data()
              setProfile(data)
              localStorage.setItem('curiolabs_auth_profile', JSON.stringify(data))
            } else {
              setProfile(null)
            }
          }
        } catch (error) {
          console.warn('Unable to load Firestore profile:', error)
        }
        setLoading(false)
      })
      return unsub
    } catch (e) {
      console.warn('Auth listener init note:', e)
      setLoading(false)
    }
  }, [])

  const createProfile = async (user, role, details = {}) => {
    if (!['student', 'faculty', 'admin'].includes(role)) {
      throw new Error('Only Student and Faculty roles can be registered.')
    }
    const prof = {
      name: details.name || user.displayName || user.email?.split('@')[0] || 'CurioLabs User',
      email: user.email || '',
      role,
      branch: details.branch || '',
      department: details.department || details.branch || ''
    }

    setProfile(prof)
    localStorage.setItem('curiolabs_auth_profile', JSON.stringify(prof))

    if (firebaseIsConfigured && db) {
      try {
        await Promise.all([
          setDoc(doc(db, 'users', user.uid), makeProfile(user, role, details), { merge: true }),
          setDoc(doc(db, role === 'student' ? 'students' : 'faculty', user.uid), role === 'student'
            ? { academicLevel: details.academicLevel || '', branch: details.branch || '', completedExperiments: 0, certificates: 0, scores: { average: 0, vivaAverage: 0 }, updatedAt: serverTimestamp() }
            : { department: details.department || details.branch || '', createdLabs: 0, studentsManaged: 0, updatedAt: serverTimestamp() }, { merge: true }),
        ])
      } catch (e) {
        console.warn('Firestore profile write note:', e)
      }
    }
  }

  const register = async (details) => {
    if (!firebaseIsConfigured || !auth) {
      throw new Error('Firebase authentication is not configured in this environment.')
    }

    const credential = await createUserWithEmailAndPassword(auth, details.email, details.password)
    await updateProfile(credential.user, { displayName: details.name })
    await createProfile(credential.user, details.role, details)
    return credential
  }

  const signInWithGoogle = async () => {
    if (!firebaseIsConfigured || !auth) {
      throw new Error('Firebase authentication is not configured in this environment.')
    }
    return signInWithPopup(auth, googleProvider)
  }

  const signInWithEmail = async (email, password) => {
    if (!firebaseIsConfigured || !auth) {
      throw new Error('Firebase authentication is not configured in this environment.')
    }
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    setCurrentUser(null)
    setProfile(null)
    localStorage.removeItem('curiolabs_auth_user')
    localStorage.removeItem('curiolabs_auth_profile')
    if (firebaseIsConfigured && auth) {
      try {
        await firebaseSignOut(auth)
      } catch (e) {
        console.warn('Signout note:', e)
      }
    }
  }

  const userRole = profile?.role || 'student'

  const value = useMemo(() => ({
    currentUser,
    profile,
    userRole,
    loading,
    roles: ROLES,
    signInWithGoogle,
    signInWithEmail,
    register,
    signUpWithEmail: (email, password) => register({ email, password, name: email.split('@')[0], role: 'student' }),
    signOut,
    createProfile,
    isAdmin: userRole === 'admin',
    isFaculty: ['faculty', 'admin', 'teacher'].includes(userRole)
  }), [currentUser, profile, userRole, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
