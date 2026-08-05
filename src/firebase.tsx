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

export const getActiveUsuarioId = () => {
    if (auth.currentUser) return auth.currentUser.uid;
    try {
        const session = JSON.parse(localStorage.getItem('foodsoft_session') || '{}');
        return session.usuarioId || null;
    } catch {
        return null;
    }
};

export const getActiveSession = () => {
    try {
        const session = JSON.parse(localStorage.getItem('foodsoft_session') || '{}');
        return session.role ? session : null;
    } catch {
        return null;
    }
};

export const parsePrecio = (val: string): number => {
    if (!val) return NaN;
    let clean = val.trim();
    if (/^\d{1,3}(\.\d{3})+$/.test(clean)) {
        clean = clean.replace(/\./g, '');
    } else if (clean.includes(',') && !clean.includes('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(clean);
};

export const formatPrecio = (valor: number): string => {
    if (isNaN(valor)) return "0";
    return Number.isInteger(valor) ? valor.toString() : valor.toFixed(2);
};