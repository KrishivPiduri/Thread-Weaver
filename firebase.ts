// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDrfkrhbw7w1X3szJ7LMtjbE6rJVNVA4Zo",
    authDomain: "feynmanhelper.firebaseapp.com",
    projectId: "feynmanhelper",
    storageBucket: "feynmanhelper.firebasestorage.app",
    messagingSenderId: "1050414283357",
    appId: "1:1050414283357:web:ecf111b2934699b7476bb4",
    measurementId: "G-VW77CSJRBW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, signInWithPopup, db };