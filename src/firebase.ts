// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_firebase_apiKey,
  authDomain: import.meta.env.VITE_firebase_authDomain,
  databaseURL: import.meta.env.VITE_firebase_databaseURL,
  projectId: import.meta.env.VITE_firebase_projectId,
  storageBucket: import.meta.env.VITE_firebase_storageBucket,
  messagingSenderId: import.meta.env.VITE_firebase_messagingSenderId,
  appId: import.meta.env.VITE_firebase_appId,
  measurementId: import.meta.env.VITE_firebase_measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export{app, database};