<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	let password = '';
	let email = '';
</script>

<nav>
	<p>
		These actions are all using the methods exported from
		<code>@auth/sveltekit/client</code>
	</p>
	<div class="actions">
		<!-- <div class="wrapper-form">
			<button on:click={() => signIn('github')}>Sign In with GitHub</button>
		</div>
		<div class="wrapper-form">
			<button on:click={() => signIn('discord')}>Sign In with Discord</button>
		</div> -->
		<div class="wrapper-form">
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
	</div>
</nav>
