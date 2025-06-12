<script lang="ts">
	let email = '';
	let password = '';
	let submitted = false;
	let error = '';
	let step = 1;
	import { page } from '$app/state';
	let params = page.url.searchParams;

	function handleEmailSubmit() {
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
		handleLogin();
	}

	const handleLogin = async () => {
		const res = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, password })
		});

		if (res.ok) {
			submitted = true;
			setTimeout(() => {
				window.location.href = params.get('callbackUrl') || '/';
			}, 1200);
		} else {
			const err = await res.json();
			error = err.error;
		}
	};
</script>

<div class="mx-auto mt-12 flex w-xs flex-col rounded-full bg-transparent p-8">
	{#if step === 1}
		<h1 class="mb-6 text-center text-3xl font-bold text-white">Login to Casino</h1>
	{:else}
		<button
			type="button"
			class="relative"
			on:click={() => {
				step = 1;
				password = '';
				error = '';
				submitted = false;
			}}
		>
			<span class="absolute top-0 left-0 -translate-x-[100%] transform text-3xl">&larr;</span>

			<h1 class="mb-6 text-center text-3xl font-bold text-white">Login to Casino</h1>
		</button>
	{/if}
	{#if submitted}
		<div class="mb-4 rounded-full bg-transparent p-4 text-center text-white">Logging in...</div>
	{:else if step === 1}
		<form class="space-y-6" on:submit|preventDefault={handleEmailSubmit}>
			{#if error}
				<div class="rounded-full bg-transparent p-2 text-center text-white">{error}</div>
			{/if}
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
		</form>
		<div class="mt-4 text-center text-white">
			<p>
				Don't have an account?
				<br />
				<a href="/register" class="text-white underline">Register here</a>
			</p>
		</div>
		<span class="mt-4 flex items-center justify-center">
			<hr class="flex-grow border-t border-white/30" />
			<span class="mx-4 text-white/70">or</span>
			<hr class="flex-grow border-t border-white/30" />
		</span>

		<form class="mt-4" action="/auth/signin/google" method="POST">
			<input
				type="hidden"
				name="callbackUrl"
				value={params.get('callbackUrl') || ''}
				class="hidden"
			/>
			<button
				type="submit"
				class="group align-center flex w-full justify-center gap-2 rounded-full border border-white/30 bg-transparent px-4 py-2 font-bold text-white transition hover:bg-white hover:text-black"
			>
				<img
					src="/login/google-logo.png"
					alt="github"
					class="h-6 w-6 transition group-hover:invert"
				/>
				Sign in with Google
			</button>
		</form>
		<form method="POST" action="/auth/signin/github" class="mt-4">
			<input
				type="hidden"
				name="callbackUrl"
				value={params.get('callbackUrl') || ''}
				class="hidden"
			/>
			<button
				type="submit"
				class="group align-center flex w-full justify-center gap-2 rounded-full border border-white/30 bg-transparent px-4 py-2 font-bold text-white transition hover:bg-white hover:text-black"
			>
				<img src="/login/github.png" alt="github" class="h-6 w-6 transition group-hover:invert" />
				Sign in with GitHub
			</button>
		</form>
	{:else if step === 2}
		<form class="space-y-6" on:submit|preventDefault={handlePasswordSubmit}>
			{#if error}
				<div class="rounded-full bg-transparent p-2 text-center text-white">{error}</div>
			{/if}
			<div>
				<label class="mb-2 block font-semibold text-white" for="password">Password</label>
				<input
					id="password"
					type="password"
					class="w-full rounded-full border border-white/50 px-4 py-2 focus:ring-2 focus:ring-white/70 focus:outline-none"
					bind:value={password}
					required
				/>
			</div>
			<button
				type="submit"
				class="w-full rounded-full bg-transparent px-4 py-2 font-bold text-white transition hover:bg-white hover:text-black"
			>
				Login
			</button>
		</form>
	{/if}
</div>
