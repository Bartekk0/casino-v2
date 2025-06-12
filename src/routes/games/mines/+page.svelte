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
	let loading = false;

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
		if (stake > balance || loading) return;
		loading = true;
		waitStart = true;

		const res = await fetch('/games/mines', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'start', bombCount, stake })
		});

		waitStart = false;
		loading = false;

		const data = await res.json();
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
		loading = true;
		const res = await fetch('/games/mines', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'click', gameId, tile: i })
		});
		loading = false;
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
			revealed = new Set<number>(revealed);
			multiplier = calculateMultiplier();
			individualMultipliers[data.tile] = multiplier;
		}
	}

	async function cashOut() {
		if (!gameId || gameOver) return;
		loading = true;

		const res = await fetch('/games/mines', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'cashout', gameId })
		});
		loading = false;
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

<div class:loading>
	<p>Balance: {balance.toFixed(2)}</p>
	<div class="inputs">
		<div class="input-group">
			<label>Bombs</label>
			<input
				type="number"
				bind:value={bombCount}
				min="1"
				max="24"
				disabled={!gameOver || loading}
			/>
		</div>
		<div class="input-group">
			<label>Stake</label>
			<input
				type="number"
				bind:value={stake}
				min="1"
				max={balance}
				disabled={!gameOver || loading}
			/>
		</div>
	</div>

	<div class="grid">
		{#each Array(25) as _, i}
			<button
				class="cell {revealed.has(i) ? 'revealed' : ''} {gameOver && bombs.includes(i)
					? 'bomb'
					: ''}"
				on:click={() => clickCell(i)}
				disabled={gameOver || loading}
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
			<button class="cashout" on:click={cashOut} disabled={loading}
				>Cash Out {(stake * multiplier).toFixed(2)}</button
			>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background: #f2f4f7;
		color: #333;
		margin: 0;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
	}

	p {
		font-size: 1.8rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	.inputs {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 1rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.input-group label {
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	input[type='number'] {
		width: 100px;
		padding: 0.5rem 0.75rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		font-size: 1.2rem;
		text-align: center;
		outline: none;
		transition: border 0.2s;
	}

	input[type='number']:focus {
		border-color: #4caf50;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(5, 90px);
		gap: 8px;
		margin: 1.5rem 0;
	}

	.cell {
		width: 90px;
		height: 90px;
		background: #ddd;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		cursor: pointer;
		font-weight: bold;
		font-size: 1.3rem;
		border: 2px solid transparent;
		transition: all 0.2s ease;
	}

	.cell:hover {
		border-color: #888;
		box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
	}

	.revealed {
		background: #d4f8d4;
		color: #2e7d32;
	}

	.bomb {
		background: #ff4d4d;
		color: white;
	}

	.multiplier {
		color: #388e3c;
		font-size: 1rem;
		font-weight: bold;
	}

	.controls {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
		gap: 1rem;
	}

	.startbutton,
	.cashout {
		padding: 1rem 2rem;
		font-size: 1.2rem;
		border-radius: 10px;
		border: none;
		background: linear-gradient(to right, #a2ff86, #70db70);
		color: #044d00;
		font-weight: bold;
		cursor: pointer;
		transition: background 0.3s;
	}

	.startbutton:hover,
	.cashout:hover {
		background: linear-gradient(to right, #90ee90, #57c457);
	}

	/*.startbutton:disabled,
	 .cashout:disabled {
		background: #ccc;
		color: #666;
		cursor: not-allowed;
	} */ 
</style>
