import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAGcgG3AMLyKH6FcnMm3sC2aBo15JqU-IE',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dalail-family-erp.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dalail-family-erp',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dalail-family-erp.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '696420166006',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:696420166006:web:1d8d0bdb6e44d69c027257',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-YJ29ENVSPL',
};

// 1. Initialize Firebase App (singleton pattern to prevent duplicate initialization)
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// 2. Firebase Authentication
export const auth: Auth = getAuth(app);

// 3. Cloud Firestore
export const firestore: Firestore = getFirestore(app);
export const db: Firestore = firestore; // Alias for modular convenience

// 4. Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

// 5. Firebase Analytics (browser-only, when supported)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics not supported or blocked in current environment
      analytics = null;
    });
}
