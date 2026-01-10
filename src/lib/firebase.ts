import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA4k6GbyvMtD1jUNE9sgbVzwIGxtGxBmtk",
  authDomain: "tmoney-4af9f.firebaseapp.com",
  projectId: "tmoney-4af9f",
  storageBucket: "tmoney-4af9f.firebasestorage.app",
  messagingSenderId: "633717010980",
  appId: "1:633717010980:web:522aff54a8e3ee1e2c1eb1",
  measurementId: "G-7H0TW0MZR8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported (not in SSR or unsupported browsers)
let analytics: ReturnType<typeof getAnalytics> | null = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, analytics };
