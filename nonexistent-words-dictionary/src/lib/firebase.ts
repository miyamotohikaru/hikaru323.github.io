import type { Firestore, FieldValue as FieldValueType } from "firebase-admin/firestore";

let _db: Firestore | null = null;

export async function getDb(): Promise<Firestore> {
  if (_db) return _db;

  const { initializeApp, getApps, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else if (projectId) {
      initializeApp({ projectId });
    } else {
      initializeApp({ projectId: "demo-project" });
    }
  }

  _db = getFirestore();
  return _db;
}

export async function getFieldValue(): Promise<typeof FieldValueType> {
  const { FieldValue } = await import("firebase-admin/firestore");
  return FieldValue;
}
