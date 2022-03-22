<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import { keplrState } from '../stores';
	import { onMount } from 'svelte';
	import { web3, connected, chainId, defaultEvmStores } from "svelte-web3"

	import '../app.css';

	onMount(() => {
		defaultEvmStores.setProvider();
		keplrState.setupKeplr()

		/* setTimeout(() => {
			keplrState.addToken();

		}, 1500) */
	})

</script>

<Header />

<main>
	<slot />
</main>


<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

</style>
