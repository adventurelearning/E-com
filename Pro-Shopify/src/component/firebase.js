// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDnjEscV2UI_c5pQVoMxhuryTkW9n0jQWU",
//   authDomain: "pro-shopify.firebaseapp.com",
//   projectId: "pro-shopify",
//   storageBucket: "pro-shopify.firebasestorage.app",
//   messagingSenderId: "838195451103",
//   appId: "1:838195451103:web:35f2a0a9c0c6d7b621856a",
//   measurementId: "G-7RJTJE75PR"
// };

const firebaseConfig = {
  apiKey: "AIzaSyAcOqKl0k4fWYWrlsm7YyO0AOsjCEBir2A",
  authDomain: "adventure-apps.firebaseapp.com",
  projectId: "adventure-apps",
  storageBucket: "adventure-apps.firebasestorage.app",
  messagingSenderId: "319953650139",
  appId: "1:319953650139:web:d42dd5d2bdfa82445727fe",
  measurementId: "G-69MX19KL8E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();