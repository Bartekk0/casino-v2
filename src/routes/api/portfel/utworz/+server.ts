import type { RequestHandler } from '@sveltejs/kit';
import { pool } from '../../../../utils/db';

export const POST: RequestHandler = async ({ locals }) => {
    const session = await locals.getSession?.();

    if (!session?.user?.id) {
        return new Response(JSON.stringify({ error: 'Nie jesteś zalogowany' }), { status: 401 });
    }

    const userId = session.user.id;

    const client = await pool.connect();

    try {
        const checkRes = await client.query<{ user_id: number }>('SELECT * FROM wallets WHERE user_id = $1', [userId]);
        if ((checkRes.rowCount ?? 0) > 0) {
            return new Response(JSON.stringify({ message: 'Portfel już istnieje' }), { status: 200 });
        }

        await client.query('INSERT INTO wallets (user_id, balance_cents) VALUES ($1, $2)', [userId, 0]);

        return new Response(JSON.stringify({ message: 'Portfel utworzony pomyślnie' }), { status: 201 });
    } catch (error) {
        console.error('Błąd podczas tworzenia portfela:', error);
        return new Response(JSON.stringify({ error: 'Coś poszło nie tak' }), { status: 500 });
    } finally {
        client.release();
    }
};
