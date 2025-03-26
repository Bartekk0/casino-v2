import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Credentials from '@auth/sveltekit/providers/credentials';
// import { saltAndHashPassword } from '@/utils/password';
import { saltAndHashPassword } from '../utils/password';
import PostgresAdapter from '@auth/pg-adapter';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();
// import { Pool } from 'pg';

const pool = new Pool({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: '' + process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	port: parseInt(process.env.DATABASE_PORT ?? '2665'),
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});

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
	
	PRIMARY KEY (id)
	);
	`);
	console.log('Database initialized');

	client.release();
};

const getUserFromDb = async (email: string, password: string) => {
	const client = await pool.connect();
	const result = await client.query(
		/* sql */ `
	SELECT * FROM users WHERE email = $1 AND password = $2;
	`,
		[email, password]
	);

	client.release();
	return result.rows[0];
};

export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
	const authOptions = {
		adapter: PostgresAdapter(pool),
		providers: [
			// GitHub({
			// 	clientId: process.env.AUTH_GITHUB_ID ?? '',
			// 	clientSecret: process.env.AUTH_GITHUB_SECRET ?? ''
			// }),
			Credentials({
				// You can specify which fields should be submitted, by adding keys to the `credentials` object.
				// e.g. domain, username, password, 2FA token, etc.
				credentials: {
					email: {},
					password: {}
				},
				authorize: async (credentials) => {
					let user = null;

					// logic to salt and hash password
					const pwHash = saltAndHashPassword(credentials.password as string);

					// logic to verify if user exists
					user = await getUserFromDb(credentials.email, pwHash);
					console.log('user', user);

					if (!user) {
						// No user found, so this is their first attempt to login
						// Optionally, this is also the place you could do a user registration
						throw new Error('Invalid credentials.');
					}

					// return JSON object with the user data
					return user;
				}
			})
		],
		secret: process.env.AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
});
