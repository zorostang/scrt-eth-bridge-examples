<script context="module" lang="ts">
	export const prerender = true;
</script>

<script type="ts">
	import { web3, connected, chainId } from "svelte-web3"
	import { scrtAccount } from "../lib/stores"
	import Sscrt from "../components/sscrt.svelte";
	import Eth from "../components/eth.svelte";

	const ethChainIds = {
		"1" : "Ethereum Mainnet",
		"aa36a7" : "Sepolia",
		"5" : "Goerli"
	}
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	
		<article class="d-flex flex-column">
			<h3>
				SCRT - ETH Bridge Examples
			</h3>

	
			<div class="my-3">
				<Sscrt />
			</div>

			<div class="my-3">
				<Eth />
			</div>


			
		</article>


{#if !$connected}

	<p>Not connected</p>

{:else}

<div class="container">
	<div class="row">
		<div class="col-6 d-flex flex-column">
			<h5>ETH</h5>
			<div> Chain: {ethChainIds[$chainId] ?? $chainId}</div>
			<div class="d-flex flex-wrap">
				{ #await $web3.eth.getAccounts()}
					Loading
				{:then  acc} 
				<span>
					{acc[0]}
				</span>
				{/await}
			</div>
		</div>
	
		<div class="col-6 d-flex flex-column">
			<h5>SCRT</h5>
			<div>Chain: {"pulsar-2"}</div>
			<div class="d-flex flex-wrap">
				{ #if !$scrtAccount}
					Loading
				{:else } 
				<span>
					{$scrtAccount}
				</span>
				{/if}
			</div>
		</div>
	</div>
</div>

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
	span {
		overflow: auto;
	}
</style>
