<script context="module" lang="ts">
	export const prerender = true;
</script>


<script type="ts">
import { onMount } from "svelte";

import { web3, connected, chainId, defaultEvmStores } from "svelte-web3"

//let ethState;

onMount(async () => {
	//ethState = await (import("../eth.svelte"));
	defaultEvmStores.setProvider()

})
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	
		<article>
			<h3>
				SCRT - ETH Bridge Example
			</h3>

			<p>
				{ import.meta.env.VITE_ETH_GOV_TOKEN_ADDRESS }
			</p>
		</article>


{#if !$connected}

<p>My application is not yet connected</p>

{:else}

<p>Connected to chain with id {$chainId}</p>

{/if}
		

		<div>
			<button type="button">Button</button>
		</div>

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}


</style>
