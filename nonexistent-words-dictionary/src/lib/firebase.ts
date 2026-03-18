import type { Firestore, FieldValue as FieldValueType } from "firebase-admin/firestore";

let _db: Firestore | null = null;
let _firebaseAvailable: boolean | null = null;

export function isFirebaseAvailable(): boolean {
  // 環境変数が全て揃っているか
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

export async function getDb(): Promise<Firestore> {
  if (_db) return _db;

  const { initializeApp, getApps, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID!;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  _db = getFirestore();
  return _db;
}

export async function getFieldValue(): Promise<typeof FieldValueType> {
  const { FieldValue } = await import("firebase-admin/firestore");
  return FieldValue;
}
