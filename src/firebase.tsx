// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOKbm7T04NVdqrsWJTJniWwfkced4ROWI",
    authDomain: "foodsoft-409fc.firebaseapp.com",
    projectId: "foodsoft-409fc",
    storageBucket: "foodsoft-409fc.firebasestorage.app",
    messagingSenderId: "99307435248",
    appId: "1:99307435248:web:d93a87f430273623667e35",
    measurementId: "G-RPB26BWGL1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);