<script>
	let isLoggedIn = true;
</script>

<div class="mb-12">
	<h1 class="mb-3 text-8xl font-bold">
		<span class="text-yellow-400">WELCOME TO THE</span><br />
		<span class="text-9xl">CASINO</span>
	</h1>

	<p class="mx-auto mt-9 mb-15 max-w-2xl text-2xl">
		Enjoy the best games and<br />
		exciting rewards!
	</p>

	{#if isLoggedIn}
		<a
			class="transform rounded-full bg-yellow-500 px-12 py-4 text-xl font-bold text-gray-900 transition hover:bg-yellow-600"
			href="/games"
		>
			PLAY NOW
		</a>
	{:else}
		<a
			class="transform rounded-full bg-yellow-500 px-12 py-4 text-xl font-bold text-gray-900 transition hover:bg-yellow-600"
			href="/login"
		>
			JOIN NOW
		</a>
	{/if}
</div>
