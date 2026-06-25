import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Client-side Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjXIBc5CVrcC5YcPTZIqIUNQvyfy7WRAo",
  authDomain: "disco-xenolalia-tk7s0.firebaseapp.com",
  projectId: "disco-xenolalia-tk7s0",
  storageBucket: "disco-xenolalia-tk7s0.firebasestorage.app",
  messagingSenderId: "742433862538",
  appId: "1:742433862538:web:46fedaa4c6a3aee6884e73"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
