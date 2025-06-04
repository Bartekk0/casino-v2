<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	let deck: any[] = [];
	let dealer: any[] = [];
	let dealerHidden = true;

	let playerHands: any[][] = [];
	let currentHandIndex = 0;
	let playerDone = false;
	let message = '';
	let results: string[] = [];
	let canSplit = false;
	let loading = false;

	function cardValue(card: any) {
		if (card.value === 'A') return 11;
		if (['J', 'Q', 'K'].includes(card.value)) return 10;
		return parseInt(card.value);
	}

	function calculateHand(hand: any) {
		let total = 0;
		let aces = 0;
		for (const card of hand) {
			const val = cardValue(card);
			total += val;
			if (card.value === 'A') aces++;
		}
		while (total > 21 && aces) {
			total -= 10;
			aces--;
		}
		return total;
	}

	async function newGame() {
		if (loading) return;
		loading = true;
		const res = await fetch('/games/blackjack/draw');
		const data = await res.json();
		deck = data.deck;
		dealer = data.dealer;
		dealerHidden = true;
		playerHands = [[...data.player]];
		currentHandIndex = 0;
		playerDone = false;
		message = '';
		results = [];
		canSplit = data.player[0].value === data.player[1].value;
		loading = false;
	}

	function hit() {
		if (playerDone || loading) return;
		const hand = playerHands[currentHandIndex];
		hand.push(deck.shift());
		playerHands = [...playerHands];

		const total = calculateHand(hand);
		if (total > 21) {
			nextHand();
		}
	}

	function stand() {
		if (playerDone || loading) return;
		nextHand();
	}

	async function nextHand() {
		if (currentHandIndex < playerHands.length - 1) {
			currentHandIndex++;
		} else {
			playerDone = true;
			dealerHidden = false;
			await new Promise((resolve) => setTimeout(resolve, 700));
			await dealerPlay();
		}
	}

	async function dealerPlay() {
		while (calculateHand(dealer) < 17) {
			dealer.push(deck.shift());
			dealer = [...dealer];
			await new Promise((resolve) => setTimeout(resolve, 400));
		}

		const dealerScore = calculateHand(dealer);
		results = [];

		for (const hand of playerHands) {
			const playerScore = calculateHand(hand);
			if (playerScore > 21) {
				results.push('lose');
			} else if (dealerScore > 21 || playerScore > dealerScore) {
				results.push('win');
			} else if (playerScore < dealerScore) {
				results.push('lose');
			} else {
				results.push('draw');
			}
		}

		message = 'Gra zakończona';
	}

	function split() {
		if (playerDone || loading) return;
		if (!canSplit || playerHands.length > 1) return;

		const original = playerHands[0];
		const card1 = original[0];
		const card2 = original[1];

		playerHands = [
			[card1, deck.shift()],
			[card2, deck.shift()]
		];
		canSplit = false;
	}

	onMount(() => {
		newGame();
	});

	function formatCardClass(card: { value?: string; suit?: string }): string {
		if (!card || !card.value || !card.suit) {
			console.warn('Nieprawidłowa karta:', card);
			return 'unknown';
		}

		const valueMap: Record<string, string> = {
			A: 'a',
			J: 'j',
			Q: 'q',
			K: 'k'
		};

		const suitMap: Record<string, string> = {
			spades: 's',
			hearts: 'h',
			diamonds: 'd',
			clubs: 'c'
		};

		const val = valueMap[card.value] ?? card.value.toLowerCase();
		const suit = suitMap[card.suit.toLowerCase()];
		if (!suit) {
			console.warn('Nieznany kolor karty:', card.suit);
			return 'unknown';
		}
		return `${val}${suit}`;
	}
</script>


<h1>Blackjack</h1>

<h2>Dealer</h2>
<div class="cards">
	{#each dealer as card, i (card.value + card.suit + i)}
		<div class="card-container" in:fly={{ y: 40, duration: 300 }} out:fade>
			{#if i === 0}
				<div class="flip-card {dealerHidden ? '' : 'flipped'}">
					<div class="flip-front">
						<span class="pcard-back"></span>
					</div>
					<div class="flip-back">
						<span class={`pcard pcard-${formatCardClass(card)}`}></span>
					</div>
				</div>
			{:else}
				<span class={`pcard pcard-${formatCardClass(card)}`}></span>
			{/if}
		</div>
	{/each}
</div>

{#if !dealerHidden}
	<p>Punkty: {calculateHand(dealer)}</p>
{/if}

<h2>Gracz</h2>
{#each playerHands as hand, i}
	<div class="hand {i === currentHandIndex ? 'active' : ''} {results[i]}" style="width: fit-content;">
		<div class="cards">
			{#each hand as card}
				<div class="card-container" in:fly={{ y: 40, duration: 300 }} out:fade>
					<span class={`pcard pcard-${formatCardClass(card)}`}></span>
				</div>
			{/each}
		</div>
		<p>Punkty: {calculateHand(hand)}</p>
	</div>
{/each}

<div class="controls">
	<button on:click={hit} disabled={playerDone || loading}>Dobierz (Hit)</button>
	<button on:click={stand} disabled={playerDone || loading}>Stop (Stand)</button>
	<button on:click={split} disabled={!canSplit || playerHands.length > 1 || loading}>Split</button>
	<button on:click={newGame} disabled={loading}>Restart</button>
</div>

<p>{message}</p>

<style>
	@import './playing-cards.min.css';

	body {
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: #f0f4f8;
		margin: 0;
		padding: 2rem;
		color: #222;
		user-select: none;
	}

	h1,
	h2 {
		text-align: center;
		margin-bottom: 1rem;
		font-weight: 700;
		color: #004d99;
	}

	.cards {
		display: flex;
		gap: 16px;
		flex-wrap: nowrap;
		overflow-x: auto;
		justify-content: center;
		margin-bottom: 0.75rem;
		padding-bottom: 8px;
		overflow: hidden;
	}

	.cards::-webkit-scrollbar {
		height: 8px;
	}

	.cards::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
	}

	.hand {
		border: 2px dashed #aaa;
		padding: 14px;
		border-radius: 14px;
		margin-bottom: 2rem;
		width: 100%;
		max-width: none;
		background-color: #fff;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		transition:
			background-color 0.3s ease,
			border-color 0.3s ease;
	}

	.hand.active {
		border-color: #007acc;
		background-color: #e3f0ff;
		box-shadow: 0 0 14px 3px rgba(102, 170, 255, 0.4);
	}

	.hand.win {
		border-color: #4caf50;
		background-color: #e6f9ea;
	}

	.hand.lose {
		border-color: #f44336;
		background-color: #fdecea;
	}

	.hand.draw {
		border-color: #9e9e9e;
		background-color: #f4f4f4;
	}

	.controls {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 1.5rem;
	}

	button {
		padding: 14px 28px;
		font-size: 1.1rem;
		border: none;
		border-radius: 8px;
		background-color: #007acc;
		color: white;
		cursor: pointer;
		font-weight: 700;
		box-shadow: 0 3px 8px rgba(0, 122, 204, 0.5);
		transition:
			background-color 0.25s ease,
			box-shadow 0.25s ease;
	}

	button:disabled {
		background-color: #aaa;
		cursor: not-allowed;
		box-shadow: none;
	}

	button:hover:enabled {
		background-color: #005f99;
		box-shadow: 0 4px 12px rgba(0, 95, 153, 0.7);
	}

	p {
		text-align: center;
		font-weight: 700;
		font-size: 1.2rem;
		color: #222;
		margin-top: 0.5rem;
	}

	.flip-container {
		perspective: 1200px;
		width: 140px;
		height: 200px;
		margin: 0 8px;
		flex: 0 0 auto;
	}

	.flip-card {
		width: 100%;
		height: 100%;
		position: relative;
		transform-style: preserve-3d;
		transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: default;
		user-select: none;
	}

	.flip-card.flipped {
		transform: rotateY(180deg);
	}

	.flip-front,
	.flip-back {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		user-select: none;
        background: white;
	}

	.flip-front {
		background-color: #444;
		color: white;
	}

	.flip-back {
		transform: rotateY(180deg);
	}

	.card-container {
		width: 140px;
		height: 210px;
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: default;
		user-select: none;
	}

	.pcard {
		display: inline-block;
		width: 120px !important;
		height: 170px !important;
		background-size: contain !important;
		background-repeat: no-repeat !important;
	}

	.cards > * {
		flex-shrink: 0;
	}

	@media (max-width: 600px) {
		.flip-container,
		.card-container {
			width: 100px;
			height: 140px;
		}
		.flip-front,
		.flip-back,
		.card {
			font-size: 2.5rem;
		}
		.pcard {
			width: 85px !important;
			height: 120px !important;
		}
		button {
			padding: 10px 20px;
			font-size: 0.95rem;
		}
	}
    .pcard-back{
        width: 120px !important;
		height: 170px !important;
    }
    .flip-front{
        background: white;
    }
    .hand{
        margin: 30px auto;
    }
</style>
