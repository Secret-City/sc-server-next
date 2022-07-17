// import firebase from "firebase/app";
import { initializeApp, getApps } from "firebase/app";
import "firebase/auth"; // If you need it
import "firebase/database"; // If you need it
// import "firebase/storage"; // If you need it
// import { getAnalytics } from "firebase/analytics"; // If you need it
// import { getPerformance } from "firebase/performance"; // If you need it

const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-7HB61HH6N0"
};

// if (!getApps().length) {
// firebase.initializeApp(clientCredentials);
const firebaseApp = initializeApp(clientCredentials);
// Check that `window` is in scope for the analytics module!
if (typeof window !== "undefined") {
  // Enable analytics. https://firebase.google.com/docs/analytics/get-started
  // if ("measurementId" in clientCredentials) {
  //   // firebase.analytics();
  //   // firebase.performance();
  //   getAnalytics(firebaseApp);
  //   getPerformance(firebaseApp);
  // }
}
// }

export default firebaseApp;
