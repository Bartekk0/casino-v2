import type { RequestHandler } from '@sveltejs/kit';
import { pool } from '../../../utils/db';
import { saltAndHashPassword } from '../../../utils/password';

export const POST: RequestHandler = async ({ request }) => {
	const client = await pool.connect();

	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return new Response(JSON.stringify({ error: 'Email and password are required' }), {
				status: 400
			});
		}

		await client.query('BEGIN');

		const existing = await client.query('SELECT * FROM users WHERE email = $1', [email]);
		if (existing.rows.length > 0) {
			await client.query('ROLLBACK');
			return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400 });
		}

		const hashedPassword = await saltAndHashPassword(password);

		await client.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', [
			email,
			hashedPassword
		]);
		await client.query('COMMIT');

		return new Response(JSON.stringify({ message: 'Registered successfully' }), { status: 201 });
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('Registration error:', err);
		return new Response(JSON.stringify({ error: 'Something went wrong during registration' }), {
			status: 500
		});
	} finally {
		client.release();
	}
};
