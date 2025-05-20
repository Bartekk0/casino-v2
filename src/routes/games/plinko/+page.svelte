<script lang="ts">
	import Matter from 'matter-js';
	import { onDestroy, onMount } from 'svelte';

	let engine: Matter.Engine;
	let render: Matter.Render;

	onMount(() => {
		// Create an engine
		engine = Matter.Engine.create();

		// Enable gravity
		engine.gravity.y = 1;
		const width = window.innerWidth;
		const height = window.innerHeight;

		// Create a renderer
		render = Matter.Render.create({
			element: document.body,
			engine: engine,
			options: {
				width: width,
				height: height,
				wireframes: false
			}
		});

		// Create the ground
		const ground = Matter.Bodies.rectangle(400, 590, 800, 20, { isStatic: true });

		// Create pegs
		const pegs = [];
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 10; col++) {
				const x = 100 + col * 60 + (row % 2 === 0 ? 30 : 0);
				const y = 100 + row * 60;
				pegs.push(Matter.Bodies.circle(x, y, 10, { isStatic: true }));
			}
		}

		// Create walls
		const leftWall = Matter.Bodies.rectangle(50, 300, 20, 600, { isStatic: true });
		const rightWall = Matter.Bodies.rectangle(750, 300, 20, 600, { isStatic: true });

		// Add all bodies to the world
		Matter.World.add(engine.world, [ground, leftWall, rightWall, ...pegs]);

		// Replace Matter.Engine.run with Matter.Runner.run to ensure the engine updates correctly
		const runner = Matter.Runner.create();
		Matter.Runner.run(runner, engine);

		// Run the renderer
		Matter.Render.run(render);

		// Add a new ball every second
		const interval = setInterval(() => {
			const randomX = Math.random() * 700 + 50; // Random X position between 50 and 750
			const ball = Matter.Bodies.circle(randomX, 50, 10, { restitution: 0.8 }); // Smaller ball with radius 10
			Matter.World.add(engine.world, ball);
		}, 1000);

		return () => {
			clearInterval(interval);
			Matter.Render.stop(render);
			Matter.Engine.clear(engine);
		};
	});

	// onDestroy(() => {
	// 	Matter.Render.stop(render);
	// 	Matter.Engine.clear(engine);
	// });
</script>

<div id="plinko-container"></div>

<style>
	canvas {
		display: block;
		margin: 0 auto;
		border: 1px solid #ccc;
	}
</style>
