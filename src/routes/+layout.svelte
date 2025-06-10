<script lang="ts">
  export let data;
  console.log('session in component:', data.session);
</script>

{#if data.session}
  <p>Witaj, {data.session.user!.email}</p>
  <form method="POST" action="/auth/signout">
    <button type="submit">Wyloguj</button>
  </form>
{:else}
  <a href="/auth/signin">Zaloguj się</a>
{/if}

<slot />