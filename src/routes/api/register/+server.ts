import type { RequestHandler } from '@sveltejs/kit';
import { pool } from '../../../utils/db';
import { saltAndHashPassword } from '../../../utils/password'; // dopasuj ścieżkę

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password } = await request.json();

		// prosta walidacja
		if (!email || !password) {
			return new Response(JSON.stringify({ error: 'Email i hasło są wymagane' }), { status: 400 });
		}

		const client = await pool.connect();

		// sprawdź czy istnieje
		const existing = await client.query('SELECT * FROM users WHERE email = $1', [email]);
		if (existing.rows.length > 0) {
			client.release();
			return new Response(JSON.stringify({ error: 'Użytkownik już istnieje' }), { status: 400 });
		}

		// zhashuj hasło
		const hashedPassword = await saltAndHashPassword(password);

		// wstaw nowego użytkownika z zahashowanym hasłem
		await client.query(
			'INSERT INTO users (email, password) VALUES ($1, $2)',
			[email, hashedPassword]
		);

		client.release();

		return new Response(JSON.stringify({ message: 'Zarejestrowano pomyślnie' }), { status: 201 });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: 'Coś poszło nie tak' }), { status: 500 });
	}
};
