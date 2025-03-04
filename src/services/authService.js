import jwt from 'jsonwebtoken'; // Importing the jsonwebtoken library for creating and verifying JSON Web Tokens
import config from '../config/config.js';

const JWT_SECRET = config.JWT_SECRET;

// Function to generate a JSON Web Token (JWT) for a given user.
// The token contains the user's ID, email, and role.
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, // Payload: information we want to encode in the token
    JWT_SECRET, // The secret key used to sign the token, retrieved from environment variables
    { expiresIn: '1d' } // Options: token will expire in 1 day
  );
};

// Function to verify a given JWT token.
// This function checks the token's validity and decodes it if valid.
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET); // Verifies the token using the same secret used for signing
};
