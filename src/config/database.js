import mongoose from 'mongoose'; // Importing mongoose for database connection
import  config  from './config.js';

// Function to connect to MongoDB
export const connectDB = async () => {
  try {
    // Retrieve the MongoDB URI from environment variables
    const mongoURI = config.ConnectionString;

    // Check if the MongoDB URI is defined; if not, throw an error
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables.');
    }

    // Attempt to connect to MongoDB using the provided URI
    const conn = await mongoose.connect(mongoURI);

    // Log a success message with the host of the connected database
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If an error occurs during connection
    if (error instanceof Error) {
      // Log the error message if it's an instance of Error
      console.error(`Error: ${error.message}`);
    } else {
      // Log a generic error message for unknown errors
      console.error('An unknown error occurred');
    }
    // Exit the process with a failure code
    process.exit(1);
  }
};

// TODO: Implementation of mysql and squelize and using mongodb, mysql and squelize together at same time and then exist everything 3 times. Is better saving i think.
// TODO: Adding Security features, please maximize the security.
