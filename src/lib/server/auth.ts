import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Credentials from '@auth/sveltekit/providers/credentials';
import Google from '@auth/sveltekit/providers/google'
import PostgresAdapter from '@auth/pg-adapter';
import { pool } from '../../utils/db';
import { comparePasswords } from '../../utils/password';
import { getUserByEmail } from '../../utils/user';

export const auth = SvelteKitAuth({
  adapter: PostgresAdapter(pool),
  secret: process.env.AUTH_SECRET,
  trustHost: true,

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
        if (!credentials || typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
          throw new Error('Invalid credentials');
        }

        const user = await getUserByEmail(credentials.email);
        if (!user) throw new Error('Invalid credentials');

        const isValidPassword = await comparePasswords(credentials.password, user.password);
        if (!isValidPassword) throw new Error('Invalid credentials');

        return user;
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile}) {
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
          }
        } finally {
          client.release();
        }
      }

      return true;
    }
  }
});
