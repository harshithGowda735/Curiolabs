import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Configure these values in .env.local. Never commit production credentials or service accounts.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
const app = initializeApp(configured ? firebaseConfig : { projectId: 'curiolabs-local' })
export const auth = getAuth(app)
export const db = configured
  ? initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
  : getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
setPersistence(auth, browserLocalPersistence).catch(console.error)
export const firebaseIsConfigured = configured
// Analytics is unavailable in SSR, private browsing modes, and some test runners.
export let analytics = null
if (configured && typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported().then((supported) => { if (supported) analytics = getAnalytics(app) }).catch(() => {})
}
export default app
