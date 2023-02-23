import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "dotenv";

config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL:
    "https://nasa-bot-787db-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

export const chatsDb = db.collection("chats");
export const statsDb = db.collection("chats-stats");
