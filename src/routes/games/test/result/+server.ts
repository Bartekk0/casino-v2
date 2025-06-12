// src/routes/api/game/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

let balanceCents = 10000;

export const POST: RequestHandler = async ({ request }) => {
  const { action, stake, chance, rollAbove } = await request.json();

  if (action !== 'roll') {
    return json({ error: 'Invalid action' }, { status: 400 });
  }

  if (
    typeof stake !== 'number' ||
    stake <= 0 ||
    stake > balanceCents ||
    typeof chance !== 'number' ||
    chance < 1 ||
    chance > 100 ||
    typeof rollAbove !== 'boolean'
  ) {
    return json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const roll = Math.floor(Math.random() * 100) + 1;

  const win = rollAbove ? roll >= chance : roll <= chance;

  const multiplier = win ? Math.floor((100 / chance) * 0.99 * 100) / 100 : 0;

  const payoutCents = win ? Math.floor(stake * multiplier) : 0;

  balanceCents = balanceCents - stake + payoutCents;

  return json({
    roll,
    win,
    payout: payoutCents / 100,
    multiplier,
    balance: Math.floor(balanceCents) / 100,
    stake: stake / 100
  });
};
