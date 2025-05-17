<script lang="ts">
	import { writable } from 'svelte/store';

	//ruletka europejska
	const wheelOrder = [
		0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
		5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
	];

	let spinning = false;
	let rotation = 0; //wizualny obrot

	const result = writable<number | null>(null);

	const totalSlots = 37;
	const anglePerNumber = 360 / totalSlots;

	async function animateRotation(start: number, end: number, duration: number) {
		return new Promise<void>((resolve) => {
			const startTime = performance.now();

			function animate(time: number) {
				const elapsed = time - startTime;
				const progress = Math.min(elapsed / duration, 1);
                //nie ja liczylem ten eased bez jaj
				const eased = 1 - Math.pow(1 - progress, 3);				
				rotation = start + (end - start) * eased;
				
				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					rotation = end % 360;
					resolve();
				}
			}

			requestAnimationFrame(animate);
		});
	}

	async function spin() {
		if (spinning) return;
		spinning = true;

		try {
			const res = await fetch('/roulette/spin');
			const data = await res.json();
			const winningNumber: number = data.number;

			// 0 ma index 0
			const numberIndex = wheelOrder.indexOf(winningNumber);

            // ile trzeba obrocic
			const targetAngle = numberIndex * anglePerNumber;
			
			// rotation to aktualna pozycja, modulo 360 zeby nie krecic za duzo
			const currentNormalized = rotation % 360;
			
            // jak dodawalem zamaist odejmowac to bylo symetrycznie od 0 w dobrej odleglosci ale nie ten numer
			const visualTargetAngle = 360 - targetAngle;
			
			// rotacja do numeru ktory chcemy (dodatnia), dodaje odejmuje cos robie i dziala
			const shortestPath = (visualTargetAngle - currentNormalized + 360) % 360;
			
			// 4 rotacje i offset
			const fullSpins = 1440;
			const totalRotation = fullSpins + shortestPath;
			
			await animateRotation(rotation, rotation + totalRotation, 4000);

			result.set(winningNumber);
		} catch (error) {
			console.error('Spin failed:', error);
		} finally {
			spinning = false;
		}
	}
</script>



<div class="roulette-container">
	<img
		src="/images/wheel.png"
		alt="Roulette Wheel"
		class="wheel"
         style="transform: rotate({rotation}deg); user-select: none;"
	    draggable="false"
     />
	<div class="pointer"></div>
</div>

<button on:click={spin} disabled={spinning}>
	{spinning ? 'Drukowanie pieniędzy...' : 'Zostań gazylionerem'}
</button>

<p class="result">Number: {$result ?? '-'}</p>

<style>
	.roulette-container {
		width: 500px;
		height: 500px;
		position: relative;
		margin: 50px auto;
	}

	.wheel {
		width: 100%;
		height: 100%;
		transform-origin: center;
		transition: none;
	}

	.pointer {
		position: absolute;
		top: 50%;
		right: -10%;
		transform: translate(-50%, -50%) rotate(270deg);
		width: 2px;
		height: 30px;
		background: #ff0000;
		border-radius: 2px;
		z-index: 2;
	}

	.pointer::after {
		content: '';
		position: absolute;
		top: -10px;
		left: -8px;
		width: 18px;
		height: 18px;
		background: #ff0000;
		clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
	}

	button {
		display: block;
		margin: 1rem auto;
		padding: 0.75rem 2rem;
		font-size: 30px;
		background: cornflowerblue;
		color: white;
		border: none;
		border-radius: 50px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	button:disabled {
		background: #6c757d;
		cursor: not-allowed;
	}

	.result {
		text-align: center;
		font-size: 1.5rem;
		font-weight: bold;
		margin: 1rem 0;
	}

</style>