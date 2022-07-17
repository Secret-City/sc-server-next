import admin from "firebase-admin";
// import serviceAccount from "./serviceAccountKey.json";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
  } catch (error) {
    console.log("Firebase admin initialization error", error.stack);
  }
}
export default admin;

// import {
//   AppOptions,
//   cert,
//   getApp,
//   getApps,
//   initializeApp,
//   ServiceAccount,
// } from "firebase-admin/app";
// import { getAuth } from "firebase-admin/auth";

// const credentials = {
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
// };

// const options = {
//   credential: cert(credentials),
//   databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
// };

// function createFirebaseAdminApp(config) {
//   if (getApps().length === 0) {
//     return initializeApp(config);
//   } else {
//     return getApp();
//   }
// }

// const firebaseAdmin = createFirebaseAdminApp(options);
// export const adminAuth = getAuth(firebaseAdmin);
