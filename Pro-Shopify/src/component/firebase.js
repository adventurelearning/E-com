// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnjEscV2UI_c5pQVoMxhuryTkW9n0jQWU",
  authDomain: "pro-shopify.firebaseapp.com",
  projectId: "pro-shopify",
  storageBucket: "pro-shopify.firebasestorage.app",
  messagingSenderId: "838195451103",
  appId: "1:838195451103:web:35f2a0a9c0c6d7b621856a",
  measurementId: "G-7RJTJE75PR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();