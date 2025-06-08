<script lang="ts">
	import { onMount } from 'svelte';

	let slots = [
		[1, 2, 3],
		[4, 2, 4],
		[3, 3, 1],
		[2, 1, 2]
	];

	let speed = 2;
	let speedingUp = true;
	onMount(() => {
		const slots_ = document.querySelectorAll('.slot');
		let animationFrame: number;
		let currentTransform: number = 0;
		function spin() {
			currentTransform += speed;
			if (currentTransform > 100) {
				currentTransform %= 100;
				if (speedingUp) {
					speed += 0.5; // Speed up the animation
				} else {
					speed -= 1; // Slow down the animation
				}
				if (speed >= 10) {
					speedingUp = false; // Start slowing down after reaching a certain speed
				}
				const getRandomRow = () =>
					Array.from({ length: slots[0].length }, () => Math.floor(Math.random() * 4) + 1);
				slots = [getRandomRow(), ...slots.slice(0, slots.length - 1)];
			}
			slots_.forEach((slot, index) => {
				// Check if the cycle has ended

				(slot as HTMLElement).style.transform = `translateY(${currentTransform}px)`;
			});

			if (speed <= 0) {
				return; // Stop the animation if speed is zero or negative
			}
			animationFrame = requestAnimationFrame(spin);
		}

		spin();

		return () => cancelAnimationFrame(animationFrame);
	});
</script>

<main>
	<h2>Slots</h2>
	<div id="slots">
		{#each slots as row}
			<div class="row">
				<div class="flex flex-row">
					{#each row as slot}
						<div class="slot">
							<img
								src="/images/slots/{slot}.png"
								alt="Slot {slot}"
								height="100"
								width="100"
								class="border-2"
							/>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</main>

<style>
	#slots {
		overflow: hidden; /* Ensure the animation stays within bounds */
		height: 300px;
	}

	.slot {
		display: inline-block;
		height: 100px; /* Match the image height */
		width: 100px; /* Match the image width */
		position: relative;
		top: -100px; /* Start above the visible area */
	}
</style>
