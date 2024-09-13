import { body, param, query } from 'express-validator';

// Validator for creating a user
export const createUserValidator = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({min: 5, max: 25}).withMessage('Password must be between 5-25 characters long.'),
  body('age').isInt({ min: 18 }).withMessage('Age must be a number, 18 or older.'),
];

// Validator for updating a user
export const updateUserValidator = [
  // Validate username
  body('username')
    .optional() // Only validate if the field is provided
    .isString()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3-20 characters long.'),

  // Validate email
  body('email')
    .optional() // Only validate if the field is provided
    .isEmail()
    .withMessage('Invalid email address.'),

  // Validate password
  body('password')
    .optional() // Only validate if the field is provided
    .isLength({ min: 5, max: 25 })
    .withMessage('Password must be between 5-25 characters long.'),

  // Validate age
  body('age')
    .optional() // Only validate if the field is provided
    .isInt({ min: 1 })
    .withMessage('Age must be a valid number.')
];

// Validator for fetching a user
export const fetchUserValidator = [
  param('id').isInt().withMessage('User ID must be a number'),
];

// Validator for fetching users with query parameters
export const fetchUsersValidator = [
  query('age').optional().isInt().withMessage('Age must be a number'),
];
