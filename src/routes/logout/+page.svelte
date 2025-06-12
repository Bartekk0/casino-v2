<script lang="ts">
	let loggingOut = false;
	let error = '';

	function handleLogout() {
		loggingOut = true;
		fetch('/auth/signout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Logout failed');
				}
			})
			.then(() => {
				setTimeout(() => {
					window.location.href = '/auth/signin';
					loggingOut = false;
				}, 1200);
			})
			.catch((error) => {
				console.error('Error during logout:', error);
				error = 'Logout failed. Please try again.';
				loggingOut = false;
			});
	}
</script>

<div class="mx-auto mt-12 flex max-w-xl flex-col rounded-full bg-transparent p-8 shadow-lg">
	<h1 class="mb-6 text-center text-3xl font-bold text-white">Logout from Casino</h1>
	{#if loggingOut}
		<div class="mb-4 rounded-full bg-transparent p-4 text-center text-white">Logging out...</div>
	{:else}
		<form class="space-y-6" on:submit|preventDefault={handleLogout}>
			<div class="rounded-full bg-transparent p-2 text-center text-white">
				Are you sure you want to logout?
			</div>
			<button
				type="submit"
				class="w-full cursor-pointer rounded-full bg-transparent px-4 py-2 font-bold text-white transition hover:bg-white hover:text-black"
			>
				Logout
			</button>
			{#if error}
				<div class="rounded-full bg-transparent p-2 text-center text-red-500">{error}</div>
			{/if}
		</form>
	{/if}
	<div class="mt-4 text-center text-white">
		<a href="/" class="text-white underline">Back to Main Page</a>
	</div>
</div>
