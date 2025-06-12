import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const activeGames = new Map<string, { bombs: Set<number> }>();

export const POST: RequestHandler = async ({ request }) => {
	const { bombCount } = await request.json();

	if (bombCount > 24 || bombCount < 1) {
		return json({ error: 'Invalid bomb count' }, { status: 400 });
	}

	const indices = new Set<number>();
	while (indices.size < bombCount) {
		indices.add(Math.floor(Math.random() * 25));
	}

	const gameId = crypto.randomUUID();
	activeGames.set(gameId, { bombs: indices });

	return json({ gameId });
};