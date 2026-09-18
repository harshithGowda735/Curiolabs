import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Configure these values in .env. Never commit production credentials or service accounts.
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

const configured = Boolean(
  apiKey &&
  typeof apiKey === 'string' &&
  apiKey.trim().length > 10 &&
  !apiKey.includes('YOUR_') &&
  projectId &&
  !projectId.includes('YOUR_')
)

const firebaseConfig = {
  apiKey: configured ? apiKey : 'AIzaSyDemoFallbackKeyForLocalCurioLabsApp123',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'curiolabs-app.firebaseapp.com',
  projectId: configured ? projectId : 'curiolabs-local',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'curiolabs-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
}

export const firebaseIsConfigured = configured

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = configured
  ? initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
  : getFirestore(app)

export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

if (typeof window !== 'undefined' && configured) {
  try {
    setPersistence(auth, browserLocalPersistence).catch(() => {})
  } catch (e) {
    // Non-blocking in local mode
  }
}

// Analytics is unavailable in SSR, private browsing modes, and some test runners.
export let analytics = null
if (configured && typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app)
  }).catch(() => {})
}

export default app
