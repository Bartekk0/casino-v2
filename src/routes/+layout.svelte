<script>
  export let data;
</script>

<header>
  {#if data.session?.user}
    <p>
      Witaj, {data.session.user.email}! 
      {#if data.walletExists}
        Masz saldo: {data.balance?.toFixed(2)} PLN
      {:else}
        <a href="/konto/brak-portfela">Nie masz portfela, kliknij tutaj, aby go utworzyć</a>
      {/if}
    </p>
    <form method="POST" action="/auth/signout">
      <button type="submit">Wyloguj</button>
    </form>
  {:else}
    <a href="/auth/signin">Zaloguj się</a>
  {/if}
</header>

<slot />
