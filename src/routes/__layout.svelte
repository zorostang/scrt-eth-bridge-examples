<script lang="ts">
	import { keplrState } from '../lib/keplr';
	import { onMount } from 'svelte';
	import { web3, connected, chainId, defaultEvmStores } from "svelte-web3"

	import '../app.css';

	onMount(() => {
		defaultEvmStores.setProvider();
		keplrState.setupKeplr()

		/* setTimeout(() => {
			keplrState.addToken()
			.then(res => console.log(res))
			.catch(e => console.error(e));

		}, 1500) */

		/* setTimeout(() => {
			keplrState.getBalance()
			.then(res => console.log(res))
			.catch(e => console.error(e));

		}, 1500) */

		/* setTimeout(() => {
			keplrState.setKey()
			.then(res => console.log("key", JSON.stringify(res)))
			.catch(e => console.error(e));

		}, 1500) */

		/* setTimeout(() => {
			keplrState.getLastBurnedTokens()
			.then(res => console.log(res))
			.catch(e => console.error(e));

		}, 1500) */
	})

</script>


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
