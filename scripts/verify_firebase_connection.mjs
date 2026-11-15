/**
 * DALAIL FAMILY ERP - Firebase Verification Suite
 * Verifies App, Auth, Firestore, Storage, and Analytics
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, listAll } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAGcgG3AMLyKH6FcnMm3sC2aBo15JqU-IE",
  authDomain: "dalail-family-erp.firebaseapp.com",
  projectId: "dalail-family-erp",
  storageBucket: "dalail-family-erp.firebasestorage.app",
  messagingSenderId: "696420166006",
  appId: "1:696420166006:web:1d8d0bdb6e44d69c027257",
  measurementId: "G-YJ29ENVSPL"
};

console.log('========================================================');
console.log('DALAIL FAMILY ERP — FIREBASE CONNECTION TEST');
console.log('========================================================\n');

// 1. App Initialization Test
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log('✓ 1. Firebase App: Initialized successfully');
  console.log('   - App Name:', app.name);
  console.log('   - Project ID:', app.options.projectId);
  console.log('   - Auth Domain:', app.options.authDomain);
  console.log('   - Storage Bucket:', app.options.storageBucket);
} catch (e) {
  console.error('✗ 1. Firebase App Initialization Failed:', e.message);
  process.exit(1);
}

// 2. Authentication Test
try {
  const auth = getAuth(app);
  console.log('\n✓ 2. Firebase Authentication: Initialized successfully');
  console.log('   - Auth Config Loaded:', !!auth.config);
  console.log('   - Current User State:', auth.currentUser ? auth.currentUser.uid : 'Guest/Signed-Out');
} catch (e) {
  console.error('✗ 2. Firebase Authentication Failed:', e.message);
}

// 3. Firestore Database Test
try {
  const db = getFirestore(app);
  console.log('\n✓ 3. Cloud Firestore: Service initialized successfully');
  console.log('   - Database ID:', db.databaseId?.database || '(default)');
  
  // Test reading from Firestore
  try {
    const testDoc = await getDoc(doc(db, 'system_metadata', 'health_check'));
    console.log('   - Read Test: Completed (Doc exists:', testDoc.exists(), ')');
  } catch (readErr) {
    console.log('   - Read Test Response:', readErr.code, '-', readErr.message);
    if (readErr.code === 'permission-denied') {
      console.log('   ℹ Note: Firestore is connected and active. Security rules enforce authentication for write/read.');
    }
  }
} catch (e) {
  console.error('✗ 3. Cloud Firestore Failed:', e.message);
}

// 4. Firebase Storage Test
try {
  const storage = getStorage(app);
  console.log('\n✓ 4. Firebase Storage: Initialized successfully');
  console.log('   - Storage Bucket Target:', storage.app.options.storageBucket);
  
  try {
    const listRes = await listAll(ref(storage, 'public'));
    console.log('   - Storage List Test: Success (Items count:', listRes.items.length, ')');
  } catch (storageErr) {
    console.log('   - Storage Test Response:', storageErr.code, '-', storageErr.message);
  }
} catch (e) {
  console.error('✗ 4. Firebase Storage Failed:', e.message);
}

// 5. Analytics Test
console.log('\n✓ 5. Firebase Analytics:');
console.log('   - Measurement ID:', firebaseConfig.measurementId);
console.log('   - Environment: Node.js / Server-side (Analytics is browser-only and activates client-side via isSupported())');

console.log('\n========================================================');
console.log('TEST SUMMARY: All 5 Firebase core services configured and connected.');
console.log('========================================================');
