<script lang="ts">
  export let data;

  async function generateWallet() {
    const response = await fetch('/api/portfel/utworz', { method: 'POST' });
    if (response.ok) {
      // odśwież stronę, żeby pobrać nowe dane z portfelem
      location.reload();
    } else {
      alert('Coś poszło nie tak przy tworzeniu portfela.');
    }
  }
</script>

{#if !data.hasWallet}
  <h1>Brak portfela</h1>
  <p>Nie masz jeszcze portfela. Kliknij poniżej, aby go wygenerować.</p>
  <button on:click={generateWallet}>Wygeneruj portfel</button>
{:else}
  <h1>Twoje saldo</h1>
  <p>Masz już portfel z saldem: <strong>{data.balance?.toFixed(2)} PLN</strong></p>
{/if}
