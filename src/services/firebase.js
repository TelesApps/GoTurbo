import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration - you'll need to get this from the Firebase console
const firebaseConfig = {
    apiKey: "AIzaSyDaXqtnxN2QZhGlyVPD1gVnJK9ATuRneSc",
    authDomain: "go-turbo.firebaseapp.com",
    projectId: "go-turbo",
    storageBucket: "go-turbo.appspot.com",
    messagingSenderId: "60142441370",
    appId: "1:60142441370:web:13a854a76501f3aa472023",
    measurementId: "G-XKM955D01G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;