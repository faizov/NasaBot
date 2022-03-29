require('dotenv').config()
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, getDoc } = require('firebase-admin/firestore');

const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
      "projectId": process.env.FIREBASE_PROJECT_ID,
      "private_key": process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: "https://nasa-bot-787db-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true })

const chatsDb = db.collection('chats');
const statsDb = db.collection('chats-stats');

module.exports.chatFirebase = chatsDb;
module.exports.statsFirebase = statsDb;