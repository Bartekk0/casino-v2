<script lang="ts">
  import { onMount } from 'svelte';

  let deck: any[] = [];
  let player: any[] = [];
  let dealer: any[] = [];
  let dealerHidden = true;

  let playerDone = false;
  let message = '';

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
    const res = await fetch('/games/blackjack/draw');
    const data = await res.json();
    deck = data.deck;
    player = data.player;
    dealer = data.dealer;
    dealerHidden = true;
    playerDone = false;
    message = '';
  }

  function hit() {
    if (playerDone) return;
    player.push(deck.shift());
    player = [...player]
    const total = calculateHand(player);
    if (total > 21) {
      message = 'Przegrałeś! Masz więcej niż 21.';
      dealerHidden = false;
      playerDone = true;
    }
  }

  function stand() {
    playerDone = true;
    dealerHidden = false;

    while (calculateHand(dealer) < 17) {
      dealer.push(deck.shift());
      dealer = [...dealer]
    }

    const playerScore = calculateHand(player);
    const dealerScore = calculateHand(dealer);

    if (dealerScore > 21 || playerScore > dealerScore) {
      message = 'Wygrałeś!';
    } else if (playerScore < dealerScore) {
      message = 'Przegrałeś!';
    } else {
      message = 'Remis!';
    }
  }

  onMount(() => {
    newGame();
  });
</script>

<style>
  .cards {
    display: flex;
    gap: 10px;
    margin-bottom: 1rem;
  }
  .card {
    padding: 12px 16px;
    border: 1px solid #333;
    border-radius: 6px;
    font-size: 1.2rem;
    min-width: 40px;
    text-align: center;
    background: white;
  }
</style>

<h1>Blackjack</h1>

<div>
  <h2>Dealer</h2>
  <div class="cards">
    {#each dealer as card, i}
      <div class="card">
        {#if i === 0 || !dealerHidden}
          {card.value}{card.suit}
        {:else}
          ??
        {/if}
      </div>
    {/each}
  </div>

  <h2>Gracz</h2>
  <div class="cards">
    {#each player as card}
      <div class="card">{card.value}{card.suit}</div>
    {/each}
  </div>

  <p>Twoje punkty: {calculateHand(player)}</p>

  <button on:click={hit} disabled={playerDone}>Dobierz (Hit)</button>
  <button on:click={stand} disabled={playerDone}>Stop (Stand)</button>
  <button on:click={newGame}>Restart</button>

  <p>{message}</p>
</div>
