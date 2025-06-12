import { error } from '@sveltejs/kit';
import { pool } from '../utils/db';

export async function load({ locals }) {
  try {
    const session = await locals.getSession();

    if (!session?.user) {
      return { session: null, balance: null };
    }

    const userId = Number(session.user.id);
    const client = await pool.connect();

    try {
      const res = await client.query('SELECT balance_cents FROM wallets WHERE user_id = $1', [userId]);

      const balance = (res.rowCount??0) > 0 ? res.rows[0].balance_cents / 100 : 0;

      return {
        session,
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
