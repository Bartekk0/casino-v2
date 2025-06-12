<script lang="ts">
	import games from '$lib/games/list.json';
</script>

<main class="mx-auto mt-12 grid grid-cols-2 gap-8">
	{#each games as game}
		<a
			href={`/games/${game.href}`}
			class="flex flex-col items-center justify-center transition-transform hover:scale-105"
		>
			<img
				src={game.image ? '/games/icons/' + game.image : 'https://placehold.co/142x157'}
				alt={game.name}
				class=""
				height="150"
				width="150"
			/>
			<h2 class="mt-2 text-3xl font-bold text-white uppercase">{game.name}</h2>
			<p class="w-3/4 text-center text-sm">{game.desc}</p>
		</a>
	{/each}
</main>
