// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPFIhrL9iTi06wme8HUcm1B2Mc6IdoJnI",
  authDomain: "fake-news-detection-app-b1ebe.firebaseapp.com",
  projectId: "fake-news-detection-app-b1ebe",
  storageBucket: "fake-news-detection-app-b1ebe.firebasestorage.app",
  messagingSenderId: "401082610166",
  appId: "1:401082610166:web:3eaff7d806b781bf5257d7",
  measurementId: "G-DMLJT0ZQ4W"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
