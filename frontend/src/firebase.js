import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// AVISO IMPORTANTE: O usuário precisará substituir esses valores pelas chaves reais do projeto criado no Firebase.
// As chaves reais virão do .env futuramente ou coladas aqui (se não for open source publicamente).
const firebaseConfig = {
  apiKey: "AIzaSyCWSbhDmB3r4cOgDH2HQDBCgDiNXjyZkMs",
  authDomain: "vyxfotos.firebaseapp.com",
  databaseURL: "https://vyxfotos-default-rtdb.firebaseio.com/",
  projectId: "vyxfotos",
  storageBucket: "vyxfotos.firebasestorage.app",
  messagingSenderId: "330334036787",
  appId: "1:330334036787:web:ccf9a82185bd4df1a31446",
  measurementId: "G-5R3CKNSPNJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

export { app, auth, db, database, provider, signInWithPopup, signOut };

