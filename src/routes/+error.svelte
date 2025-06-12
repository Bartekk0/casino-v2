<script lang="ts">
	import { page } from '$app/state';
</script>

<main class="left-center">
	<h1 class="text-6xl">{page.status} Error</h1>
	<p class="text-2xl">{page.error?.message}</p>
</main>
