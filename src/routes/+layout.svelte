<script lang="ts">
	import '../app.css';
	let { children } = $props();

	let isLoggedIn = false;
</script>

<div
	class="h-full min-h-screen w-full bg-cover bg-fixed bg-center bg-no-repeat text-white select-none"
	style="
			background-image: url('/main_page/bg.jpg');
		"
>
	<nav
		class="absolute top-0 right-0 left-0 container mx-auto flex items-center justify-between p-6"
	>
		<div class="hidden space-x-12 md:flex">
			<a href="/" class="text-lg transition hover:text-yellow-400">HOME</a>
			<a href="/games" class="text-lg transition hover:text-yellow-400">GAMES</a>
			<a href="/about" class="text-lg transition hover:text-yellow-400">ABOUT</a>
			<a href="/contact" class="text-lg transition hover:text-yellow-400">CONTACT</a>
		</div>
		<a href="/ " class="text-lg transition hover:text-yellow-400"
			>{isLoggedIn ? 'LOGOUT' : 'LOGIN'}</a
		>

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
	{@render children()}
</div>
