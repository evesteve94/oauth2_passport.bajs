# Set up

Add .env file with proper connections to a pg-database and set up a table for users:
CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255),
discord_id VARCHAR(255),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

Additionally, add DISCORD_CLIENT_ID & DISCORD_CLIENT_SECRET to the .env-file to set up the Oath2 discord-strategy.
