import { initializeApp, FirebaseApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, update, remove, onDisconnect, Database } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let database: Database | null = null

export function initFirebase() {
  if (app && database) return { app, database }
  
  app = initializeApp(firebaseConfig)
  database = getDatabase(app)
  
  return { app, database }
}

export function getFirebaseDatabase(): Database {
  if (!database) {
    const { database: db } = initFirebase()
    return db
  }
  return database
}

export { ref, onValue, set, update, remove, onDisconnect }
