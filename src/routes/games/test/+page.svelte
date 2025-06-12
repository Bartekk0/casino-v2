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
			<div>Profit: {win ? formatMoney(payout-stake) + ' zł' : '-'}</div>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 400px;
		margin: 3rem auto;
		font-family: Arial, sans-serif;
		background: #f5f5f5;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	h1 {
		margin-bottom: 1rem;
		color: #2c3e50;
	}

	label {
		display: block;
		margin: 1rem 0 0.5rem;
		font-weight: 600;
		color: #34495e;
	}

	input[type='range'] {
		width: 100%;
		margin-bottom: 0.3rem;
		-webkit-appearance: none;
		height: 12px;
		border-radius: 8px;
		background: var(--slider-bg);
		cursor: pointer;
		transition: background 0.3s ease;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		background: #2ecc71;
		cursor: pointer;
		border-radius: 50%;
		border: 2px solid #27ae60;
		margin-top: -6px;
		transition: background-color 0.3s;
	}
	input[type='range']:active::-webkit-slider-thumb {
		background-color: #27ae60;
	}

	input[type='range']::-moz-range-thumb {
		width: 24px;
		height: 24px;
		background: #2ecc71;
		cursor: pointer;
		border-radius: 50%;
		border: 2px solid #27ae60;
		transition: background-color 0.3s;
	}
	input[type='range']:active::-moz-range-thumb {
		background-color: #27ae60;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.4rem;
		font-size: 1rem;
		border-radius: 6px;
		border: 1px solid #ccc;
		box-sizing: border-box;
	}

	button {
		background: #27ae60;
		color: white;
		border: none;
		padding: 1rem 2rem;
		margin-top: 1.5rem;
		font-size: 1.1rem;
		border-radius: 8px;
		cursor: pointer;
		box-shadow: 0 4px 10px #2ecc71;
		transition: background-color 0.3s ease;
		width: 100%;
	}
	button:disabled {
		background: #95a5a6;
		cursor: not-allowed;
		box-shadow: none;
	}
	button:hover:not(:disabled) {
		background: #2ecc71;
	}

	.info {
		margin-top: 1.2rem;
		font-size: 1.2rem;
		font-weight: 700;
		color: #34495e;
		line-height: 1.6;
	}

	.balance {
		font-size: 1.4rem;
		font-weight: 800;
		margin-bottom: 1rem;
		color: #2980b9;
	}

	.options {
		text-align: left;
	}

	.multiplier {
		margin-top: 0.5rem;
		font-size: 1.3rem;
		font-weight: 700;
		color: #27ae60;
	}

	label.checkbox-label {
		cursor: pointer;
		user-select: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: #34495e;
		margin-top: 0.7rem;
	}

	label.checkbox-label input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}
</style>
