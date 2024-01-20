import firebase from "firebase-admin"
import { applicationDefault } from "firebase-admin/app"
import { Firestore, getFirestore } from "firebase-admin/firestore"

let db: Firestore | undefined

export const initFirebaseAdmin = (): Firestore => {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      credential: applicationDefault(),
    })
  }

  if (!db) {
    db = getFirestore()
  }

  return db
}
