<script lang="ts">
	import Matter from 'matter-js';
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	let engine: Matter.Engine;
	let render: Matter.Render;
	let credits = page.data.balance || 0;
	let multiplier = 1;

	const HEIGHT = 500,
		WIDTH = 600,
		BALL_RADIUS = 8,
		PEG_RADIUS = 5,
		WALL_WIDTH = 15,
		PEG_SPACING = 50,
		PEG_ROWS = 8,
		COLORS = ['#831843', '#db2777', '#f472b6', '#f9a8d4', '#be185d'],
		BOXES_OPTIONS = [
			{
				color: '#FFD700',
				credits: 10
			},
			{
				color: '#FFC700',
				credits: 6
			},
			{
				color: '#FFB700',
				credits: 4
			},
			{
				color: '#FFA700',
				credits: 2
			},
			{
				color: '#FF9700',
				credits: 0
			}
		].reverse(),
		MULTIPLIERS = [1, 2, 3, 4, 5],
		DEFAULT_BALL_COST = 5;

	function dropBallHandler() {
		if (credits < DEFAULT_BALL_COST * multiplier) {
			return;
		}
		credits -= DEFAULT_BALL_COST * multiplier;
		const start = WIDTH / 2 - PEG_SPACING;
		const stop = WIDTH / 2 + PEG_SPACING;
		const randomX = Math.random() * (stop - start) + start;
		const ball = Matter.Bodies.circle(randomX, 50, BALL_RADIUS, {
			restitution: 0.8,
			render: { fillStyle: COLORS[Math.floor(Math.random() * COLORS.length)] },
			label: 'ball-' + multiplier
		});
		Matter.World.add(engine.world, ball);
	}
	onMount(() => {
		engine = Matter.Engine.create();
		engine.gravity.y = 1;
		render = Matter.Render.create({
			element: document.getElementById('plinko-container') || document.body,
			engine: engine,
			options: {
				width: WIDTH,
				height: HEIGHT + WIDTH / 20,
				wireframes: false,
				background: 'transparent'
			}
		});

		const boxes = [];
		const boxWidth = WIDTH / 10;
		for (let i = 0; i < 10; i++) {
			const x = boxWidth / 2 + i * boxWidth;
			const box = Matter.Bodies.rectangle(x, HEIGHT + boxWidth / 4, boxWidth, boxWidth / 2, {
				isStatic: true,
				render: {
					fillStyle:
						BOXES_OPTIONS[i >= BOXES_OPTIONS.length ? 2 * BOXES_OPTIONS.length - i - 1 : i].color,
					strokeStyle: 'transparent',
					lineWidth: 1
				},
				label: `box-${i}`
			});
			boxes.push(box);
		}
		Matter.World.add(engine.world, boxes);

		const pegs = [];
		for (let row = 0; row < PEG_ROWS; row++) {
			const totalWidth = row * PEG_SPACING;
			for (let col = 0; col < row + 3; col++) {
				const x = WIDTH / 2 - totalWidth / 2 + (col - 1) * PEG_SPACING;
				const y = 70 + row * PEG_SPACING;
				pegs.push(
					Matter.Bodies.circle(x, y, PEG_RADIUS, {
						isStatic: true,
						render: {
							// fillStyle: `hsl(207, 70%, ${30 + row * 7}%)`
							fillStyle: `hsl(51, 100%, ${30 + row * 7}%)`
						}
					})
				);
			}
		}

		const leftWall = Matter.Bodies.rectangle(-WALL_WIDTH / 2, HEIGHT / 2, WALL_WIDTH, HEIGHT, {
			isStatic: true,
			render: {
				strokeStyle: 'transparent'
			}
		});
		const rightWall = Matter.Bodies.rectangle(
			WIDTH + WALL_WIDTH / 2,
			HEIGHT / 2,
			WALL_WIDTH,
			HEIGHT,
			{
				isStatic: true,
				render: {
					strokeStyle: 'transparent'
				}
			}
		);

		Matter.World.add(engine.world, [leftWall, rightWall, ...pegs]);
		const runner = Matter.Runner.create();
		Matter.Runner.run(runner, engine);
		Matter.Render.run(render);

		Matter.Events.on(engine, 'collisionStart', (event) => {
			event.pairs.forEach((pair) => {
				const { bodyA, bodyB } = pair;
				const isBox = bodyA.label.startsWith('box-')
					? bodyA
					: bodyB.label.startsWith('box-')
						? bodyB
						: null;
				const isBall =
					(bodyA.circleRadius === BALL_RADIUS && !bodyA.isStatic) ||
					(bodyB.circleRadius === BALL_RADIUS && !bodyB.isStatic);

				if (isBox && isBall) {
					isBox.render.fillStyle = 'red';
					const boxNumber = Number(isBox.label.split('-')[1]);
					const ball = isBox === bodyA ? bodyB : bodyA;
					const ballMultiplier = Number(ball.label.split('-')[1]);
					Matter.Body.setStatic(ball, true);
					credits +=
						BOXES_OPTIONS[boxNumber > 4 ? 2 * BOXES_OPTIONS.length - boxNumber - 1 : boxNumber]
							.credits * ballMultiplier;
					setTimeout(() => {
						Matter.World.remove(engine.world, ball);
						isBox.render.fillStyle =
							BOXES_OPTIONS[
								Number(isBox.label.split('-')[1]) >= BOXES_OPTIONS.length
									? 2 * BOXES_OPTIONS.length - Number(isBox.label.split('-')[1]) - 1
									: Number(isBox.label.split('-')[1])
							].color;
					}, 100);
				}
			});
		});

		return () => {
			Matter.Render.stop(render);
			Matter.Engine.clear(engine);
		};
	});
</script>

<main class="flex h-screen w-full flex-col items-center justify-center font-sans">
	<h2 class="text-5xl font-bold text-white drop-shadow-md">Plinko</h2>

	<p class="mt-4 mb-2 text-center text-lg text-white">Your balance: {credits}$</p>

	<button
		id="drop-ball-button"
		on:click={() => dropBallHandler()}
		class="mt-2 rounded-full bg-yellow-600 px-4 py-2 text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-gray-500"
	>
		Drop a ball ({DEFAULT_BALL_COST * multiplier}$)
	</button>
	<div class="mt-6 flex flex-row items-center gap-4">
		<div class="flex flex-col gap-2">
			{#each BOXES_OPTIONS as box}
				<div class="flex w-16 flex-col items-center">
					<div
						class="flex h-6 w-full items-center justify-center rounded-md"
						style="background: {box.color};"
					>
						<span class="text-xs font-bold text-black drop-shadow">
							{box.credits * multiplier}$
						</span>
					</div>
				</div>
			{/each}
		</div>
		<div
			id="plinko-container"
			class="overflow-hidden rounded-md border-2 border-white shadow-lg"
		></div>
		<div class="mt-4 flex flex-col gap-2">
			{#each MULTIPLIERS as m}
				<button
					class="flex w-16 cursor-pointer flex-col items-center"
					on:click={() => (multiplier = m)}
				>
					<div
						class="flex h-6 w-full items-center justify-center rounded-md text-xs font-bold drop-shadow"
						class:bg-yellow-500={multiplier === m}
						class:text-black={multiplier !== m}
						class:bg-yellow-800={multiplier !== m}
						class:text-white={multiplier === m}
					>
						{m}x
					</div>
				</button>
			{/each}
		</div>
	</div>

	<p class="mt-2 mb-4 max-w-2xl text-center text-yellow-200">
		Drop a ball and watch it bounce through pegs into one of the prize boxes below. Each box awards
		a different amount of credits. Choose your multiplier to increase risk and reward!
	</p>
</main>
