import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBYdnaj8oNtpAZR7mWrRiodTeD1XtsXKro",
  authDomain: "socmedia-project.firebaseapp.com",
  projectId: "socmedia-project",
  storageBucket: "socmedia-project.appspot.com",
  messagingSenderId: "223191282397",
  appId: "1:223191282397:web:24ef430ecef36259246134",
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
