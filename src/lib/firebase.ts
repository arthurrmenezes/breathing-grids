import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA4k6GbyvMtD1jUNE9sgbVzwIGxtGxBmtk",
  authDomain: "tmoney-4af9f.firebaseapp.com",
  projectId: "tmoney-4af9f",
  storageBucket: "tmoney-4af9f.firebasestorage.app",
  messagingSenderId: "633717010980",
  appId: "1:633717010980:web:522aff54a8e3ee1e2c1eb1",
  measurementId: "G-7H0TW0MZR8"
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
