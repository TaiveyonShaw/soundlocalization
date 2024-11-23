// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseToken = import.meta.env.VITE_FIREBASE_ACCESS_TOKEN;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: firebaseToken,
  authDomain: "sound-localization-visualizer.firebaseapp.com",
  projectId: "sound-localization-visualizer",
  storageBucket: "sound-localization-visualizer.appspot.com",
  messagingSenderId: "456401547530",
  appId: "1:456401547530:web:efbda8dd234f74b8944af3",
  measurementId: "G-2VYD2BMLTQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default analytics