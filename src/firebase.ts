import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// User provided configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_N7fBWS0IFnvtOottJyu9wEWkT82ecUs",
  authDomain: "web-app-bca4f.firebaseapp.com",
  projectId: "web-app-bca4f",
  storageBucket: "web-app-bca4f.firebasestorage.app",
  messagingSenderId: "1050334682759",
  appId: "1:1050334682759:web:c22ad8821d7858219c6222",
  measurementId: "G-MX5FC4HDE4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
