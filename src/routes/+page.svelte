<script lang="ts">
	// import { signIn, signOut } from '@auth/sveltekit/client';
	let email = '';
	let password = '';
	let error = '';
	let success = '';

	async function register() {
		error = '';
		success = '';
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
				success = 'Rejestracja zakończona sukcesem!';
			}
		} catch (err) {
			error = 'Błąd połączenia z serwerem';
		}
	}
</script>

<nav>
	<!-- <p>
		These actions are all using the methods exported from
		<code>@auth/sveltekit/client</code>
	</p>
	<div class="actions"> -->


		<!-- <div class="wrapper-form">
			<button on:click={() => signIn('github')}>Sign In with GitHub</button>
		</div>
		<div class="wrapper-form">
			<button on:click={() => signIn('discord')}>Sign In with Discord</button>
		</div> -->


		<!-- <div class="wrapper-form">
			<div class="input-wrapper">
				<label for="password">Password</label>
				<input bind:value={password} type="password" id="password" name="password" required />
			</div>
			<div class="input-wrapper">
				<label for="email">Email</label>
				<input bind:value={email} type="email" id="email" name="email" required />
			</div>
			<button on:click={() => signIn('credentials', { email, password })}>
				Sign In with Credentials
			</button>
			<button on:click={() => signOut()}> Sign Out </button>
		</div>
	</div> -->

	<form on:submit|preventDefault={register}>
		<input type="email" bind:value={email} placeholder="Email" required />
		<input type="password" bind:value={password} placeholder="Hasło" required />
		<button type="submit">Zarejestruj się</button>
	</form>

	{#if error}<p style="color: red">{error}</p>{/if}
	{#if success}<p style="color: green">{success}</p>{/if}
</nav>
