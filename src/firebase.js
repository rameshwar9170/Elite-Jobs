import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBYRLNucIQH8vQo0VPIJ43ZOJ8Cbz6LaN4",
  authDomain: "vite-contact-a592b.firebaseapp.com",
  databaseURL: "https://vite-contact-a592b-default-rtdb.firebaseio.com",
  projectId: "vite-contact-a592b",
  storageBucket: "vite-contact-a592b.firebasestorage.app",
  messagingSenderId: "642139499508",
  appId: "1:642139499508:web:d55182879080f5206927a1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { auth, db, storage };