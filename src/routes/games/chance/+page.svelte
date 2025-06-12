<script lang="ts">
	import { onMount } from 'svelte';
	export let data: { balance: number };
	let chance = 50;
	let rollAbove = false;
	let stake = 10.0;
	let balance = data.balance ?? 0;
	let multiplier = 0;
	let roll = 0;
	let win = false;
	let payout = 0;
	let message = '';
	let loading = false;

	function formatMoney(value: number) {
		return ((value * 100) / 100).toFixed(2);
	}

	$: {
		const actualChance = rollAbove ? 100 - chance + 1 : chance;
		multiplier = (100 / actualChance) * 0.99;
	}

	let displayChance = 0;
	$: displayChance = rollAbove ? 100 - chance + 1 : chance;

	async function startGame() {
		if (loading) return;
		if (stake <= 0 || stake > balance) {
			alert('Nieprawidłowa kwota zakładu!');
			return;
		}
		loading = true;
		message = '';
		const res = await fetch('/games/chance/result', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				action: 'roll',
				stake: Math.floor(stake * 100),
				chance,
				rollAbove
			})
		});
		const data = await res.json();
		loading = false;
		if (!res.ok) {
			alert(data.error || 'Server error');
			return;
		}
		roll = data.roll;
		win = data.win;
		payout = data.payout;
		balance = data.balance;

		message = win ? `You Won!` : `You Lost! Try again`;
	}
</script>

<main>
	<h1>Chance</h1>
	<div class="balance">Balance: {formatMoney(balance)}</div>

	<div class="options">
		<label for="chanceRange">Your number: {chance}</label>
		<input
			type="range"
			id="chanceRange"
			min={rollAbove ? 3 : 1}
			max={rollAbove ? 100 : 98}
			bind:value={chance}
			disabled={loading}
			style="
		background: {rollAbove
				? `linear-gradient(to right, #e74c3c 0%, #e74c3c ${chance}%, #f1c40f ${chance}%, #f1c40f 100%)`
				: `linear-gradient(to right, #f1c40f 0%, #f1c40f ${chance}%, #e74c3c ${chance}%, #e74c3c 100%)`};
	"
		/>

		<label class="checkbox-label">
			<input type="checkbox" bind:checked={rollAbove} disabled={loading} />
			{rollAbove ? 'Higher (≥)' : 'Lower (≤)'}
		</label>

		<div class="multiplier">
			Chance: {displayChance}%<br />
			Multiplier: x{Math.floor(multiplier * 100) / 100}
		</div>

		<label for="stakeInput">Stake :</label>
		<input
			type="number"
			id="stakeInput"
			min="0.01"
			max={balance}
			step="0.01"
			bind:value={stake}
			disabled={loading}
		/>
	</div>

	<button on:click={startGame} disabled={loading || stake > balance || stake <= 0}>
		{loading ? 'Pending...' : 'Play'}
	</button>

	{#if message}
		<div class="info">
			<div>{message}</div>
			<div>Number: {roll}</div>
			<div>Payout: {win ? formatMoney(payout) : '0'}</div>
		</div>
	{/if}
</main>

<style>
	main {
		width: 600px;
		max-width: 1080px;
		margin: 3rem auto;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		padding: 3rem;
		border-radius: 16px;
		text-align: center;
		color: #fff;
	}

	h1 {
		margin-bottom: 2rem;
		color: #f1c40f;
		font-size: 2.4rem;
	}

	.balance {
		font-size: 1.7rem;
		font-weight: 700;
		margin-bottom: 2rem;
		color: #f1c40f;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		text-align: left;
		margin-bottom: 2rem;
		width: 100%;
	}

	label {
		font-weight: 600;
		color: #fff;
		font-size: 1.15rem;
	}

	input[type='range'] {
		width: 100%;
		height: 16px;
		border-radius: 8px;
		cursor: pointer;
		background: transparent;
		-webkit-appearance: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 20px;
		height: 20px;
		background: #fff;
		border: 2px solid #f1c40f;
		border-radius: 50%;
		margin-top: -7px;
		position: relative;
		z-index: 2;
	}

	input[type='range']::-webkit-slider-runnable-track {
		height: 6px;
		border-radius: 8px;
		background: linear-gradient(
			to right,
			#f1c40f 0%,
			#f1c40f var(--progress),
			#e74c3c var(--progress),
			#e74c3c 100%
		);
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: #fff;
		border: 2px solid #f1c40f;
		border-radius: 50%;
		cursor: pointer;
	}

	input[type='range']::-moz-range-track {
		height: 6px;
		border-radius: 8px;
		background: linear-gradient(
			to right,
			#f1c40f 0%,
			#f1c40f var(--progress),
			#e74c3c var(--progress),
			#e74c3c 100%
		);
	}

	input[type='number'] {
		width: 100%;
		padding: 0.8rem;
		font-size: 1.1rem;
		border-radius: 10px;
		border: 1px solid #555;
		background: #1e1e1e;
		color: #fff;
		box-sizing: border-box;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-weight: 600;
		color: #fff;
		margin-top: 0.5rem;
		cursor: pointer;
		user-select: none;
		font-size: 1.05rem;
	}

	.checkbox-label input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: #f1c40f;
	}

	.multiplier {
		font-size: 1.3rem;
		font-weight: 700;
		color: #f1c40f;
	}

	button {
		background: #f1c40f;
		color: #000;
		border: none;
		padding: 1.1rem;
		font-size: 1.3rem;
		border-radius: 12px;
		cursor: pointer;
		width: 100%;
		transition:
			background-color 0.3s ease,
			transform 0.1s;
		box-shadow: 0 6px 12px rgba(241, 196, 15, 0.4);
	}
	button:hover:not(:disabled) {
		background: #ffd700;
		transform: scale(1.02);
	}
	button:disabled {
		background: #555;
		color: #ccc;
		cursor: not-allowed;
		box-shadow: none;
	}

	.info {
		margin-top: 2rem;
		background: #1f1f1f;
		padding: 1.2rem;
		border-radius: 12px;
		font-size: 1.15rem;
		font-weight: 600;
		color: #ffffff;
		line-height: 1.6;
		box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.05);
	}
</style>
