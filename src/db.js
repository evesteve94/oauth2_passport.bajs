import pkg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();
const { Pool } = pkg;

const {
  DB_USER, 
  DB_HOST, 
  DB_NAME, 
  DB_PASSWORD, 
  DB_PORT
} = process.env;

// Create a new PostgreSQL client using environment variables
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: Number(DB_PORT), // Convert port to number
  ssl: { rejectUnauthorized: false } // Adjust SSL settings as needed
});

// Export the pool
export { pool };

// Testing the database connection
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected successfully:', res.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();
