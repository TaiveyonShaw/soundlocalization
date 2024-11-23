import fs from "fs";
import { read } from "mat-for-js";
import { doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseToken = import.meta.env.VITE_FIREBASE_ACCESS_TOKEN;

const firebaseConfig = {
  apiKey: firebaseToken,
  authDomain: "sound-localization-visualizer.firebaseapp.com",
  projectId: "sound-localization-visualizer",
  storageBucket: "sound-localization-visualizer.appspot.com",
  messagingSenderId: "456401547530",
  appId: "1:456401547530:web:efbda8dd234f74b8944af3",
  measurementId: "G-2VYD2BMLTQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Function to store JSON data in Firestore
const storeMatJsonInFirestore = async (json, collectionName, docId) => {
  try {
    // Reference to the Firestore collection and document
    const docRef = doc(analytics, collectionName, docId);

    // Set the document with the JSON data
    await setDoc(docRef, json);

    console.log("Document written successfully!");
  } catch (e) {
    console.error("Error writing document: ", e);
  }
};

// Function to process .mat file and store it in Firebase
const processMatFile = async () => {
  try {
    // Read the .mat file
    fs.readFile("thestruct_MoreB3.mat", null, async (err, data) => {
      if (err) {
        console.error("Error reading .mat file:", err);
        return;
      }

      // Parse the .mat file data using mat-for-js
      const final = read(data.buffer);

      // Prepare the data as JSON (you don't need to stringify it, Firestore stores JSON objects)
      const jsonData = final; // Directly use the parsed data (not stringified)

      // Define collection name and document ID (you can use any naming scheme you prefer)
      const collectionName = "matFiles"; // Example collection name in Firestore
      const docId = Object.keys(final.data)[0]; // Use the first key of the `data` object as the document ID

      // Store the processed data in Firestore
      await storeMatJsonInFirestore(jsonData, collectionName, docId);
    });
  } catch (error) {
    console.error("Error processing .mat file:", error);
  }
};

// Call the function to process the file and store it in Firestore
processMatFile();

export default processMatFile;
