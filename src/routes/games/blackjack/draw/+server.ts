import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pool } from '../../../../utils/db';

type Card = { suit: string; value: string };
type GameState = {
  deck: Card[];
  playerHands: Card[][];
  dealer: Card[];
  currentHand: number;
  splitAllowed: boolean;
  stake: number;
  userId: number;
};

const GAME_TTL = 1000 * 60 * 5;
const games = new Map<string, { state: GameState; created: number }>();

// helpers
const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function createDeck(): Card[] {
  const d: Card[] = [];
  for (const s of suits) for (const v of values) d.push({ suit: s, value: v });
  // shuffle
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function draw(deck: Card[], n: number): Card[] {
  return deck.splice(0, n);
}

function handValue(hand: Card[]): number {
  let total = 0, aces = 0;
  for (const c of hand) {
    if (c.value === 'A') { total += 11; aces++; }
    else if (['J','Q','K'].includes(c.value)) total += 10;
    else total += +c.value;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

// cleanup stale games
setInterval(() => {
  const now = Date.now();
  for (const [id, rec] of games) {
    if (now - rec.created > GAME_TTL) games.delete(id);
  }
}, 60_000);

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });
  const userId = Number(session.user.id);

  const { action, stake, gameId } = await request.json() as {
    action: 'start' | 'hit' | 'stand' | 'split';
    stake?: number;
    gameId?: string;
  };

  // ----- START -----
  if (action === 'start') {
    if (!stake || stake <= 0) return json({ error: 'Invalid stake' }, { status: 400 });
    // pobierz saldo
    const balRes = await pool.query('SELECT balance_cents FROM wallets WHERE user_id=$1', [userId]);
    const bal = balRes.rows[0]?.balance_cents ?? 0;
    const stakeC = Math.round(stake * 100);
    if (bal < stakeC) return json({ error: 'Insufficient balance' }, { status: 400 });
    // odejmij
    await pool.query('UPDATE wallets SET balance_cents = balance_cents - $1 WHERE user_id=$2', [stakeC, userId]);

    // rozdaj
    const deck = createDeck();
    const player = draw(deck, 2);
    const dealer = draw(deck, 2);
    const splitAllowed = player[0].value === player[1].value;

    const id = crypto.randomUUID();
    games.set(id, {
      created: Date.now(),
      state: {
        deck,
        playerHands: [player],
        dealer,
        currentHand: 0,
        splitAllowed,
        stake: stakeC,
        userId
      }
    });

    const newBalRes = await pool.query('SELECT balance_cents FROM wallets WHERE user_id=$1', [userId]);
    return json({
      gameId: id,
      player,
      dealer,
      splitAllowed,
      balance: (newBalRes.rows[0]?.balance_cents ?? 0) / 100
    });
  }

  // dalsze akcje wymagają istniejącego gameId:
  if (!gameId || !games.has(gameId)) return json({ error: 'Game not found' }, { status: 404 });
  const rec = games.get(gameId)!;
  const G = rec.state;
  if (G.userId !== userId) return json({ error: 'Not your game' }, { status: 403 });

  // pomocna funkcja: wykonaj fazę dealera i zakończ grę
  async function resolveDealer() {
    // dealer dobiera aż >=17
    while (handValue(G.dealer) < 17) {
      G.dealer.push(...draw(G.deck, 1));
    }
    const dealerVal = handValue(G.dealer);
    const outcomes: ('win' | 'lose' | 'draw')[] = [];
    let payoutTotal = 0;

    for (const hand of G.playerHands) {
      const pv = handValue(hand);
      let res: 'win' | 'lose' | 'draw' = 'draw';
      let pay = 0;
      if (pv > 21 || (dealerVal <= 21 && dealerVal > pv)) {
        res = 'lose';
      } else if (dealerVal > 21 || pv > dealerVal) {
        res = 'win';
        pay = G.stake * 2; // stake + winnings
      } else {
        res = 'draw';
        pay = G.stake;
      }
      outcomes.push(res);
      payoutTotal += pay;
    }

    // netto = payoutTotal - stake
    const net = payoutTotal - G.stake;
    if (net !== 0) {
      await pool.query(
        'UPDATE wallets SET balance_cents = balance_cents + $1 WHERE user_id = $2',
        [net, userId]
      );
    }

    G.actionPhase = 'finished';
    const balRes = await pool.query('SELECT balance_cents FROM wallets WHERE user_id=$1', [userId]);
    return { dealer: G.dealer, outcomes, balance: (balRes.rows[0]?.balance_cents ?? 0) / 100 };
  }

  // ----- HIT -----
  if (action === 'hit') {
    const hand = G.playerHands[G.currentHand];
    hand.push(...draw(G.deck, 1));
    // jeśli bust lub to ostatnia ręka po bust → dealer
    if (handValue(hand) > 21 || G.currentHand + 1 >= G.playerHands.length) {
      return json(await resolveDealer());
    }
    return json({ playerHands: G.playerHands, currentHand: G.currentHand });
  }

  // ----- STAND -----
  if (action === 'stand') {
    G.currentHand++;
    if (G.currentHand >= G.playerHands.length) {
      return json(await resolveDealer());
    }
    return json({ currentHand: G.currentHand });
  }

  // ----- SPLIT -----
  if (action === 'split') {
    if (!G.splitAllowed || G.playerHands.length > 1) {
      return json({ error: 'Cannot split' }, { status: 400 });
    }
    const hand0 = G.playerHands[0];
    const [c1, c2] = hand0;
    G.playerHands = [
      [c1, ...draw(G.deck, 1)],
      [c2, ...draw(G.deck, 1)]
    ];
    G.splitAllowed = false;
    return json({ playerHands: G.playerHands });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};