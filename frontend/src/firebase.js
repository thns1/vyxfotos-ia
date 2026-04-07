import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// AVISO IMPORTANTE: O usuário precisará substituir esses valores pelas chaves reais do projeto criado no Firebase.
// As chaves reais virão do .env futuramente ou coladas aqui (se não for open source publicamente).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "SUA_API_KEY_AQUI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "SUA_AUTH_DOMAIN_AQUI",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "SEU_PROJECT_ID_AQUI",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "SEU_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "SEU_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "SEU_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { app, auth, db, provider, signInWithPopup, signOut };
