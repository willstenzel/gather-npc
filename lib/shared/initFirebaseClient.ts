import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Initialize Firebase
const app = initializeApp({
  apiKey: "<API_KEY>",
  authDomain: "<AUTH_DOMAIN>",
  projectId: "<PROJECT_ID>",
  messagingSenderId: "<MESSAGING_SENDER_ID>",
  appId: "<APP_ID>",
})

// Initialize Firestore
export const db = getFirestore(app)
