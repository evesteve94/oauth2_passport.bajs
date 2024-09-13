import passport from "passport";
import { Strategy } from 'passport-local';
import { pool } from '../db.js'; // Connect to your PostgreSQL pool
import { comparePassword } from '../utils/helpers.js'; // Import your comparePassword function

/*
-----------------------------------------------------------------------------------------------------------------
1. serializeUser
This function determines what user data should be stored in the session.
Typically, only a unique identifier (like user.id) is stored to minimize the amount of data saved in the session.
Storing only the id allows you to look up the full user information later when needed.
-----------------------------------------------------------------------------------------------------------------
*/

passport.serializeUser((user, done) => {
    console.log(`Inside serialized user:`);
    console.log(user);
    done(null, user.id); // Store the user ID in the session
});

/*
-----------------------------------------------------------------------------------------------------------------
2. deserializeUser
This function takes the id that was serialized into the session and retrieves the full user object from the database.
It runs on each request that requires user information and populates req.user with the full user object for easy access.
-----------------------------------------------------------------------------------------------------------------
*/

passport.deserializeUser(async (id, done) => {
    console.log(`Inside Deserialized user(id):`);
    console.log(id);
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return done(new Error("User not found"), null);
        }
        done(null, result.rows[0]); // Return the user from the database
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new Strategy({ usernameField: 'username' }, async (username, password, done) => {
        try {
            // Query the database for the user by username
            const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

            if (result.rows.length === 0) {
                // If no user is found, return an error
                return done(null, false, { message: "User not found" });
            }

            const user = result.rows[0];

            // If the user is from OAuth (Discord) and has no password, disallow local login
            if (!user.password) {
                return done(null, false, { message: "This account was created using Discord. Please log in using Discord." });
            }

            // Use your comparePassword function to check if the provided password matches the stored hashed password
            const passwordMatch = comparePassword(password, user.password);
            
            if (!passwordMatch) {
                // If the password doesn't match, return an error
                return done(null, false, { message: "Invalid credentials" });
            }

            // If everything is fine, return the user
            return done(null, user);

        } catch (err) {
            return done(err);
        }
    })
);
