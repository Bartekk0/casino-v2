import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { pool } from '../../../utils/db';

type GameState = {
	bombs: number[];
	revealed: number[];
	gameOver: boolean;
	stake: number;
	bombCount: number;
	userId: number;
};

const games = new Map<string, GameState>();

function generateBombs(bombCount: number): number[] {
	const indices: number[] = [];
	while (indices.length < bombCount) {
		const rand = Math.floor(Math.random() * 25);
		if (!indices.includes(rand)) indices.push(rand);
	}
	return indices;
}

function generateGameId(): string {
	return Math.random().toString(36).substring(2, 10);
}

function factorial(n: number): number {
	let res = 1;
	for (let i = 2; i <= n; i++) res *= i;
	return res;
}

function combination(n: number, k: number): number {
	if (k > n || k < 0) return 0;
	return factorial(n) / (factorial(k) * factorial(n - k));
}

function calculateMultiplier(revealedCount: number, bombCount: number): number {
	const totalTiles = 25;
	const safeTiles = totalTiles - bombCount;

	if (revealedCount > safeTiles) return 0;

	const rawMultiplier = combination(totalTiles, revealedCount) / combination(safeTiles, revealedCount);
	const houseEdge = 0.99;
	return Math.floor(rawMultiplier * houseEdge * 100) / 100;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userId = Number(session.user.id);
	const { action, bombCount, stake, gameId, tile } = await request.json();

	if (action === 'start') {
		if (!bombCount || bombCount > 24 || !stake || stake <= 0) {
			return json({ error: 'Invalid bomb count or stake' }, { status: 400 });
		}

		const result = await pool.query(`SELECT balance_cents FROM wallets WHERE user_id = $1`, [userId]);
		const balance = result.rows[0]?.balance_cents ?? 0;
		const stakeCents = Math.round(stake * 100);

		if (balance < stakeCents) {
			return json({ error: 'Insufficient balance' }, { status: 400 });
		}

		await pool.query(
			`UPDATE wallets SET balance_cents = balance_cents - $1 WHERE user_id = $2`,
			[stakeCents, userId]
		);

		const id = generateGameId();
		const bombs = generateBombs(bombCount);
		games.set(id, {
			bombs,
			revealed: [],
			gameOver: false,
			stake: stakeCents,
			bombCount,
			userId
		});

		const balanceRes = await pool.query(`SELECT balance_cents FROM wallets WHERE user_id = $1`, [userId]);
		const updatedBalance = balanceRes.rows[0]?.balance_cents ?? 0;

		return json({ gameId: id, balance: updatedBalance / 100 });
	}

	if (action === 'click') {
		if (!gameId || !games.has(gameId)) return json({ error: 'Game not found' }, { status: 400 });

		const game = games.get(gameId)!;
		if (game.userId !== userId) return json({ error: 'Not your game' }, { status: 403 });

		if (game.gameOver) return json({ error: 'Game is over' }, { status: 400 });
		if (typeof tile !== 'number' || tile < 0 || tile >= 25 || game.revealed.includes(tile)) {
			return json({ error: 'Invalid tile' }, { status: 400 });
		}

		if (game.bombs.includes(tile)) {
			game.gameOver = true;
			return json({ hit: true, gameOver: true, bombs: game.bombs });
		} else {
			game.revealed.push(tile);
			return json({ hit: false, tile });
		}
	}

	if (action === 'cashout') {
		if (!gameId || !games.has(gameId)) return json({ error: 'Game not found' }, { status: 400 });

		const game = games.get(gameId)!;
		if (game.userId !== userId) return json({ error: 'Not your game' }, { status: 403 });

		if (game.gameOver) return json({ error: 'Game already over' }, { status: 400 });

		game.gameOver = true;
		const revealedCount = game.revealed.length;
		const multiplier = calculateMultiplier(revealedCount, game.bombCount);
		const payout = Math.floor(game.stake * multiplier);

		if (payout > 0) {
			await pool.query(
				`UPDATE wallets SET balance_cents = balance_cents + $1 WHERE user_id = $2`,
				[payout, userId]
			);
		}

		const balanceRes = await pool.query(`SELECT balance_cents FROM wallets WHERE user_id = $1`, [userId]);
		const updatedBalance = balanceRes.rows[0]?.balance_cents ?? 0;

		return json({ bombs: game.bombs, balance: updatedBalance / 100 });
	}

	return json({ error: 'Invalid action' }, { status: 400 });
};
