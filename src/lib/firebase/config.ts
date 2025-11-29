// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: This is a public configuration. Do not store secrets here.
const firebaseConfig = {
  "projectId": "studio-2509906330-47be3",
  "appId": "1:84761557416:web:a6555dcbf08c54030d859d",
  "apiKey": "AIzaSyDPrUkIqSXXgoyejhRWdjQ4jRKPQRftxe0",
  "authDomain": "studio-2509906330-47be3.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "84761557416"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
