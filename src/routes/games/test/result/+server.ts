import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { pool } from '../../../../utils/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const { action, stake, chance, rollAbove } = await request.json();

  if (action !== 'roll') {
    return json({ error: 'Invalid action' }, { status: 400 });
  }

  if (
    typeof stake !== 'number' ||
    stake <= 0 ||
    typeof chance !== 'number' ||
    chance < 1 ||
    chance > 100 ||
    typeof rollAbove !== 'boolean'
  ) {
    return json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    // Pobierz saldo z bazy (w groszach)
    const res = await client.query('SELECT balance_cents FROM wallets WHERE user_id = $1', [userId]);

    if (res.rowCount === 0) {
      return json({ error: 'Wallet not found' }, { status: 404 });
    }

    const currentBalance = res.rows[0].balance_cents;

    if (stake > currentBalance) {
      return json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Losowanie
    const roll = Math.floor(Math.random() * 100) + 1;
    const win = rollAbove ? roll >= chance : roll <= chance;

    // Mnożnik wygranej (uwzględnia house edge 1%)
    const multiplier = win ? Math.floor((100 / chance) * 0.99 * 100) / 100 : 0;

    const payout = win ? Math.floor(stake * multiplier) : 0;

    // Aktualizacja salda w bazie
    const newBalance = currentBalance - stake + payout;

    await client.query('UPDATE wallets SET balance_cents = $1 WHERE user_id = $2', [newBalance, userId]);

    return json({
      roll,
      win,
      payout: payout / 100,
      multiplier,
      balance: newBalance / 100,
      stake: stake / 100
    });
  } catch (err) {
    console.error('Game error:', err);
    throw error(500, 'Internal server error');
  } finally {
    client.release();
  }
};
