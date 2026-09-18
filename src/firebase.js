import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

const env = import.meta.env || {}

// Support different environment variable naming conventions configured in Vercel or .env
const parsedConfig = (() => {
  const rawConfig = env.VITE_FIREBASE_CONFIG || env.FIREBASE_CONFIG
  if (rawConfig) {
    try {
      return typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig
    } catch {
      // fallback to individual vars
    }
  }
  return {}
})()

const firebaseConfig = {
  apiKey: parsedConfig.apiKey || env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || env.VITE_FIREBASE_KEY || env.FIREBASE_KEY || env.VITE_API_KEY || '',
  authDomain: parsedConfig.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || env.VITE_AUTH_DOMAIN || '',
  projectId: parsedConfig.projectId || env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || env.VITE_PROJECT_ID || '',
  storageBucket: parsedConfig.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || env.VITE_STORAGE_BUCKET || '',
  messagingSenderId: parsedConfig.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID || env.VITE_MESSAGING_SENDER_ID || '',
  appId: parsedConfig.appId || env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID || env.VITE_APP_ID || '',
  measurementId: parsedConfig.measurementId || env.VITE_FIREBASE_MEASUREMENT_ID || env.FIREBASE_MEASUREMENT_ID || env.VITE_MEASUREMENT_ID || '',
}

export const firebaseIsConfigured = Boolean(
  firebaseConfig.apiKey &&
  typeof firebaseConfig.apiKey === 'string' &&
  firebaseConfig.apiKey.trim().length > 0 &&
  firebaseConfig.projectId
)

let app = null
let auth = null
let db = null
let storage = null
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
export let analytics = null

if (firebaseIsConfigured) {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
  auth = getAuth(app)
  
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    })
  } catch (err) {
    db = getFirestore(app)
  }

  storage = getStorage(app)

  if (typeof window !== 'undefined') {
    try {
      setPersistence(auth, browserLocalPersistence).catch(() => {})
    } catch (e) {
      // Non-blocking in browser environment
    }

    if (firebaseConfig.measurementId) {
      isSupported().then((supported) => {
        if (supported) analytics = getAnalytics(app)
      }).catch(() => {})
    }
  }
}

export { app, auth, db, storage }
export default app
