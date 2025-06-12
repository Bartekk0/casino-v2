import { redirect } from '@sveltejs/kit';
import { pool } from '../../utils/db';

export async function load({ locals }) {
	const session = await locals.getSession();

	if (!session) {
		throw redirect(302, '/');
	}

	const userId = session.user?.id;

	if (!userId) {
		throw redirect(302, '/');
	}

	const client = await pool.connect();
	try {
		const res = await client.query(
			'SELECT balance_cents FROM wallets WHERE user_id = $1',
			[userId]
		);

		if (res.rowCount === 0) {
			throw redirect(302, '/konto/brak-portfela');
		}

		const balance = res.rows[0].balance_cents / 100;

		return {
			session,
			balance
		};
	} finally {
		client.release();
	}
}
