import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js'
import cookieRoutes from './routes/cookies.js';
import session from "express-session";
import passport from 'passport';
import './strategies/local-strategy.js'
import connectPgSimple from 'connect-pg-simple'; // Import connect-pg-simple
import { pool } from './db.js'; // Your PostgreSQL pool connection

const app = express();

// Initialize the session store with PostgreSQL
const PgSession = connectPgSimple(session);

//middleware för servern
app.use(cookieParser('evesteve')); // Pass secret here
app.use(express.json());
app.use(helmet());
app.use(cors()); //cross site terrorism

// Configure session to use PostgreSQL as the store
//sparar session data om servern startar om
app.use(session({
  store: new PgSession({
    pool: pool, // Use your existing PostgreSQL pool
    tableName: 'session', // Optional: default is 'session'
  }),
  secret: 'evesteve', // Replace with a more secure secret
  // sparar bara data när den modifieras - default är false
  saveUninitialized: false, // Don't save uninitialized sessions
  resave: false, // default är false
  cookie: {
    maxAge: 60000 * 60, // 1 hour
  },
}));

//efter session och före routes
app.use(passport.initialize())
app.use(passport.session())

// Use the user routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cookie', cookieRoutes);


//landing page
app.get('/', (req, res) => {
  console.log(req.session);
  console.log(req.session.id); // nytt id för varje omstart
  req.session.visited = true; // samma id vid omstart
  res.cookie('hello', 'world', {maxAge: 30000, signed: true});
  res.status(201).send('hello world');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// client_secret = MFr57JQJqDfDfWGzy0REimmsr2kFn8GF;
// client_id = 1283354168119132190

//url: http://localhost:3000/api/auth/discord/redirect