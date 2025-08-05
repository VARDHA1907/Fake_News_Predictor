// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "fake-news-detection-app-b1ebe.firebaseapp.com",
  projectId: "fake-news-detection-app-b1ebe",
  storageBucket: "fake-news-detection-app-b1ebe.firebasestorage.app",
  messagingSenderId: "401082610166",
  appId: "API_ID",
  measurementId: "MEASUREMENT_ID"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
