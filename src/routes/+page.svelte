<script>
	let isLoggedIn = false; // You can manage login state here
</script>

<main
	class="h-full min-h-screen w-full bg-cover bg-fixed bg-center bg-no-repeat text-white select-none"
	style="
			background-image: url('main_page/bg.jpg');
		"
>
	<!-- Navigation -->
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

	<!-- Hero Section -->
	<main
		class="absolute top-1/2 left-1/4 container w-fit -translate-x-1/2 -translate-y-1/2 transform text-center"
	>
		<div class="mb-12">
			<h1 class="mb-3 text-8xl font-bold">
				<span class="text-yellow-400">WELCOME TO THE</span><br />
				<span class="text-9xl">CASINO</span>
			</h1>

			<p class="mx-auto mt-9 mb-15 max-w-2xl text-2xl">
				Enjoy the best games and<br />
				exciting rewards!
			</p>

			<a
				class="transform rounded-full bg-yellow-500 px-12 py-4 text-xl font-bold text-gray-900 transition hover:bg-yellow-600"
				href="/login"
			>
				JOIN NOW
			</a>
		</div>
	</main>
</main>

<style global>
	/* You can add global styles here if needed */
	@import url('https://fonts.googleapis.com/css2?family=Rye&display=swap');
</style>
