<script lang="ts">
	export let data;

	let amountToAdd = 10.0;
	let loading = false;
	let message = '';

	async function generateWallet() {
		const response = await fetch('/api/portfel/utworz', { method: 'POST' });
		if (response.ok) {
			location.reload();
		} else {
			alert('Coś poszło nie tak przy tworzeniu portfela.');
		}
	}

	function setQuickAmount(value: number) {
		amountToAdd = value;
	}

	async function depositMoney() {
		if (amountToAdd <= 0 || loading) return;

		loading = true;
		message = '';
		const res = await fetch('/api/portfel/deposit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount: amountToAdd })
		});

		const result = await res.json();

		if (res.ok) {
			message = `Doładowano ${amountToAdd.toFixed(2)} zł!`;
			setTimeout(() => location.reload(), 1000);
		} else {
			message = result.error || 'Wystąpił błąd przy wpłacie.';
			loading = false;
		}
	}
</script>

{#if !data.hasWallet}
	<main>
		<h1>Brak portfela</h1>
		<p>Nie masz jeszcze portfela. Kliknij poniżej, aby go wygenerować.</p>
		<button on:click={generateWallet}>Wygeneruj portfel</button>
	</main>
{:else}
	<main>
		<h1>Twój portfel</h1>
		<p>Saldo: <strong>{data.balance?.toFixed(2)} zł</strong></p>

		<div class="deposit-box">
			<label for="amount">Kwota do wpłaty:</label>
			<input
				type="number"
				min="1"
				step="0.01"
				bind:value={amountToAdd}
				id="amount"
				placeholder="np. 10.00"
			/>
			<div class="quick-amounts">
				{#each [10, 20, 50, 100, 500] as preset}
					<button type="button" on:click={() => setQuickAmount(preset)}>
						{preset} zł
					</button>
				{/each}
			</div>
			<button on:click={depositMoney} disabled={loading || amountToAdd <= 0}>
				{loading ? 'Przetwarzanie...' : `Wpłać ${amountToAdd.toFixed(2)} zł`}
			</button>

			{#if message}
				<p class="message">{message}</p>
			{/if}
		</div>
	</main>
{/if}

<style>
	main {
		max-width: 400px;
		margin: 3rem auto;
		background: #f9f9f9;
		padding: 2rem;
		border-radius: 12px;
		font-family: Arial, sans-serif;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	h1 {
		color: #2c3e50;
		margin-bottom: 1rem;
	}

	p {
		margin-bottom: 1.2rem;
		color: #34495e;
	}

	button {
		background-color: #2980b9;
		color: white;
		padding: 0.8rem 1.5rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		margin-top: 1rem;
		transition: background-color 0.3s ease;
	}

	button:hover:not(:disabled) {
		background-color: #3498db;
	}

	button:disabled {
		background: #95a5a6;
		cursor: not-allowed;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.6rem;
		font-size: 1rem;
		border-radius: 6px;
		border: 1px solid #ccc;
		margin-top: 0.3rem;
		box-sizing: border-box;
	}

	.deposit-box {
		margin-top: 2rem;
		text-align: left;
	}

	.deposit-box label {
		font-weight: bold;
		display: block;
		margin-bottom: 0.3rem;
		color: #2c3e50;
	}

	.message {
		margin-top: 1rem;
		font-weight: bold;
		color: #27ae60;
	}

	.quick-amounts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 1rem 0;
	}

	.quick-amounts button {
		background-color: #dbeafe; /* blue-100 */
		color: #3b82f6; /* blue-500 */
		border: 1px solid #bfdbfe; /* blue-200 */
		border-radius: 0.75rem;
		padding: 0.4rem 1rem;
		font-weight: 500;
		font-size: 0.9rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.quick-amounts button:hover {
		background-color: #bfdbfe; /* blue-200 */
	}
</style>
