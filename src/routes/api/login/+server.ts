import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { getUserByEmail } from '../../../utils/user';
import { comparePasswords } from '../../../utils/password';
import { pool } from '../../../utils/db';
import { randomUUID } from 'crypto';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { email, password } = await request.json();

	if (!email || !password) {
		return json({ error: 'Missing credentials' }, { status: 400 });
	}

	const user = await getUserByEmail(email);
	if (!user || !(await comparePasswords(password, user.password))) {
		return json({ error: 'Invalid credentials' }, { status: 401 });
	}

	const sessionToken = randomUUID();
	const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 

	await pool.query(
		`INSERT INTO sessions ("sessionToken", "userId", "expires") VALUES ($1, $2, $3)`,
		[sessionToken, user.id, expires.toISOString()]
	);

	// 🍪 Ustawiamy cookie!
	cookies.set('authjs.session-token', sessionToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		expires
	});

	// Możesz przekierować lub zwrócić JSON
	return json({ success: true });
};
