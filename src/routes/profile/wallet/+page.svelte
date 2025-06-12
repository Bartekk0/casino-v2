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
			alert('Something went wrong while creating the wallet.');
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
			message = `Deposited ${amountToAdd.toFixed(2)}$!`;
			setTimeout(() => location.reload(), 1000);
		} else {
			message = result.error || 'An error occurred during the deposit.';
			loading = false;
		}
	}
</script>

{#if !data.hasWallet}
	<main class="mx-auto mt-12 max-w-md rounded-xl p-8 text-center font-sans shadow-lg">
		<h1 class="mb-4 text-2xl font-bold text-white">No wallet</h1>
		<p class="mb-5 text-white">You don't have a wallet yet. Click below to generate one.</p>
		<button
			class="mt-4 rounded-full px-6 py-3 text-base text-white transition-colors duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:bg-gray-400"
			on:click={generateWallet}
		>
			Generate wallet
		</button>
	</main>
{:else}
	<main class="mx-auto mt-12 max-w-md rounded-xl p-8 text-center font-sans shadow-lg">
		<h1 class="mb-4 text-2xl font-bold text-white">Your wallet</h1>
		<p class="mb-5 text-white">
			Balance: <strong>{data.balance?.toFixed(2)}$</strong>
		</p>

		<div class="mt-8 text-left">
			<label for="amount" class="mb-1 block text-center font-bold text-white"
				>Amount to deposit:</label
			>
			<input
				type="number"
				min="1"
				step="1"
				bind:value={amountToAdd}
				id="amount"
				placeholder="e.g. 10.00"
				class="mt-1 box-border w-full rounded-3xl border border-gray-300 p-2.5 pl-4 text-base text-white"
			/>
			<div class="my-4 flex flex-wrap gap-2">
				{#each [10, 20, 50, 100, 500] as preset}
					<button
						type="button"
						on:click={() => setQuickAmount(preset)}
						class="cursor-pointer rounded-full border border-white px-4 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white hover:text-black"
					>
						{preset}$
					</button>
				{/each}
			</div>
			<button
				on:click={depositMoney}
				disabled={loading || amountToAdd <= 0}
				class="mt-4 w-full rounded-full px-6 py-3 text-base text-white transition-colors duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				{loading ? 'Processing...' : `Deposit ${amountToAdd}$`}
			</button>

			{#if message}
				<p class="mt-4 text-center font-bold text-yellow-600">{message}</p>
			{/if}
		</div>
	</main>
{/if}
