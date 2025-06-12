<script>
	let name = '';
	let email = '';
	let message = '';
	let submitted = false;

	function handleSubmit() {
		submitted = true;
		console.warn("Contact submission not implemented yet");
	}
</script>

<div class="w-md bg-transparent p-8">
	<h1
		class="mb-6 text-center text-3xl font-bold text-white"
		style="
			font-variant: small-caps;
			background: linear-gradient(90deg, #facc15, #fde68a);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
			color: transparent;
		"
	>
		Contact Casino Support
	</h1>
	{#if submitted}
		<div class="mb-4 rounded-full bg-white p-4 text-center text-black">
			Thank you for contacting us!
			<br /> We will get back to you soon.
		</div>
	{:else}
		<form class="space-y-6" on:submit|preventDefault={handleSubmit}>
			<div>
				<label class="mb-2 block font-semibold text-white" for="name">Name</label>
				<input
					id="name"
					type="text"
					class="w-full rounded-3xl border border-white bg-transparent px-4 py-2 text-white focus:ring-2 focus:ring-white focus:outline-none"
					bind:value={name}
					required
				/>
			</div>
			<div>
				<label class="mb-2 block font-semibold text-white" for="email">Email</label>
				<input
					id="email"
					type="email"
					class="w-full rounded-3xl border border-white bg-transparent px-4 py-2 text-white focus:ring-2 focus:ring-white focus:outline-none"
					bind:value={email}
					required
				/>
			</div>
			<div>
				<label class="mb-2 block font-semibold text-white" for="message">Message</label>
				<textarea
					id="message"
					class="w-full rounded-3xl border border-white bg-transparent px-4 py-2 text-white focus:ring-2 focus:ring-white focus:outline-none"
					rows="5"
					bind:value={message}
					required
				></textarea>
			</div>
			<button
				type="submit"
				class=" w-full rounded-full bg-transparent px-4 py-2 font-bold text-white transition hover:bg-white hover:text-black"
			>
				Send Message
			</button>
		</form>
	{/if}
	<div class="mt-6 text-center text-white">
		<p>
			Casino Support Hotline: <span class="font-semibold text-white">+1 800 123 4569</span>
		</p>
		<p>
			Email: <a href="mailto:support@casino.com" class="text-white underline">support@casino.com</a>
		</p>
		<p class="mt-2">3570 S Las Vegas Blvd, Paradise, NV 89109, USA</p>
	</div>
</div>
