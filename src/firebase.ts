import { getAuth } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//import { getAnalytics } from 'firebase/analytics';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);



