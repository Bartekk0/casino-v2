const activeGames = new Map<string, { bombs: Set<number> }>();

export function createGame(bombCount: number): { gameId: string } {
	if (bombCount < 1 || bombCount > 24) throw new Error('Invalid bomb count');

	const indices = new Set<number>();
	while (indices.size < bombCount) {
		indices.add(Math.floor(Math.random() * 25));
	}

	const gameId = crypto.randomUUID();
	activeGames.set(gameId, { bombs: indices });
	return { gameId };
}

export function clickTile(gameId: string, tileIndex: number): { result: boolean; bombs?: number[] } {
	const game = activeGames.get(gameId);
	if (!game) throw new Error('Game not found');

	const hitBomb = game.bombs.has(tileIndex);

	if (hitBomb) {
		const bombs = Array.from(game.bombs);
		activeGames.delete(gameId);
		return { result: false, bombs };
	}

	return { result: true };
}
