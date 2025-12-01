import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyCcO8q6G08EPk047pncwT0UdJLiDB3WJ6I",
    authDomain: "studio-847805730-4f392.firebaseapp.com",
    projectId: "studio-847805730-4f392",
    storageBucket: "studio-847805730-4f392.firebasestorage.app",
    messagingSenderId: "497323679456",
    appId: "1:497323679456:web:fef3f0e6e3af943969ba85"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, db, auth, storage, functions };
