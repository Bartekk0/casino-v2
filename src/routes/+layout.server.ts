// +layout.server.ts
import { error } from '@sveltejs/kit';
import { pool } from '../utils/db';

export async function load({ locals }) {
  try {
    const session = await locals.getSession();

    if (!session?.user) {
      return { session: null, walletExists: false, balance: null };
    }

    const userId = Number(session.user.id);
    const client = await pool.connect();

    try {
      const res = await client.query('SELECT balance_cents FROM wallets WHERE user_id = $1', [userId]);

      if (res.rowCount === 0) {
        return {
          session,
          walletExists: false,
          balance: null
        };
      }

      const balance = res.rows[0].balance_cents / 100;

      return {
        session,
        walletExists: true,
        balance
      };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('LOAD ERROR:', err);
    throw error(500, 'Server error');
  }
}

