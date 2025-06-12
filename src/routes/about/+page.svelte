<script>
	const authors = ['Bartosz Wątorek 3P', 'Mikołaj Dworak 3P'].sort(() => Math.random() - 0.5);
	const headingClass = 'mb-4 text-3xl font-bold text-yellow-400';
	const headingStyle =
		'font-variant: small-caps; background: linear-gradient(90deg, #facc15, #fde68a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent;';
</script>

<div class="mx-auto my-12 max-w-4xl rounded-xl p-12 text-white shadow-lg">
	<div class="mb-12 grid grid-cols-2 gap-12">
		<div class="col-span-1 flex flex-col items-center space-y-4">
			<img src="/about/info-button.png" alt="Info Button" class="mb-4 h-16 w-16 invert" />
			<h1 class={headingClass} style={headingStyle}>About Casino</h1>
			<p class="text-center text-lg leading-relaxed">
				Welcome to Casino, your premier online destination for thrilling casino games and
				entertainment! Our mission is to provide a safe, fair, and exciting gaming experience for
				players of all levels.
			</p>
		</div>
		<div class="col-span-1 flex flex-col items-center space-y-4">
			<img src="/about/games.png" alt="Games" class="mb-4 h-16 w-16 invert" />
			<h2 class={headingClass} style={headingStyle}>Games</h2>
			<ul class="space-y-2 text-center text-lg">
				<li>Classic and modern slot machines</li>
				<li>Table games like Blackjack, Roulette</li>
				<li>Live dealer experiences</li>
				<li>Exciting tournaments and promotions</li>
			</ul>
		</div>
		<div class="col-span-1 flex flex-col items-center space-y-4">
			<img src="/about/shield.png" alt="Security" class="mb-4 h-16 w-16 invert" />
			<h2 class={headingClass} style={headingStyle}>Security</h2>
			<p class="text-center text-lg leading-relaxed">
				We are committed to responsible gaming and offer tools to help you play safely. Our platform
				uses the latest security technology to ensure your data and transactions are protected.
			</p>
		</div>
		<div class="col-span-1 flex flex-col items-center space-y-4">
			<img src="/about/about.png" alt="People" class="mb-4 h-16 w-16 invert" />
			<h2 class={headingClass} style={headingStyle}>Authors</h2>
			<ul class="space-y-2 text-center text-lg" id="authors">
				{#each authors as author}
					<li class="text-white">{author}</li>
				{/each}
			</ul>
		</div>
	</div>
	<hr class="my-8 border-yellow-400" />
	<p class="text-center text-xl leading-relaxed">
		Thank you for choosing Casino. Good luck and have fun!
	</p>
</div>
