<script lang="ts">
	let email = '';
	let password = '';
	let confirmPassword = '';
	let submitted = false;
	let error = '';
	let step = 1;

	function handleUsernameEmailSubmit() {
		error = '';
		if (!email) {
			error = 'Please enter your email.';
			return;
		}
		step = 2;
	}

	function handlePasswordSubmit() {
		error = '';
		if (!password) {
			error = 'Please enter your password.';
			return;
		}
		if (!confirmPassword) {
			error = 'Please confirm your password.';
			return;
		}
		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}
		handleRegister();
	}

	function handleBack() {
		step = 1;
		password = '';
		confirmPassword = '';
		error = '';
		submitted = false;
	}

	async function handleRegister() {
		try {
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || 'Coś poszło nie tak';
			} else {
				submitted = true;
			}
		} catch (err) {
			error = 'Błąd połączenia z serwerem';
		}
	}
</script>

<div class="mx-auto mt-12 flex w-xs flex-col rounded-full bg-transparent p-8">
	{#if step === 1}
		<h1 class="mb-6 text-center text-3xl font-bold text-white">Register at Casino</h1>
	{:else}
		<button type="button" class="relative" on:click={handleBack}>
			<span class="absolute top-0 left-0 -translate-x-[100%] transform text-3xl">&larr;</span>
			<h1 class="mb-6 text-center text-3xl font-bold text-white">Register at Casino</h1>
		</button>
	{/if}

	{#if submitted}
		<div class="mb-4 rounded-full bg-transparent p-4 text-center text-white">
			Registration successful!
			<p>
				Go to <a href="/login" class="text-white underline">Login</a>
			</p>
		</div>
	{:else if step === 1}
		<form class="space-y-6" on:submit|preventDefault={handleUsernameEmailSubmit}>
			<div>
				<label class="mb-2 block font-semibold text-white" for="email">Email</label>
				<input
					id="email"
					type="email"
					class="w-full rounded-full border border-white/50 px-4 py-2 focus:ring-2 focus:ring-white/70 focus:outline-none"
					bind:value={email}
					required
				/>
			</div>
			<button
				type="submit"
				class="w-full rounded-full bg-transparent px-4 py-2 font-bold text-white transition hover:bg-white hover:text-black"
			>
				Next
			</button>
			{#if error}
				<div class="rounded-full bg-transparent p-2 text-center text-red-500">{error}</div>
			{/if}
		</form>
	{:else if step === 2}
		<form class="space-y-6" on:submit|preventDefault={handlePasswordSubmit}>
			<div>
				<label class="mb-2 block font-semibold text-white" for="password">Password</label>
				<input
					id="password"
					type="password"
					class="w-full rounded-full border border-white/50 px-4 py-2 focus:ring-2 focus:ring-white/70 focus:outline-none"
					bind:value={password}
					required
					minlength="6"
				/>
			</div>
			<div>
				<label class="mb-2 block font-semibold text-white" for="confirmPassword"
					>Confirm Password</label
				>
				<input
					id="confirmPassword"
					type="password"
					class="w-full rounded-full border border-white/50 px-4 py-2 focus:ring-2 focus:ring-white/70 focus:outline-none"
					bind:value={confirmPassword}
					required
					minlength="6"
				/>
			</div>
			<button
				type="submit"
				class="w-full rounded-full bg-transparent px-4 py-2 font-bold text-white transition hover:bg-white hover:text-black"
			>
				Register
			</button>
			{#if error}
				<div class="rounded-full bg-transparent p-2 text-center text-red-500">{error}</div>
			{/if}
		</form>
	{/if}
	<div class="mt-4 text-center text-white">
		<p>
			Already have an account?
			<br />
			<a href="/auth/signin" class="text-white underline">Login here</a>
		</p>
	</div>
</div>
