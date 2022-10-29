<script context="module" lang="ts">
	export const prerender = true;
</script>

<script type="ts">
	import { web3, connected, chainId } from "svelte-web3";
	import { scrtAccount, keplrConnected } from "../lib/stores";
	import Sscrt from "../components/sscrt.svelte";
	import Eth from "../components/eth.svelte";

	const ethChainIds = {
		"1" : "Ethereum Mainnet",
		"aa36a7" : "Sepolia",
		"5" : "Goerli"
	}

    const WSCRT = import.meta.env.VITE_ERC20 as string;
    const SETH = import.meta.env.VITE_SETH as string;
    const SSCRT = import.meta.env.VITE_SSCRT as string;


	$: chainName = ethChainIds[$chainId] ?? $chainId 
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<article class="d-flex flex-column container ">
	<h3>SCRT - ETH Bridge Examples</h3>

	<div class="my-2">
		<h6>Contracts:</h6>
		<div class="d-flex gap-3">
			<b>sSCRT:</b>
			<span>{SSCRT}</span>
		</div>
		<div class="d-flex gap-3">
			<b>sETH:</b>
			<span>{SETH}</span>
		</div>
		<div class="d-flex gap-3">
			<b>WSCRT:</b>
			<span>{WSCRT}</span>
		</div>
	</div>

	<div class="my-3"><Sscrt /></div>
	<div class="my-3"><Eth /></div>


	<div class="row mt-2 mt-md-3 md-lg-5">


		<div class="col-6 d-flex flex-column">

			{#if !$connected}
				<p>Metamask not connected</p>
			{:else}

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
			{/if}
		</div>
	
		<div class="col-6 d-flex flex-column">

			{#if !$keplrConnected}
				<p>Keplr not connected</p>
			{:else}
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
			{/if}

		</div>
	</div>

</article>

		


<style>

	span {
		overflow: auto;
	}
</style>
