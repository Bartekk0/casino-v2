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

<div class={loading ? 'pointer-events-none' : ''}>
	<p class="mb-4 text-2xl font-bold">Balance: {balance.toFixed(2)}</p>
	<div class="mb-4 flex justify-center gap-8">
		<div class="flex flex-col items-center">
			<span class="mb-2 text-base font-semibold">Bombs</span>
			<input
				type="number"
				bind:value={bombCount}
				min="1"
				max="24"
				disabled={!gameOver || loading}
				class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center text-base transition outline-none focus:border-yellow-500"
			/>
		</div>
		<div class="flex flex-col items-center">
			<span class="mb-2 text-base font-semibold">Stake</span>
			<input
				type="number"
				bind:value={stake}
				min="1"
				max={balance}
				disabled={!gameOver || loading}
				class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center text-base transition outline-none focus:border-yellow-500"
			/>
		</div>
	</div>

	<div class="my-6 grid grid-cols-5 justify-center gap-2">
		{#each Array(25) as _, i}
			<button
				class="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-transparent bg-gray-300 text-lg font-bold transition-all
					hover:border-gray-500 hover:shadow-md
					{revealed.has(i) ? ' bg-yellow-100 text-yellow-800' : ''}
					{gameOver && bombs.includes(i) ? ' bg-yellow-500 text-white' : ''}"
				on:click={() => clickCell(i)}
				disabled={gameOver || loading}
			>
				{#if revealed.has(i)}
					<span class="text-base font-bold text-yellow-700"
						>x{individualMultipliers[i].toFixed(2)}</span
					>
				{:else if gameOver && bombs.includes(i)}
					<span class="text-2xl">💣</span>
				{/if}
			</button>
		{/each}
	</div>

	<div class="mt-4 flex justify-center gap-4">
		{#if gameOver}
			<button
				class="cursor-pointer rounded-xl border-none bg-gradient-to-r from-yellow-200 to-yellow-400 px-8 py-4 text-lg font-bold text-black transition hover:from-yellow-300 hover:to-yellow-500"
				on:click={startGame}
				disabled={stake > balance || waitStart}
			>
				Bet {stake ? stake.toFixed(2) : '-'}
			</button>
		{:else}
			<button
				class="cursor-pointer rounded-xl border-none bg-gradient-to-r from-yellow-200 to-yellow-400 px-8 py-4 text-lg font-bold text-black transition hover:from-yellow-300 hover:to-yellow-500"
				on:click={cashOut}
				disabled={loading}
			>
				Cash Out {(stake * multiplier).toFixed(2)}
			</button>
		{/if}
	</div>
</div>
