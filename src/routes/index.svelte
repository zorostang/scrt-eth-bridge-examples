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

	$: chainName = ethChainIds[$chainId] ?? $chainId 
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<article class="d-flex flex-column container ">
	<h3>SCRT - ETH Bridge Examples</h3>
	<div class="my-3"><Sscrt /></div>
	<div class="my-3"><Eth /></div>

{#if !$connected}
	<p>Not connected</p>
{:else}
	<div class="row mt-2 mt-md-3 md-lg-5">
		<div class="col-6 d-flex flex-column">
			<h5>ETH</h5>
			<div> Chain: { chainName }</div>
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
{/if}

</article>

		


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
