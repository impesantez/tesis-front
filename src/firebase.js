import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCym4yXdgntLs9nSlkhm-MpNkVv2gNy0U",
  authDomain: "nail-salon-booking-bd985.firebaseapp.com",
  projectId: "nail-salon-booking-bd985",
  storageBucket: "nail-salon-booking-bd985.firebasestorage.app",
  messagingSenderId: "820340995347",
  appId: "1:820340995347:web:76a8080c69fd4482b256e6",
  measurementId: "G-VH7Z0W9BV5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication + Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
