import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, db, googleProvider, firebaseIsConfigured } from '../firebase'
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

const AuthContext = createContext(null)
const ROLES = ['student', 'faculty', 'admin']
const makeProfile = (user, role, details = {}) => ({ name: details.name || user.displayName || user.email?.split('@')[0] || 'CurioLabs User', email: user.email || '', role, branch: details.branch || '', profilePhoto: user.photoURL || '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() })

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    setCurrentUser(user)
    if (!user || !firebaseIsConfigured) { setProfile(null); setLoading(false); return }
    try { const snapshot = await getDoc(doc(db, 'users', user.uid)); setProfile(snapshot.exists() ? snapshot.data() : null) }
    catch (error) { console.error('Unable to load account profile', error); setProfile(null) }
    setLoading(false)
  }), [])

  const createProfile = async (user, role, details = {}) => {
    if (!['student', 'faculty'].includes(role)) throw new Error('Only Student and Faculty roles can be self-registered.')
    await Promise.all([
      setDoc(doc(db, 'users', user.uid), makeProfile(user, role, details), { merge: true }),
      setDoc(doc(db, role === 'student' ? 'students' : 'faculty', user.uid), role === 'student'
        ? { academicLevel: details.academicLevel || '', branch: details.branch || '', completedExperiments: 0, certificates: 0, scores: { average: 0, vivaAverage: 0 }, updatedAt: serverTimestamp() }
        : { department: details.department || details.branch || '', createdLabs: 0, studentsManaged: 0, updatedAt: serverTimestamp() }, { merge: true }),
    ])
    setProfile(await getDoc(doc(db, 'users', user.uid)).then(item => item.data()))
  }
  const register = async (details) => { const credential = await createUserWithEmailAndPassword(auth, details.email, details.password); await updateProfile(credential.user, { displayName: details.name }); await createProfile(credential.user, details.role, details); return credential }
  const demoSignIn = role => { const normalized = role === 'teacher' ? 'faculty' : role; setCurrentUser({ uid: 'demo-user', displayName: normalized === 'faculty' ? 'Demo Faculty' : 'Demo Student', email: 'demo@curiolabs.app' }); setProfile({ role: normalized, name: 'Demo User', branch: 'Engineering' }); setLoading(false) }
  const userRole = profile?.role || null
  const value = useMemo(() => ({ currentUser, profile, userRole, loading, roles: ROLES, signInWithGoogle: () => signInWithPopup(auth, googleProvider), signInWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password), register, signOut: () => firebaseSignOut(auth), createProfile, demoSignIn, isAdmin: userRole === 'admin', isFaculty: ['faculty', 'admin'].includes(userRole) }), [currentUser, profile, userRole, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context }
