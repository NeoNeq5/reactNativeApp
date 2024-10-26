// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, GoogleAuthProvider, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClDx-TTTVSVTE3yCLDNMpAJFSDv525Pu8",
  authDomain: "couple-to-do-list-test.firebaseapp.com",
  projectId: "couple-to-do-list-test",
  storageBucket: "couple-to-do-list-test.appspot.com",
  messagingSenderId: "752801188254",
  appId: "1:752801188254:web:b32fc46f8f79ea0245ee8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const provider = new GoogleAuthProvider();