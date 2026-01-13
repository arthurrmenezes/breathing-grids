import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Firebase configuration using environment variables with fallback
// Note: Firebase API keys are designed for client-side use and are protected by Firebase Security Rules
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA4k6GbyvMtD1jUNE9sgbVzwIGxtGxBmtk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tmoney-4af9f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tmoney-4af9f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tmoney-4af9f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "633717010980",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:633717010980:web:522aff54a8e3ee1e2c1eb1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7H0TW0MZR8"
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

export const initializeFirebase = async () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
    }
  }
  return { app, analytics };
};

// Initialize on page load (after React is ready)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initializeFirebase();
  });
}

export { app, analytics };
