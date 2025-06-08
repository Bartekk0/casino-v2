<script lang="ts">
	import { onMount } from 'svelte';

	const ROWS = 1,
		COLUMNS = 3,
		IMAGE_SIZE = 200, // Size of each slot image (px)
		SPACING = IMAGE_SIZE / 2; // Spacing between slots (px)
	let slots: number[][] = [];
	let speed = 2;
	let speedingUp = true;
	let currentTransform: number;
	onMount(() => {
		slots = Array.from({ length: ROWS + 3 }, () =>
			Array.from({ length: COLUMNS }, () => Math.floor(Math.random() * 4) + 1)
		);
		let animationFrame: number;
		currentTransform = 0;
		function spin() {
			let startTime = Date.now();
			currentTransform += speed;
			if (currentTransform > IMAGE_SIZE) {
				currentTransform %= IMAGE_SIZE;
				if (speedingUp) {
					speed += IMAGE_SIZE / 150; // Speed up the animation
				} else {
					speed -= IMAGE_SIZE / 66; // Slow down the animation
				}
				if (speed >= IMAGE_SIZE / 10) {
					speedingUp = false; // Start slowing down after reaching a certain speed
				}
				const getRandomRow = () =>
					Array.from({ length: COLUMNS }, () => Math.floor(Math.random() * 4) + 1);
				slots = [getRandomRow(), ...slots.slice(0, slots.length - 1)];
			}

			if (speed <= 0) {
				return; // Stop the animation if speed is zero or negative
			}
			const elapsed = Date.now() - startTime;
			const delay = Math.max(0, 1000 / 60 - elapsed);
			setTimeout(() => {
				animationFrame = requestAnimationFrame(spin);
			}, delay);
		}

		spin();

		return () => cancelAnimationFrame(animationFrame);
	});
</script>

<main>
	<h2>Slots</h2>
	<div
		id="slots"
		style="height: {(ROWS + 1) * IMAGE_SIZE}px; width: {IMAGE_SIZE * COLUMNS * 2}px;"
		class="border-4 border-black"
	>
		{#if slots.length === 0}
			<p>Loading...</p>
		{/if}
		{#each slots as row}
			<div class="flex flex-row">
				{#each row as slot}
					<div
						class="height-[{IMAGE_SIZE}px] slot relative"
						style="transform: translateY({currentTransform}px); margin-inline: {SPACING}px; top: -{(IMAGE_SIZE /
							2) *
							3}px;"
					>
						<img
							src="/images/slots/{slot}.png"
							alt="Slot {slot}"
							height={IMAGE_SIZE}
							width={IMAGE_SIZE}
						/>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</main>

<style>
	#slots {
		overflow: hidden; /* Ensure the animation stays within bounds */
	}
</style>
