<script lang="ts">
	import Matter from 'matter-js';
	import { onDestroy, onMount } from 'svelte';

	let engine: Matter.Engine;
	let render: Matter.Render;

	const HEIGHT = 600,
		WIDTH = 700,
		BALL_RADIUS = 10,
		PEG_RADIUS = 7,
		WALL_WIDTH = 20,
		GROUND_HEIGHT = WALL_WIDTH,
		PEG_SPACING = 60,
		PEG_ROWS = 8,
		PEG_COLS = 10,
		COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'],
		BOXES_OPTIONS = [
			{
				color: '#ff4e50', // red-orange
				points: 10
			},
			{
				color: '#fc913a', // orange
				points: 8
			},
			{
				color: '#f9d423', // yellow
				points: 6
			},
			{
				color: '#eae374', // light yellow
				points: 4
			},
			{
				color: '#e1f5c4', // pale green
				points: 2
			}
		].reverse(); // Reverse the order for bottom boxes
	onMount(() => {
		// Create an engine
		engine = Matter.Engine.create();

		// Enable gravity
		engine.gravity.y = 1;

		// Create a renderer
		render = Matter.Render.create({
			element: document.getElementById('plinko-container') || document.body,
			engine: engine,
			options: {
				width: WIDTH,
				height: HEIGHT + WIDTH / 20,
				wireframes: false,

				// background: '#6a8c5a'
				background: '#ecf0f1'
			}
		});

		// Create the ground

		const boxes = [];
		const boxWidth = WIDTH / 10;
		for (let i = 0; i < 10; i++) {
			const x = boxWidth / 2 + i * boxWidth;
			const y = HEIGHT - boxWidth / 4;
			console.log(
				i >= BOXES_OPTIONS.length,
				BOXES_OPTIONS.length + (BOXES_OPTIONS.length - i) - 1,
				i
			);

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

		// Create pegs
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
			isStatic: true
		});
		const rightWall = Matter.Bodies.rectangle(
			WIDTH + WALL_WIDTH / 2,
			HEIGHT / 2,
			WALL_WIDTH,
			HEIGHT,
			{
				isStatic: true
			}
		);

		Matter.World.add(engine.world, [leftWall, rightWall, ...pegs]);
		// ground,
		// Add boxes at the bottom for the ball to fall into
		// const boxes = [];
		// for (let i = 0; i < 10; i++) {
		// 	const x = 80 + i * 70; // Position boxes evenly across the bottom
		// 	const box = Matter.Bodies.rectangle(x, 550, 60, 20, { isStatic: true });
		// 	boxes.push(box);
		// }
		// Matter.World.add(engine.world, boxes);

		// Replace Matter.Engine.run with Matter.Runner.run to ensure the engine updates correctly
		const runner = Matter.Runner.create();
		Matter.Runner.run(runner, engine);

		// Run the renderer
		Matter.Render.run(render);

		// Add a click event listener to the canvas
		const start = WIDTH / 2 - PEG_SPACING;
		const stop = WIDTH / 2 + PEG_SPACING;
		// const ball1 = Matter.Bodies.circle(start, 50, 10, { restitution: 0.8, isStatic: true });
		// const ball2 = Matter.Bodies.circle(stop, 50, 10, { restitution: 0.8, isStatic: true });
		// Matter.World.add(engine.world, [ball1, ball2]);
		render.canvas.addEventListener('click', () => {
			const randomX = Math.random() * (stop - start) + start;
			const ball = Matter.Bodies.circle(randomX, 50, BALL_RADIUS, {
				restitution: 0.8,
				render: { fillStyle: COLORS[Math.random() * COLORS.length] }
			}); // Smaller ball with radius 10
			Matter.World.add(engine.world, ball);
		});

		const checkCollision = (
			event: Matter.IEventCollision<Matter.Engine>,
			label1: string,
			label2: string
		) => {
			const pairs = event.pairs;
			for (let i = 0; i < pairs.length; i++) {
				const pair = pairs[i];
				if (
					(pair.bodyA.label === label1 && pair.bodyB.label === label2) ||
					(pair.bodyA.label === label2 && pair.bodyB.label === label1)
				) {
					return true;
				}
			}
			return false;
		};

		Matter.Events.on(engine, 'collisionStart', (event) => {
			event.pairs.forEach((pair) => {
				const { bodyA, bodyB } = pair;
				// Check if one body is a box and the other is a ball (radius 10)
				const isBox = bodyA.label.startsWith('box-')
					? bodyA
					: bodyB.label.startsWith('box-')
						? bodyB
						: null;
				const isBall =
					(bodyA.circleRadius === 10 && !bodyA.isStatic) ||
					(bodyB.circleRadius === 10 && !bodyB.isStatic);

				if (isBox && isBall) {
					const boxNumber = isBox.label.split('-')[1];
					console.log('Ball touched box number:', boxNumber);
					const ball = isBox === bodyA ? bodyB : bodyA;
					Matter.Body.setStatic(ball, true);
					setTimeout(() => {
						Matter.World.remove(engine.world, ball);
					}, 100);
				}
			});
		});

		return () => {
			Matter.Render.stop(render);
			Matter.Engine.clear(engine);
		};
	});

	// onDestroy(() => {
	// 	Matter.Render.stop(render);
	// 	Matter.Engine.clear(engine);
	// });
</script>

<main class="flex h-screen w-full items-center justify-center bg-gray-100">
	<div id="plinko-container"></div>
</main>
