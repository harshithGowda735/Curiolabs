import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider, db } from '../firebase'
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut 
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'student' | 'teacher'
  const [profileComplete, setProfileComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUserRole(data.role || null)
            setProfileComplete(data.profileComplete || false)
          } else {
            setUserRole(null)
            setProfileComplete(false)
          }
        } catch (err) {
          // Offline or Firebase not configured — use demo mode
          console.log('Firebase read failed, using demo mode:', err.message)
          setUserRole(localStorage.getItem('curiolabs_role') || null)
          setProfileComplete(localStorage.getItem('curiolabs_profile') === 'true')
        }
      } else {
        setUserRole(null)
        setProfileComplete(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Google sign-in failed:', err)
      throw err
    }
  }

  const signInWithEmail = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signUpWithEmail = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    localStorage.removeItem('curiolabs_role')
    localStorage.removeItem('curiolabs_profile')
    setUserRole(null)
    setProfileComplete(false)
    return firebaseSignOut(auth)
  }

  const setRole = async (role) => {
    setUserRole(role)
    localStorage.setItem('curiolabs_role', role)
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { role }, { merge: true })
      } catch (err) {
        console.log('Offline — role saved locally')
      }
    }
  }

  const completeProfile = async (profileData) => {
    setProfileComplete(true)
    localStorage.setItem('curiolabs_profile', 'true')
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { 
          ...profileData, 
          profileComplete: true 
        }, { merge: true })
      } catch (err) {
        console.log('Offline — profile saved locally')
      }
    }
  }

  // Demo mode for when Firebase is not configured
  const demoSignIn = (role) => {
    setCurrentUser({ uid: 'demo-user', displayName: 'Demo Student', email: 'demo@curiolabs.app' })
    setUserRole(role)
    setProfileComplete(true)
    localStorage.setItem('curiolabs_role', role)
    localStorage.setItem('curiolabs_profile', 'true')
    setLoading(false)
  }

  const value = {
    currentUser,
    userRole,
    profileComplete,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    setRole,
    completeProfile,
    demoSignIn,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
