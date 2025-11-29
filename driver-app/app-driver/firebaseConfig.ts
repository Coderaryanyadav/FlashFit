import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCcO8q6G08EPk047pncwT0UdJLiDB3WJ6I",
    authDomain: "studio-847805730-4f392.firebaseapp.com",
    projectId: "studio-847805730-4f392",
    storageBucket: "studio-847805730-4f392.firebasestorage.app",
    messagingSenderId: "497323679456",
    appId: "1:497323679456:web:fef3f0e6e3af943969ba85"
};

let app;
let auth;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} else {
    app = getApp();
    auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
