import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

type GameState = {
	bombs: number[];
	revealed: number[];
	gameOver: boolean;
	stake: number;
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

function createGame(bombCount: number, stake: number): GameState {
	const bombs = generateBombs(bombCount);
	return {
		bombs,
		revealed: [],
		gameOver: false,
		stake,
	};
}

function generateGameId() {
	return Math.random().toString(36).substring(2, 10);
}

export const POST: RequestHandler = async ({ request }) => {
	const { action, bombCount, stake, gameId, tile } = await request.json();

	if (action === 'start') {
		if (!bombCount || bombCount > 24) {
			return json({ error: 'Invalid bomb count' }, { status: 400 });
		}
		if (!stake || stake <= 0) {
			return json({ error: 'Invalid stake' }, { status: 400 });
		}
		const id = generateGameId();
		const game = createGame(bombCount, stake);
		games.set(id, game);
		return json({ gameId: id });
	}

	if (action === 'click') {
		if (!gameId || !games.has(gameId)) {
			return json({ error: 'Game not found' }, { status: 400 });
		}
		const game = games.get(gameId)!;
		if (game.gameOver) {
			return json({ error: 'Game is over' }, { status: 400 });
		}
		if (typeof tile !== 'number' || tile < 0 || tile >= 25) {
			return json({ error: 'Invalid tile' }, { status: 400 });
		}
		if (game.revealed.includes(tile)) {
			return json({ error: 'Tile already revealed' }, { status: 400 });
		}
		if (game.bombs.includes(tile)) {
			game.gameOver = true;
			return json({ hit: true, gameOver: true, bombs: game.bombs });
		} else {
			game.revealed.push(tile);
			return json({ hit: false, gameOver: false, tile });
		}
	}

	if (action === 'cashout') {
		if (!gameId || !games.has(gameId)) {
			return json({ error: 'Game not found' }, { status: 400 });
		}
		const game = games.get(gameId)!;
		game.gameOver = true;
		return json({ gameOver: true, bombs: game.bombs });
	}

	return json({ error: 'Invalid action' }, { status: 400 });
};
