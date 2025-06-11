<script lang="ts">
	let gameId: string | null = null;
	let bombs: number[] = [];
	let revealed = new Set<number>();
	let gameOver = true;

	let bombCount = 5;
	let balance = 100;
	let stake = 10;
	let multiplier = 1;
	let waitStart = false;

	const individualMultipliers: Record<number, number> = {};

	function factorial(n: number) {
		if (n < 0) return NaN;
		let res = 1;
		for (let i = 2; i <= n; i++) res *= i;
		return res;
	}

	function combination(n: number, k: number) {
		if (k > n || k < 0) return 0;
		return factorial(n) / (factorial(k) * factorial(n - k));
	}

	function calculateMultiplier() {
		const totalTiles = 25;
		const safeTiles = totalTiles - bombCount;
		const s = revealed.size;

		if (s > safeTiles) return 0;

		const rawMultiplier = combination(totalTiles, s) / combination(safeTiles, s);

		const houseEdge = 0.99;
		return Math.floor(rawMultiplier * houseEdge * 100) / 100;
	}

	async function startGame() {
		if (stake > balance) return;
		waitStart = true;
		const res = await fetch('/games/mines', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'start', bombCount, stake }),
		});
		const data = await res.json();
		waitStart = false;
		if (!res.ok) {
			alert(data.error);
			return;
		}
		gameId = data.gameId;
		revealed = new Set();
		bombs = [];
		gameOver = false;
		multiplier = 1;
		balance -= stake;
		for (const key in individualMultipliers) delete individualMultipliers[key];
	}

	async function clickCell(i: number) {
		if (!gameId || gameOver || revealed.has(i)) return;

		const res = await fetch('/games/mines', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'click', gameId, tile: i }),
		});
		const data = await res.json();
		if (!res.ok) {
			alert(data.error);
			return;
		}
		if (data.hit) {
			gameOver = true;
			bombs = data.bombs;
		} else {
			revealed.add(data.tile);
			multiplier = calculateMultiplier();
			individualMultipliers[data.tile] = multiplier;
		}
	}

	async function cashOut() {
		if (!gameId || gameOver) return;

		const res = await fetch('/games/mines', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'cashout', gameId }),
		});
		const data = await res.json();
		if (!res.ok) {
			alert(data.error);
			return;
		}
		gameOver = true;
		bombs = data.bombs;
		balance += stake * multiplier;
	}

</script>

<div>
	<p>Balance: {balance.toFixed(2)}</p>
	<label>
		Bombs:
		<input type="number" bind:value={bombCount} min="1" max="24" disabled={!gameOver} />
	</label>
	<p></p>
	<label>
		Stake:
		<input type="number" bind:value={stake} min="1" max={balance} disabled={!gameOver} />
	</label>

	<div class="grid">
		{#each Array(25) as _, i}
			<button
				class="cell {revealed.has(i) ? 'revealed' : ''} {gameOver && bombs.includes(i)
					? 'bomb'
					: ''}"
				on:click={() => clickCell(i)}
				disabled={gameOver}
			>
				{#if revealed.has(i)}
					<span class="multiplier">x{individualMultipliers[i].toFixed(2)}</span>
				{:else if gameOver && bombs.includes(i)}
					💣
				{/if}
			</button>
		{/each}
	</div>

	<div class="controls">
		{#if gameOver}
			<button class="startbutton" on:click={startGame} disabled={stake > balance || waitStart}>
				Bet {stake ? stake.toFixed(2) : '-'}
			</button>
		{:else}
			<button class="cashout" on:click={cashOut}>Cash Out {(stake * multiplier).toFixed(2)}</button>
		{/if}
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(5, 60px);
		gap: 4px;
		margin: 1rem 0;
	}
	.cell {
		width: 60px;
		height: 60px;
		background: #ccc;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-weight: bold;
		transition: background-color 0.3s;
	}
	.cell:hover {
		background-color: #ddd;
	}
	.revealed {
		background: #aaffaa;
		color: green;
	}
	.bomb {
		background: #ff6666;
		color: white;
	}
	.multiplier {
		color: green;
		font-size: 0.9rem;
		font-weight: bold;
	}
	.startbutton,
	.cashout {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: fit-content;

		padding: 15px;
		height: 45px;
		border: 2px solid green;
		background: greenyellow;
		color: green;
		font-weight: 900;
		cursor: pointer;
		transition: background-color 0.3s;
	}
	.startbutton:hover,
	.cashout:hover {
		background: lightgreen;
	}
	.startbutton:active,
	.cashout:active {
		background: #aaffaa;
	}
</style>
