import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pool } from '../../../../utils/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession?.();

  if (!session?.user?.id) {
    return json({ error: 'Brak autoryzacji.' }, { status: 401 });
  }

  const { amount } = await request.json();

  if (typeof amount !== 'number' || amount <= 0) {
    return json({ error: 'Nieprawidłowa kwota.' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    const userId = Number(session.user.id);
    const amountCents = Math.floor(amount * 100);

    await client.query(
      'UPDATE wallets SET balance_cents = balance_cents + $1 WHERE user_id = $2',
      [amountCents, userId]
    );

    return json({ success: true });
  } catch (err) {
    console.error('Deposit error:', err);
    return json({ error: 'Błąd serwera.' }, { status: 500 });
  } finally {
    client.release();
  }
};
