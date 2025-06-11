<script lang="ts">
	import { onMount } from 'svelte';
	import games from '$lib/games/list.json';
	// TODO: IF NOT LOGGED IN, REDIRECT TO LOGIN/MAIN PAGE
</script>

<main class="left-center flex w-fit flex-wrap justify-center gap-8 p-8 text-center">
	{#each games as game}
		<div
			class="relative block h-[250px] w-[250px] overflow-hidden rounded-lg bg-yellow-600 shadow-lg transition-transform"
		>
			<!-- <img
				src={game.image || 'https://placehold.co/142x157'}
				alt={game.name}
				class="absolute z-0 h-full w-full"
				height="157"
				width="142"
			/> -->
			<a href={`/games/${game.href}`} class="z-1 rounded-lg">
				<h2 class="text-2xl text-black uppercase">{game.name}</h2>
				<p class="text-sm">{game.desc}</p>
			</a>
		</div>
	{/each}
</main>
