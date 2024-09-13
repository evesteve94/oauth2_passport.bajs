import express from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../db.js';
import { 
  createUserValidator, 
  updateUserValidator, 
  fetchUserValidator, 
  fetchUsersValidator 
} from '../validators.js';
import { hashPassword } from '../utils/helpers.js';

const router = express.Router();

// Utility function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST route to create a new user
router.post('/', createUserValidator, handleValidationErrors, async (req, res) => {
  let { username, email, password, age } = req.body;
  console.log(`Before hash: ${password}`)
  password = hashPassword(password);
  console.log(`After hash: ${password}`)
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password, age) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, password, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// GET route to fetch a user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// GET route to fetch all users
router.get('/', fetchUsersValidator, handleValidationErrors, async (req, res) => {
  console.log(req.session)
  console.log(req.session.id)
  
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// PUT route to update a user
router.put('/:id', updateUserValidator, handleValidationErrors, async (req, res) => {
  const { id } = req.params;
  let { username, email, password, age } = req.body;

  // Only hash the password if it is being updated
  if (password) {
    password = hashPassword(password);
  }

  try {
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, password = $3, age = $4 WHERE id = $5 RETURNING *',
      [username, email, password, age, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
});

router.patch('/:id', updateUserValidator, handleValidationErrors, async (req, res) => {
  const { id } = req.params;
  let { username, email, password, age } = req.body;

  // Create an array to store the query updates
  const updates = [];
  const values = [];
  
  // Dynamic field update logic
  if (username) {
    updates.push('username = $' + (values.length + 1));
    values.push(username);
  }

  if (email) {
    updates.push('email = $' + (values.length + 1));
    values.push(email);
  }

  if (password) {
    password = hashPassword(password);
    updates.push('password = $' + (values.length + 1));
    values.push(password);
  }

  if (age) {
    updates.push('age = $' + (values.length + 1));
    values.push(age);
  }

  // If no fields to update, return an error
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  // Add the ID to the values array for the WHERE clause
  values.push(id);

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
});



// DELETE route to delete a user by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully', deletedUser: result.rows[0] });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error deleting user' });
    }
  });
  

export default router;
