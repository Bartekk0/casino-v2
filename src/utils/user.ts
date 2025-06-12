import { pool } from './db';

export async function getUserByEmail(email: string) {
	const client = await pool.connect();
	try {
		const result = await client.query(
    `
      SELECT * FROM users WHERE email = $1;
    `,
			[email]
		);
		return result.rows[0];
	} finally {
		client.release();
	}
}