<script>
  export let data;
</script>

<header>
  {#if data.session?.user}
    <p>Witaj, {data.session.user.email}! Masz saldo: {data.balance?.toFixed(2)} PLN</p>
    <form method="POST" action="/auth/signout">
      <button type="submit">Wyloguj</button>
    </form>
  {:else}
    <a href="/auth/signin">Zaloguj się</a>
  {/if}
</header>

<slot />
