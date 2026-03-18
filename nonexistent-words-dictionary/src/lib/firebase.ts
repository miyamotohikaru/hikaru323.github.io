import type { Firestore, FieldValue as FieldValueType } from "firebase-admin/firestore";

let _db: Firestore | null = null;
let _useInMemory = false;

// Firebase が設定されているかチェック
function isFirebaseConfigured(): boolean {
  return !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export function useInMemoryStore(): boolean {
  return _useInMemory;
}

export async function getDb(): Promise<Firestore> {
  if (_db) return _db;

  if (!isFirebaseConfigured()) {
    _useInMemory = true;
    // Firebaseが未設定の場合、ダミーのFirestoreを返さずinMemoryモードを使う
    // 呼び出し元でuseInMemoryStore()をチェックして分岐する
    throw new Error("Firebase not configured - using in-memory store");
  }

  const { initializeApp, getApps, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    initializeApp({
      credential: cert({ projectId: projectId!, clientEmail: clientEmail!, privateKey: privateKey! }),
    });
  }

  _db = getFirestore();
  return _db;
}

export async function getFieldValue(): Promise<typeof FieldValueType> {
  const { FieldValue } = await import("firebase-admin/firestore");
  return FieldValue;
}
