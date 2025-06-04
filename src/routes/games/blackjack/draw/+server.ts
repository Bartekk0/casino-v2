import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const values = [
  'A', '2', '3', '4', '5', '6', '7',
  '8', '9', '10', 'J', 'Q', 'K'
];

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5); // potasuj
}

function draw(deck: any[], count: number) {
  return deck.splice(0, count);
}

export const GET: RequestHandler = async () => {
  const deck = createDeck();

  const player = draw(deck, 2);
  const dealer = draw(deck, 2);

  return json({ deck, player, dealer });
};
