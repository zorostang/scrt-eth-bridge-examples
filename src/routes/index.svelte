<script context="module" lang="ts">
	export const prerender = true;
</script>


<script type="ts">
	import { onMount } from "svelte";
	import { web3, connected, chainId } from "svelte-web3"
	import Sscrt from "../components/sscrt.svelte";
	import Eth from "../components/eth.svelte";
	import { keplrState } from "../stores"


	onMount(async () => {
		console.log("Keplr is available:")
		console.log(JSON.stringify(keplrState))

		/* fetch('/transactions')
		.then(async res => console.log(await res.text())) */
			
	})
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	
		<article class="d-flex flex-column">
			<h3>
				SCRT - ETH Bridge Example
			</h3>

			<p>
				Contract Address:
				{ import.meta.env.VITE_ETH_GOV_TOKEN_ADDRESS }
			</p>

			<div class="my-3">
				<Sscrt />
			</div>

			<div class="my-3">
				<Eth />
			</div>



			
		</article>


{#if !$connected}

<p>My application is not yet connected</p>

{:else}

<p>Connected to chain with id {$chainId}</p>
<p>
	{ #await $web3.eth.getAccounts()}
		Waiting
	{:then  acc} 
		My address: {acc[0]}
	{/await}
</p>

{/if}
		
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
