import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Credentials from '@auth/sveltekit/providers/credentials';
import PostgresAdapter from '@auth/pg-adapter';
import { pool } from '../../utils/db';
import { comparePasswords } from '../../utils/password';
import { getUserByEmail } from '../../utils/user';

export const auth = SvelteKitAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!
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
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async signIn() {
      return true;
    }
  }
});