import type { PageServerLoad } from './$types';
import { pool } from '../../../utils/db';

export const load: PageServerLoad = async ({ locals }) => {
    const session = await locals.getSession();

    const userId = session?.user?.id;
    if (!userId) {
        return { balance: 0 };
    }

    const client = await pool.connect();
    try {
        const res = await client.query('SELECT balance_cents FROM wallets WHERE user_id = $1', [userId]);
        if (res.rowCount === 0) {
            return { balance: 0 };
        }
        const balance = res.rows[0].balance_cents / 100;
        return { balance };
    } finally {
        client.release();
    }
};
