// src/routes/api/wallet/balance/+server.ts
import { json } from '@sveltejs/kit';
import { pool } from '../../../../utils/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userId = Number(session.user.id);
	const result = await pool.query(`SELECT balance_cents FROM wallets WHERE user_id = $1`, [userId]);
	const balanceCents = result.rows[0]?.balance_cents ?? 0;
	return json({ balance: balanceCents / 100 });
};
