import { initializeApp } from 'firebase/app';
import config from './config.js';
import { getFirestore, collection, getDocs } from 'firebase/firestore';


let app;
let firestoreDb;


const initializeFirebaseApp = () => {
  try {
    app = initializeApp(config.firebaseConfig); // Initialize Firebase app
    firestoreDb = getFirestore(app); // Initialize Firestore with the app instance
    // firestoreSetup();
    return app;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};


// Function to handle Firestore connection and operations
export const firestoreSetup = async () => {
  try {
    // Test connection by listing collections or fetching a document
    const testCollection = collection(firestoreDb, 'users'); // Example: 'users' collection
    const snapshot = await getDocs(testCollection);

    // Log a success message if connection is successful
    console.log(
      `Firestore Connected: Retrieved ${snapshot.size} documents from the 'users' collection.`
    );
  } catch (error) {
    // If an error occurs during connection or operation
    if (error instanceof Error) {
      // Log the error message if it's an instance of Error
      console.error(`Firestore Error: ${error.message}`);
    } else {
      // Log a generic error message for unknown errors
      console.error('An unknown Firestore error occurred.');
    }
    // Exit the process with a failure code if needed
    process.exit(1);
  }
};


export { initializeFirebaseApp, firestoreDb };
