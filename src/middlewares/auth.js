import jwt from 'jsonwebtoken'; // Import JWT library
import passport from 'passport'; // Importing passport for authentication
import { ApiError } from '../utils/ApiError.js';
import config from '../config/config.js';

const JWT_SECRET = config.JWT_SECRET;

// Middleware to authenticate JWT tokens
// JWT Authentication Middleware
export const authenticateJWT = (req, res, next) => {
  // Get token from Authorization header
  const token =
    req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Authorization token is required');
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    req.user = user; // Attach decoded user information to the request object
    next(); // Proceed to the next middleware or route handler
  });
};
