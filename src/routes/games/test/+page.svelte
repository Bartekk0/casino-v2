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
		const res = await fetch('/games/test/result', {
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
			alert(data.error || 'Błąd serwera');
			return;
		}
		roll = data.roll;
		win = data.win;
		payout = data.payout;
		balance = data.balance;

		message = win ? `Wygrałeś!` : `Przegrałeś! Spróbuj ponownie.`;
	}
</script>

<main>
	<h1>Prosta Gra Hazardowa</h1>
	<div class="balance">Saldo: {formatMoney(balance)} zł</div>

	<div class="options">
		<label for="chanceRange">Wybrana liczba: {chance}</label>
		<input
			type="range"
			id="chanceRange"
			min={rollAbove ? 3 : 1}
			max={rollAbove ? 100 : 98}
			bind:value={chance}
			disabled={loading}
			style="--slider-bg: {rollAbove
				? `linear-gradient(to right, #e74c3c 0%, #e74c3c ${chance}%, #2ecc71 ${chance}%, #2ecc71 100%)`
				: `linear-gradient(to right, #2ecc71 0%, #2ecc71 ${chance}%, #e74c3c ${chance}%, #e74c3c 100%)`}"
		/>

		<label class="checkbox-label">
			<input type="checkbox" bind:checked={rollAbove} disabled={loading} on:change={() => {}} />
			{rollAbove ? 'Wyżej (≥)' : 'Niżej (≤)'}
		</label>

		<div class="multiplier">
			Szansa: {displayChance}%<br />
			Mnożnik: x{Math.floor(multiplier*100)/100}
		</div>

		<label for="stakeInput">Kwota zakładu (zł):</label>
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
		{loading ? 'Losuję...' : 'Zagraj'}
	</button>

	{#if message}
		<div class="info">
			<div>{message}</div>
			<div>Rzut: {roll}</div>
			<div>Payout: {win ? formatMoney(payout) + ' zł' : '-'}</div>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 600px;
		margin: 3rem auto;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background: #121212;
		padding: 2.5rem;
		border-radius: 16px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
		text-align: center;
		color: #ffffff;
	}

	h1 {
		margin-bottom: 1.5rem;
		color: #f1c40f;
		font-size: 2rem;
	}

	.balance {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		color: #f1c40f;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
		text-align: left;
		margin-bottom: 2rem;
	}

	label {
		font-weight: 600;
		color: #ffffff;
		margin-bottom: 0.2rem;
	}

	input[type='range'] {
		width: 100%;
		height: 14px;
		border-radius: 8px;
		background: var(--slider-bg);
		cursor: pointer;
		transition: background 0.3s ease;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 20px;
		height: 20px;
		background: #ffffff;
		border-radius: 50%;
		border: 2px solid #bdc3c7;
	}

	input[type='range']:active::-webkit-slider-thumb {
		background-color: #ecf0f1;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.6rem;
		font-size: 1rem;
		border-radius: 8px;
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
		color: #ffffff;
		margin-top: 0.5rem;
		cursor: pointer;
		user-select: none;
	}

	.checkbox-label input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: #f1c40f;
	}

	.multiplier {
		font-size: 1.2rem;
		font-weight: 700;
		color: #f1c40f;
	}

	button {
		background: #f1c40f;
		color: #000;
		border: none;
		padding: 1rem;
		font-size: 1.2rem;
		border-radius: 10px;
		cursor: pointer;
		width: 100%;
		transition: background-color 0.3s ease, transform 0.1s;
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
		margin-top: 1.5rem;
		background: #1f1f1f;
		padding: 1rem;
		border-radius: 10px;
		font-size: 1.1rem;
		font-weight: 600;
		color: #ffffff;
		line-height: 1.5;
		box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.05);
	}
</style>

