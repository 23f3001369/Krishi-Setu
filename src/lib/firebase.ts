
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDsK0FwgyTAtXCh1yZ6JT-pVpIIhXYueOI",
    authDomain: "studio-2008248492-c4457.firebaseapp.com",
    projectId: "studio-2008248492-c4457",
    storageBucket: "studio-2008248492-c4457.appspot.com",
    messagingSenderId: "876344628825",
    appId: "1:876344628825:web:9def08508c85db3e210348",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
