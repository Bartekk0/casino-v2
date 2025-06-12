<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  type Card = { suit: string; value: string };

  let phase: 'bet' | 'play' = 'bet';
  let stake = 1;
  let balance = 0;
  let loading = false;

  let gameId: string;
  let playerHands: Card[][] = [];
  let dealer: Card[] = [];
  let dealerHidden = true;
  let currentHand = 0;
  let splitAllowed = false;
  let outcomes: ('win' | 'lose' | 'draw')[] = [];
  let message = '';

  function cardValue(v: string) {
    if (v === 'A') return 11;
    if (['J','Q','K'].includes(v)) return 10;
    return +v;
  }

  function handValue(h: Card[]) {
    let t = 0, ac = 0;
    for (const c of h) {
      const v = cardValue(c.value);
      t += v;
      if (c.value === 'A') ac++;
    }
    while (t > 21 && ac > 0) { t -= 10; ac--; }
    return t;
  }

  onMount(async () => {
    const res = await fetch('/api/portfel/balance');
    if (res.ok) balance = (await res.json()).balance;
  });

  async function start() {
    if (loading || stake <= 0 || stake > balance) return;
    loading = true;
    const res = await fetch('/games/blackjack/draw', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ action: 'start', stake })
    });
    const d = await res.json();
    loading = false;
    if (!res.ok) return alert(d.error);

    phase = 'play';
    gameId = d.gameId;
    balance = d.balance;
    playerHands = [d.player];
    dealer = d.dealer;
    dealerHidden = true;
    currentHand = 0;
    splitAllowed = d.splitAllowed;
    outcomes = [];
    message = '';
  }

  async function action(act: 'hit'|'stand'|'split') {
    if (loading) return;
    loading = true;
    const res = await fetch('/games/blackjack/draw', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ action: act, gameId })
    });
    const d = await res.json();
    loading = false;
    if (!res.ok) return alert(d.error);

    // update player hands & currentHand
    if (d.playerHands) playerHands = d.playerHands;
    if (d.currentHand != null) currentHand = d.currentHand;

    // if transition to dealer phase
    if (d.dealer) {
      dealerHidden = false;
      dealer = d.dealer;
      outcomes = d.outcomes;
      balance = d.balance;
      message = 'Gra zakończona';
      return;
    }

    // bust detection client-side & trigger dealer
    const hand = playerHands[currentHand];
    if (handValue(hand) > 21) {
      // auto-stand on bust
      await action('stand');
    }
  }
</script>

{#if phase === 'bet'}
  <div class="bet-screen">
    <h2>Obstaw</h2>
    <p>Saldo: {balance.toFixed(2)} zł</p>
    <input type="number" bind:value={stake} min="1" max={balance} step="1" />
    <button on:click={start} disabled={loading||stake>balance}>Graj</button>
  </div>
{:else}
  <div class="game-screen">
    <h2>Dealer</h2>
    <div class="cards">
      {#each dealer as c, i}
        <div class="card-container" in:fly={{ y: 40, duration: 300 }}>
          {#if i === 0}
            <div class="flip-card {dealerHidden ? '' : 'flipped'}">
              <div class="flip-front"><span class="pcard-back"></span></div>
              <div class="flip-back"><span class="pcard pcard-{c.value.toLowerCase()}{c.suit[0]}"/></div>
            </div>
          {:else}
            <span class="pcard pcard-{c.value.toLowerCase()}{c.suit[0]}" />
          {/if}
        </div>
      {/each}
    </div>
    {#if !dealerHidden}<p>Punkty: {handValue(dealer)}</p>{/if}

    <h2>Ty</h2>
    {#each playerHands as hand, idx}
      <div class="hand {idx === currentHand ? 'active' : ''} {outcomes[idx]}">
        <div class="cards">
          {#each hand as c}
            <div class="card-container" in:fly={{ y: 40, duration: 300 }}>
              <span class="pcard pcard-{c.value.toLowerCase()}{c.suit[0]}" />
            </div>
          {/each}
        </div>
        <p>Punkty: {handValue(hand)}</p>
        {#if outcomes[idx]}<p class={outcomes[idx]}>{outcomes[idx]}</p>{/if}
      </div>
    {/each}

    <div class="controls">
      <button on:click={() => action('hit')} disabled={loading}>Dobierz (Hit)</button>
      <button on:click={() => action('stand')} disabled={loading}>Stop (Stand)</button>
      <button on:click={() => action('split')} disabled={!splitAllowed||loading}>Split</button>
    </div>
    <p>{message}</p>
    <p class="balance">Saldo: {balance.toFixed(2)} zł</p>
  </div>
{/if}

<style>
	@import './playing-cards.min.css';

	h1,
	h2 {
		text-align: center;
		margin-bottom: 1rem;
		font-weight: 700;
		color: #ffd700;
		font-size: 1.5em;
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
		background: rgba(255, 215, 0, 0.4);
		border-radius: 4px;
	}

	.hand {
		border: 2px dashed #ffd700;
		padding: 14px;
		border-radius: 14px;
		margin-bottom: 2rem;
		width: 100%;
		background-color: rgba(255, 215, 0, 0.05);
		box-shadow: 0 2px 10px rgba(255, 215, 0, 0.1);
		transition:
			background-color 0.3s ease,
			border-color 0.3s ease;
		color: white;
	}

	.hand.active {
		border-color: #ffea70;
		background-color: rgba(255, 215, 0, 0.15);
		box-shadow: 0 0 14px 3px rgba(255, 215, 0, 0.4);
	}

	.hand.win {
		border-color: #ffd700;
		background-color: rgba(255, 215, 0, 0.3);
	}

	.hand.lose {
		border-color: #ff4d4d;
		background-color: rgba(255, 0, 0, 0.1);
	}

	.hand.draw {
		border-color: #aaa;
		background-color: #222;
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
		background-color: #ffd700;
		color: #000;
		cursor: pointer;
		font-weight: 700;
		box-shadow: 0 3px 8px rgba(255, 215, 0, 0.4);
		transition:
			background-color 0.25s ease,
			box-shadow 0.25s ease;
	}

	button:disabled {
		background-color: #666;
		color: #ccc;
		cursor: not-allowed;
		box-shadow: none;
	}

	button:hover:enabled {
		background-color: #ffea70;
		box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
	}

	p {
		text-align: center;
		font-weight: 700;
		font-size: 1.2rem;
		color: white;
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
	}

	.flip-front {
		background: rgba(0, 0, 0, 0);
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

	.pcard-back {
		width: 120px !important;
		height: 170px !important;
	}

	.flip-front {
		background: rgba(0, 0, 0, 0);
	}

	.hand {
		margin: 30px auto;
	}
</style>
