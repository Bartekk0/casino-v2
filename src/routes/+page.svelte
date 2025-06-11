<script lang="ts">
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

	export let data;

	const handleLogin = async () => {
		const res = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, password })
		});

		if (res.ok) {
			window.location.href = '/'; // redirect po zalogowaniu
		} else {
			const err = await res.json();
			error = err.error;
		}
	};
</script>

<nav>
	{#if data.session}
		<p>Jesteś zalogowany z id {data.session.user?.id}</p>
	{:else}
		<p>Nie jesteś zalogowany.</p>
	{/if}

	login
	<form on:submit|preventDefault={handleLogin}>
		<input type="email" bind:value={email} placeholder="Email" required />
		<input type="password" bind:value={password} placeholder="Hasło" required />
		<button type="submit">Zaloguj się</button>
		{#if error}
			<p style="color: red">{error}</p>
		{/if}
	</form>
	rejister
	<form on:submit|preventDefault={register}>
		<input type="email" bind:value={email} placeholder="Email" required />
		<input type="password" bind:value={password} placeholder="Hasło" required />
		<button type="submit">Zarejestruj się</button>
	</form>

	<form method="POST" action="/auth/signin/github">
		<button type="submit">gitbuh</button>
	</form>

	<form method="POST" action="/auth/signout">
		<button type="submit">Wyloguj</button>
	</form>

	{#if error}<p style="color: red">{error}</p>{/if}
	{#if success}<p style="color: green">{success}</p>{/if}
</nav>
