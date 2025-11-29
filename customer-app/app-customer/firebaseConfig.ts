import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace with env in real app
    authDomain: "flashfit.firebaseapp.com",
    projectId: "flashfit",
    storageBucket: "flashfit.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:android:abcdef",
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
