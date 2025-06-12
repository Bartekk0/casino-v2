<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { page } from '$app/state';
	let isLoggedIn = page.data.session && page.data.session.user;
</script>

<svelte:head>
	<title>Casino</title>
</svelte:head>

<div class="relative h-full min-h-screen w-full overflow-auto text-white select-none">
	<nav
		class="absolute top-0 right-0 left-0 z-10 container mx-auto flex items-center justify-between p-6"
	>
		<div class="hidden space-x-12 md:flex">
			<a
				href="/"
				class="text-lg transition hover:text-yellow-400"
				class:text-yellow-400={page.url.pathname === '/'}>HOME</a
			>
			<a
				href="/games"
				class="text-lg transition hover:text-yellow-400"
				class:text-yellow-400={page.url.pathname === '/games'}>GAMES</a
			>
			<a
				href="/about"
				class="text-lg transition hover:text-yellow-400"
				class:text-yellow-400={page.url.pathname === '/about'}>ABOUT</a
			>
			<a
				href="/contact"
				class="text-lg transition hover:text-yellow-400"
				class:text-yellow-400={page.url.pathname === '/contact'}>CONTACT</a
			>
		</div>
		<div class="flex items-center space-x-6">
			{#if !isLoggedIn}
				{#if page.data.walletExists}
					Masz saldo: {page.data.balance?.toFixed(2)} PLN
				{:else}
					<a href="/konto/brak-portfela">Nie masz portfela, kliknij tutaj, aby go utworzyć</a>
				{/if}
				<a
					href="/auth/signin"
					class="text-lg transition hover:text-yellow-400"
					class:text-yellow-400={page.url.pathname === '/login'}
					>{isLoggedIn ? 'LOGOUT' : 'LOGIN'}</a
				>
				<a
					href="/register"
					class="text-lg transition hover:text-yellow-400"
					class:text-yellow-400={page.url.pathname === '/register'}>REGISTER</a
				>
			{:else}
				<a
					href="/profile/wallet"
					class="text-lg transition hover:text-yellow-400"
					class:text-yellow-400={page.url.pathname === '/profile/wallet'}>WALLET</a
				>
				<a
					href="/auth/signout"
					class="text-lg transition hover:text-yellow-400"
					class:text-yellow-400={page.url.pathname === '/logout'}>LOGOUT</a
				>
			{/if}
		</div>

		<button class="text-white focus:outline-none md:hidden" aria-label="Open mobile menu">
			<svg class="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="3"
					d="M4 6h16M4 12h16M4 18h16"
				></path>
			</svg>
		</button>
	</nav>
	<main class="left-center w-fit transform text-center">
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		@apply h-full min-h-screen w-full bg-cover bg-fixed bg-center bg-no-repeat;
		background-image: url('/main_page/bg.jpg');
	}
</style>
