import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { pool } from '../db.js'; // Assuming you have a database connection setup
import dotenv from 'dotenv'

const {
    DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
  } = process.env;
  

  //bestämmer hur användarens data ska bli 'serialized' i en session
passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user.id); // Store the user ID in the session
});

// de-codar serialized user tillbaka till json
passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user ID:', id);
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return done(new Error('User not found'), null);
        }
        done(null, result.rows[0]); // Return the user object
    } catch (err) {
        done(err, null);
    }
});


passport.use(new DiscordStrategy({
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/api/auth/discord/redirect',
    scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Discord Profile:', profile);
        
        const email = profile.email; // Use the email from Discord's profile
        const discordId = profile.id; // Discord ID
        const username = profile.username; // Discord username
        
        // Check if the user already exists by email
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            
            // Update the user record with Discord ID if it's missing
            if (!user.discord_id) {
                await pool.query('UPDATE users SET discord_id = $1 WHERE email = $2', [discordId, email]);
            }
            return done(null, user);
        } else {
            // If user doesn't exist, create a new user with Discord info
            const newUser = await pool.query(
                'INSERT INTO users (username, email, discord_id) VALUES ($1, $2, $3) RETURNING *',
                [username, email, discordId]
            );
            return done(null, newUser.rows[0]);
        }
    } catch (err) {
        done(err, null);
    }
}));

