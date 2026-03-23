import { NextResponse } from "next/server";
import { getDb, isFirebaseAvailable } from "@/lib/firebase";
import { getRandomWord } from "@/lib/in-memory-store";

export async function GET() {
  try {
    if (isFirebaseAvailable()) {
      try {
        const db = await getDb();
        const randomKey = db.collection("words").doc().id;
        let snapshot = await db
          .collection("words")
          .where("isVisible", "==", true)
          .where("__name__", ">=", randomKey)
          .limit(1)
          .get();

        if (snapshot.empty) {
          snapshot = await db
            .collection("words")
            .where("isVisible", "==", true)
            .where("__name__", "<", randomKey)
            .limit(1)
            .get();
        }

        if (!snapshot.empty) {
          return NextResponse.json({ id: snapshot.docs[0].id });
        }

        return NextResponse.json({ id: null });
      } catch (fbError) {
        console.error("Firebase error in random:", fbError);
      }
    }

    const word = getRandomWord();
    return NextResponse.json({ id: word?.id || null });
  } catch (error) {
    console.error("Random word error:", error);
    return NextResponse.json({ id: null });
  }
}
