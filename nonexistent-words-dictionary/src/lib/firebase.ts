import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else if (projectId) {
      // For environments with default credentials (e.g., Vercel with Firebase integration)
      initializeApp({ projectId });
    } else {
      // Fallback: initialize without credentials for development
      initializeApp({ projectId: "demo-project" });
    }
  }
  return getFirestore();
}

export const db = getFirebaseAdmin();
