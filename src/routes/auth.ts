import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Credentials from '@auth/sveltekit/providers/credentials';
import { saltAndHashPassword } from '@/utils/password';
import PostgresAdapter from '@auth/pg-adapter';
import { Pool } from 'pg';

const pool = new Pool({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});

export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
	const authOptions = {
		adapter: PostgresAdapter(pool),
		providers: [
			GitHub({
				clientId: process.env.AUTH_GITHUB_ID ?? '',
				clientSecret: process.env.AUTH_GITHUB_SECRET ?? ''
			}),
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
