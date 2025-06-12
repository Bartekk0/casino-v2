import { pool } from './db';

export async function createWalletIfNotExists(userId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM wallets WHERE user_id = $1',
      [userId]
    );
    if (res.rowCount === 0) {
      await client.query(
        'INSERT INTO wallets (user_id, balance_cents) VALUES ($1, $2)',
        [userId, 0]
      );
    }
  } finally {
    client.release();
  }
}
