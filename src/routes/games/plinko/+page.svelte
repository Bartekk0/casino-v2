<script lang="ts">
	import Matter from 'matter-js';
	import { onMount } from 'svelte';

	let engine: Matter.Engine;
	let render: Matter.Render;
	let points = 25;
	let multiplier = 1;

	const HEIGHT = 600,
		WIDTH = 700,
		BALL_RADIUS = 10,
		PEG_RADIUS = 7,
		WALL_WIDTH = 20,
		PEG_SPACING = 60,
		PEG_ROWS = 8,
		PEG_COLS = 10,
		COLORS = ['#831843', '#db2777', '#f472b6', '#f9a8d4', '#fce7f3'],
		BOXES_OPTIONS = [
			{
				color: '#1e3a5c',
				points: 10
			},
			{
				color: '#60a5fa',
				points: 7
			},
			{
				color: '#38bdf8',
				points: 5
			},
			{
				color: '#7dd3fc',
				points: 3
			},
			{
				color: '#bae6fd',
				points: 0
			}
		].reverse(),
		MULITIPLIERS = [1, 2, 3, 4, 5],
		DEFAULT_BALL_COST = 5;

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
				background: '#0a0c1a'
			}
		});

		const boxes = [];
		const boxWidth = WIDTH / 10;
		for (let i = 0; i < 10; i++) {
			const x = boxWidth / 2 + i * boxWidth;
			const y = HEIGHT - boxWidth / 4;
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
				const y = 100 + row * PEG_SPACING;
				pegs.push(
					Matter.Bodies.circle(x, y, PEG_RADIUS, {
						isStatic: true,
						render: {
							fillStyle: `hsl(207, 70%, ${30 + row * 7}%)`
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
		const start = WIDTH / 2 - PEG_SPACING;
		const stop = WIDTH / 2 + PEG_SPACING;
		document.querySelector('#drop-ball-button')?.addEventListener('click', () => {
			if (points < DEFAULT_BALL_COST * multiplier) {
				return;
			}
			points -= DEFAULT_BALL_COST * multiplier;
			const randomX = Math.random() * (stop - start) + start;
			const ball = Matter.Bodies.circle(randomX, 50, BALL_RADIUS, {
				restitution: 0.8,
				render: { fillStyle: COLORS[Math.floor(Math.random() * COLORS.length)] },
				label: 'ball-' + multiplier
			});
			Matter.World.add(engine.world, ball);
		});

		Matter.Events.on(engine, 'collisionStart', (event) => {
			event.pairs.forEach((pair) => {
				const { bodyA, bodyB } = pair;
				const isBox = bodyA.label.startsWith('box-')
					? bodyA
					: bodyB.label.startsWith('box-')
						? bodyB
						: null;
				const isBall =
					(bodyA.circleRadius === 10 && !bodyA.isStatic) ||
					(bodyB.circleRadius === 10 && !bodyB.isStatic);

				if (isBox && isBall) {
					isBox.render.fillStyle = '#00a63e';
					const boxNumber = Number(isBox.label.split('-')[1]);
					const ball = isBox === bodyA ? bodyB : bodyA;
					const ballMultiplier = Number(ball.label.split('-')[1]);
					Matter.Body.setStatic(ball, true);
					points +=
						BOXES_OPTIONS[boxNumber > 4 ? 2 * BOXES_OPTIONS.length - boxNumber - 1 : boxNumber]
							.points * ballMultiplier;
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

<main
	class="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#0a0c1a] to-[#1e3a5c] font-sans"
>
	<h2 class="text-4xl font-bold text-white drop-shadow-md">Plinko</h2>
	<p class="mt-4 mb-2 text-center text-lg text-white">Your points: {points}</p>
	<p class="mb-4 text-center text-lg text-white">Current multiplier: {multiplier}x</p>

	<p class="mb-2 text-center text-lg text-white">
		Ball cost: {DEFAULT_BALL_COST * multiplier} points
	</p>
	<div class="flex gap-4">
		<button class="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
			>Buy more points</button
		>
		<button class="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
			>Cash Out</button
		>
	</div>
	<div class="mt-6 flex flex-row items-center gap-4">
		<div class="flex flex-col gap-2">
			{#each BOXES_OPTIONS as box, i}
				<div class="flex w-16 flex-col items-center">
					<div
						class="flex h-6 w-full items-center justify-center rounded-md"
						style="background: {box.color};"
					>
						<span class="text-xs font-bold text-black drop-shadow">
							{box.points * multiplier} pts
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
			{#each MULITIPLIERS as m}
				<button
					class="flex w-16 cursor-pointer flex-col items-center"
					on:click={() => (multiplier = m)}
				>
					<div
						class="flex h-6 w-full items-center justify-center rounded-md text-xs font-bold drop-shadow"
						class:bg-green-500={multiplier === m}
						class:text-black={multiplier !== m}
						class:bg-green-800={multiplier !== m}
						class:text-white={multiplier === m}
					>
						{m}x
					</div>
				</button>
			{/each}
		</div>
	</div>
	<button
		id="drop-ball-button"
		class="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
	>
		Drop a ball
	</button>
</main>
