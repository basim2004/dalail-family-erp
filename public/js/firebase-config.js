/**
 * DALAIL FAMILY ERP - Firebase Configuration & Modular Services
 * Dalailul Khairath Islamic Foundation (Regd.)
 * Project ID: dalail-family-erp
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-storage.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAGcgG3AMLyKH6FcnMm3sC2aBo15JqU-IE",
  authDomain: "dalail-family-erp.firebaseapp.com",
  projectId: "dalail-family-erp",
  storageBucket: "dalail-family-erp.firebasestorage.app",
  messagingSenderId: "696420166006",
  appId: "1:696420166006:web:1d8d0bdb6e44d69c027257",
  measurementId: "G-YJ29ENVSPL"
};

// Initialize Firebase only once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
