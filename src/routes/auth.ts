import { pool } from '../utils/db';

export const initDB = async () => {
	const client = await pool.connect();
	await client.query(/* sql */ `
	CREATE TABLE IF NOT EXISTS verification_token
	(
		identifier TEXT NOT NULL,
		expires TIMESTAMPTZ NOT NULL,
		token TEXT NOT NULL,
		
		PRIMARY KEY (identifier, token)
	);
	
	CREATE TABLE IF NOT EXISTS accounts
	(
	id SERIAL,
	"userId" INTEGER NOT NULL,
	type VARCHAR(255) NOT NULL,
	provider VARCHAR(255) NOT NULL,
	"providerAccountId" VARCHAR(255) NOT NULL,
	refresh_token TEXT,
	access_token TEXT,
	expires_at BIGINT,
	id_token TEXT,
	scope TEXT,
	session_state TEXT,
	token_type TEXT,
	
	PRIMARY KEY (id)
	);
	
	CREATE TABLE IF NOT EXISTS sessions
	(
	id SERIAL,
	"userId" INTEGER NOT NULL,
	expires TIMESTAMPTZ NOT NULL,
	"sessionToken" VARCHAR(255) NOT NULL,
	
	PRIMARY KEY (id)
	);
	
	CREATE TABLE IF NOT EXISTS users
	(
	id SERIAL,
	name VARCHAR(255),
	email VARCHAR(255),
	"emailVerified" TIMESTAMPTZ,
	image TEXT,
	password VARCHAR(255)
	
	PRIMARY KEY (id)
	);

	CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance_cents INTEGER NOT NULL DEFAULT 0
  );

	`);
	console.log('Database initialized');

	client.release();
};
