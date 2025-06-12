<script lang="ts">
  export let card: { value: string; suit: string };
  
  const suitSymbols: any = {
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣',
    'spades': '♠'
  };
  
  const redSuits = ['hearts', 'diamonds'];
  const isRed = redSuits.includes(card.suit);
</script>

<svg
  width="60"
  height="80"
  viewBox="0 0 60 80"
  xmlns="http://www.w3.org/2000/svg"
  style="border-radius: 8px; border: 1px solid #ccc; background: white;"
>
  <rect width="60" height="80" rx="8" ry="8" fill="white" />
  
  <text
    x="8"
    y="20"
    font-size="16"
    font-weight="bold"
    fill={isRed ? 'red' : 'black'}
  >
    {card.value}
  </text>
  
  <text
    x="50"
    y="70"
    font-size="20"
    font-weight="bold"
    fill={isRed ? 'red' : 'black'}
    text-anchor="end"
  >
    {suitSymbols[card.suit]}
  </text>
</svg>
