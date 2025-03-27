import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence, 
  PhoneAuthProvider 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
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

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const firestore = getFirestore(app);
export const phoneProvider = new PhoneAuthProvider(auth);

export default app;