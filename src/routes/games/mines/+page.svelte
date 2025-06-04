<script lang="ts">
	let bombs: number[] = [];
	let revealed = new Set<number>();
	let started = false;
	let gameOver = true;
	let bombCount = 5;
	let balance = 100;
	let stake = 10;
	let multiplier = 1;
	let waitStart = false;
	const individualMultipliers: Record<number, number> = {};

	async function startGame() {
		console.log('sztart');
		waitStart = true;
		const res = await fetch(`/games/mines/place?bombs=${bombCount}`);
		const data = await res.json();
		waitStart = false;
		console.log('poczekalem');
		if (!res.ok) return;
		started = true;
		bombs = data.bombs;
		console.log(bombs);
		revealed = new Set();
		multiplier = 1;
		gameOver = false;
		balance -= stake;
	}

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
		const safeTiles = totalTiles - bombs.length;
		const s = revealed.size;

		if (s > safeTiles) return 0;

		const rawMultiplier = combination(totalTiles, s) / combination(safeTiles, s);

		const houseEdge = 0.99;
		return Math.floor((rawMultiplier * houseEdge)*100)/100;
	}

	function clickCell(i: number) {
		if (!started || revealed.has(i) || gameOver) return;

		if (bombs.includes(i)) {
			gameOver = true;
			multiplier = 0;
		} else {
			revealed = new Set([...revealed, i]);
			multiplier = calculateMultiplier()
			console.log(multiplier);
			individualMultipliers[i] = Number(multiplier.toFixed(2));
		}
	}

	function cashOut() {
		if (gameOver || !started) return;
		balance += stake * multiplier;
		started = false;
		gameOver = true;
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
			>
				{#if revealed.has(i)}
					<span class="multiplier">x{individualMultipliers[i]}</span>
				{:else if gameOver && bombs.includes(i)}
					💣
				{/if}
			</button>
		{/each}
	</div>

	<div class="controls">
		{#if gameOver}
			<button class="startbutton" on:click={startGame} disabled={stake > balance || waitStart}
				>Bet {stake ? stake.toFixed(2) : '-'}</button
			>
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
	}
	.revealed {
		background: #aaffaa;
	}
	.bomb {
		background: #ff6666;
	}
	.multiplier {
		color: green;
		font-size: 0.9rem;
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
