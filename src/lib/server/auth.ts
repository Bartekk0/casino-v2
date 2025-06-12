import { SvelteKitAuth, CredentialsSignin } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Credentials from '@auth/sveltekit/providers/credentials';
import Google from '@auth/sveltekit/providers/google';
import PostgresAdapter from '@auth/pg-adapter';
import { pool } from '../../utils/db';
import { comparePasswords } from '../../utils/password';
import { getUserByEmail } from '../../utils/user';
import type { Adapter } from '@auth/core/Adapter';

class InvalidLoginError extends CredentialsSignin {
	code = 'Invalid identifier or password';
}

const baseAdapter = PostgresAdapter(pool) as Adapter;

export const customAdapter: Adapter = {
	...baseAdapter,
	async linkAccount(account) {
		console.log('Zablokowano automatyczne łączenie kont', account);
		return;
	}
};

export const auth = SvelteKitAuth({
	adapter: customAdapter,
	secret: process.env.AUTH_SECRET,
	trustHost: true,
	debug: true,
	pages: {
		signIn: '/login',
		signOut: '/logout'
	},
	providers: [
		GitHub({
			clientId: process.env.AUTH_GITHUB_ID!,
			clientSecret: process.env.AUTH_GITHUB_SECRET!
		}),
		Google({
			clientId: process.env.AUTH_GOOGLE_ID!,
			clientSecret: process.env.AUTH_GOOGLE_SECRET!
		}),
		Credentials({
			credentials: {
				email: { label: 'email' },
				password: { label: 'password', type: 'password' }
			},
			authorize: async (credentials) => {
				if (
					!credentials ||
					typeof credentials.email !== 'string' ||
					typeof credentials.password !== 'string'
				) {
					throw new InvalidLoginError();
				}

				const user = await getUserByEmail(credentials.email);
				if (!user) throw new InvalidLoginError();

				const isValidPassword = await comparePasswords(credentials.password, user.password);
				if (!isValidPassword) throw new InvalidLoginError();

				return {
					id: `${user.id}`,
					name: user.name ?? null,
					email: user.email,
					image: user.image ?? null
				};
			}
		})
	],

	callbacks: {
		async signIn({ user, account, profile }) {
			console.log('signIn callback', { user, account, profile });
			if (account?.provider === 'github' && account.access_token) {
				const res = await fetch('https://api.github.com/user/emails', {
					headers: {
						Authorization: `token ${account.access_token}`,
						Accept: 'application/vnd.github.v3+json'
					}
				});

				const emails = await res.json();

				const primaryEmail = emails.find((email: any) => email.primary && email.verified);
				if (primaryEmail?.email) {
					user.email = primaryEmail.email;
				}
			}

			if (account?.provider === 'google' && profile?.email) {
				user.email = profile.email;
			}

			if (user.email) {
				const client = await pool.connect();
				try {
					const result = await client.query('SELECT * FROM users WHERE email = $1', [user.email]);

					if (result.rows.length > 0) {
						const existingUser = result.rows[0];
						user.id = existingUser.id;

						// Dopisanie konta, jeśli potrzeba
						await client.query(
							`INSERT INTO accounts (
					"userId", type, provider, "providerAccountId",
					refresh_token, access_token, expires_at, id_token,
					scope, session_state, token_type
				) VALUES (
					$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
				) ON CONFLICT DO NOTHING`,
							[
								existingUser.id,
								account?.type,
								account?.provider,
								account?.providerAccountId,
								account?.refresh_token,
								account?.access_token,
								account?.expires_at,
								account?.id_token,
								account?.scope,
								account?.session_state,
								account?.token_type
							]
						);

						// Dopisanie portfela, jeśli nie istnieje
						const walletRes = await client.query(
							'SELECT * FROM wallets WHERE user_id = $1',
							[existingUser.id]
						);
						if (walletRes.rows.length === 0) {
							await client.query(
								'INSERT INTO wallets (user_id, balance_cents) VALUES ($1, $2)',
								[existingUser.id, 0]
							);
						}
					}
				} finally {
					client.release();
				}
			}

			return true;
		},

		async session({ session, user }) {
			if (user) {
				session.user = {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image ?? null,
					emailVerified: user.emailVerified ?? null
				};
			}
			return session;
		}
	}
});
