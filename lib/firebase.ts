import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyC8FNQHlxRk-GKKvA_sn-defDFwBFw2TBc",
  authDomain: "gaseagua-9d387.firebaseapp.com",
  projectId: "gaseagua-9d387",
  storageBucket: "gaseagua-9d387.firebasestorage.app",
  messagingSenderId: "526997735078",
  appId: "1:526997735078:web:63501aafdd20203fba1667",
  measurementId: "G-ESWT7P54VD",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app
