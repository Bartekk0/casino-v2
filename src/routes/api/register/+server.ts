import type { RequestHandler } from '@sveltejs/kit';
import { pool } from '../../../utils/db';
import { saltAndHashPassword } from '../../../utils/password';

export const POST: RequestHandler = async ({ request }) => {
	const client = await pool.connect();

	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return new Response(JSON.stringify({ error: 'Email i hasło są wymagane' }), { status: 400 });
		}

		await client.query('BEGIN');

		const existing = await client.query('SELECT * FROM users WHERE email = $1', [email]);
		if (existing.rows.length > 0) {
			await client.query('ROLLBACK');
			return new Response(JSON.stringify({ error: 'Użytkownik już istnieje' }), { status: 400 });
		}

		const hashedPassword = await saltAndHashPassword(password);

		const insertResult = await client.query(
			'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
			[email, hashedPassword]
		);
		const userId = insertResult.rows[0].id;

		await client.query(
			`INSERT INTO accounts (
				"userId",
				type,
				provider,
				"providerAccountId",
				refresh_token,
				access_token,
				expires_at,
				id_token,
				scope,
				session_state,
				token_type
			) VALUES (
				$1, 'credentials', 'credentials', $2, null, null, null, null, null, null, null
			)`,
			[userId, email]
		);

		await client.query('COMMIT');

		return new Response(JSON.stringify({ message: 'Zarejestrowano pomyślnie' }), { status: 201 });
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('Błąd przy rejestracji:', err);
		return new Response(JSON.stringify({ error: 'Coś poszło nie tak przy rejestracji' }), { status: 500 });
	} finally {
		client.release();
	}
};
