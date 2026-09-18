// Firebase configuration for CurioLabs
// TODO: Replace with your own Firebase project config before deployment
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDEMO-REPLACE-ME",
  authDomain: "curiolabs-demo.firebaseapp.com",
  projectId: "curiolabs-demo",
  storageBucket: "curiolabs-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export default app
