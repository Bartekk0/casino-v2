import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Credentials from '@auth/sveltekit/providers/credentials';
// import { saltAndHashPassword } from '@/utils/password';
import { saltAndHashPassword } from '../utils/password';
import PostgresAdapter from '@auth/pg-adapter';
// import pkg from 'pg';
// const { Pool } = pkg;
// import dotenv from 'dotenv';
// dotenv.config();
// // import { Pool } from 'pg';

// const pool = new Pool({
// 	host: process.env.DATABASE_HOST,
// 	user: process.env.DATABASE_USER,
// 	password: '' + process.env.DATABASE_PASSWORD,
// 	database: process.env.DATABASE_NAME,
// 	port: parseInt(process.env.DATABASE_PORT ?? '2665'),
// 	max: 20,
// 	idleTimeoutMillis: 30000,
// 	connectionTimeoutMillis: 2000
// });

import { pool } from '../utils/db';
import { comparePasswords } from "../utils/password"

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

// const getUserFromDb = async (email: string, password: string) => {
// 	const client = await pool.connect();
// 	const result = await client.query(
// 		/* sql */ `
// 	SELECT * FROM users WHERE email = $1 AND password = $2;
// 	`,
// 		[email, password]
// 	);

// 	console.log('Szukam użytkownika:', email, password);
// 	console.log('Wynik z bazy:', result.rows[0]);

// 	client.release();
// 	return result.rows[0];
// };


export async function getUserByEmail(email: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      /* sql */ `
      SELECT * FROM users WHERE email = $1;
    `,
      [email]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

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
					email: { label: "email" },
					password: { label: "password", type: "password" }
				},
				authorize: async (credentials) => {
					if (
						!credentials ||
						typeof credentials.email !== 'string' ||
						typeof credentials.password !== 'string'
					) {
						throw new Error('Invalid credentials');
					}

					// Pobierz użytkownika po emailu (bez sprawdzania hasła w zapytaniu)
					const user = await getUserByEmail(credentials.email);
					if (!user) {
						throw new Error('Invalid credentials');
					}

					// Porównaj podane hasło z zahashowanym w bazie
					const isValidPassword = await comparePasswords(credentials.password, user.password);
					if (!isValidPassword) {
						throw new Error('Invalid credentials');
					}

					// Zwróć usera, jeśli wszystko ok
					return user;
				}
			})
		],
		secret: process.env.AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
});
