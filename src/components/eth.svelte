<script lang="ts">
    import type {Contract} from 'web3-eth-contract';
    import { keplrState } from "$lib/keplr";
    import { keplrConnected, scrtAccount } from "$lib/stores";
    import { postOptions } from "$lib/utils";
	import { web3, connected, selectedAccount } from "svelte-web3"
    import json from "../assets/Contract.json"
    import Loading from './loading.svelte';
    
    const MULTISIG = import.meta.env.VITE_MULTISIG; 

    let 
        ethLoading : boolean = false,
        ethError : string = "",
        ethAmount : number = 0.001, 
        ethDestination : string = "", 
        ethTx1 : string = "",
        ethTx2 : string = "",

        sethLoading : boolean = false,
        sethError : string = "",
        sethAmount : number = 0.001, 
        sethDestination : string = "", 
        sethTx1 : string = "",
        sethTx2 : string = "";


    let contract : Contract;

    $: if ($connected) {
        contract =  new $web3.eth.Contract(json.abi as any, MULTISIG)
        sethDestination = $selectedAccount
    }
    
    $: if ($keplrConnected) ethDestination = $scrtAccount;


    $: ethDisabled = !$connected || ethLoading || ethAmount === 0 || !ethDestination
    $: sethDisabled = !$keplrConnected || sethLoading || sethAmount === 0 || !sethDestination
  

    const ethChecks = () => {
        let passed = true;
        if (!$connected) {
            ethError = "Metamask is not connected"
            passed = false;
        }
        if (ethAmount === 0) {
            ethError = "WSCRT amount is zero"
            passed = false;
        }

        if (!ethDestination) {
            ethError = "Destination is not specified"
            passed = false;
        }
        return passed;
    }

    const sethChecks = () => {
        let passed = true;
        if (!$keplrConnected) {
            sethError = "Keplr is not connected"
            passed = false;
        }
        if (sethAmount === 0) {
            sethError = "WSCRT amount is zero"
            passed = false;
        }

        if (!sethDestination) {
            sethError = "Destination is not specified"
            passed = false;
        }
        return passed;
    }


    const ethToSeth = (e) => {
        e.preventDefault();

        ethTx1 = ""; ethTx2 = "";

        if (!ethChecks()) return;

        ethError = "";
        ethLoading = true;

        contract.methods.swap($web3.utils.fromAscii(ethDestination)).send({
            value: $web3.utils.toWei(ethAmount.toString()),
            from: $selectedAccount
        })
        .on("receipt", receipt => {
            console.log("res:", receipt)
            ethTx1 = receipt.transactionHash;

            fetch("/transactions", {
                ...postOptions,
                body: JSON.stringify({type: "ethToSeth" , body: receipt.events["Swap"]})
            })
            .then(async res => {
                if (res.ok) return await res.json()
                else {
                    const j = await res.json()
                    throw new Error(j.message ?? "Error swapping")
                }
            })
            .then(res => {
                console.log("post res",res)
                ethTx2 = res.txHash;
            })
            .catch(e => {
                console.error("post err", e)
                if (e.txHash)  ethTx2 = e.txHash;
                ethError = e.message ?? JSON.stringify(e);
            })
            .finally(() => ethLoading = false)

        })
        .on('error', (e) => {
            ethError = e.message ?? JSON.stringify(e);
            ethLoading = false;
            console.error("Error:", e);
        })
    }


    const sethToeth = (e) => {
        e.preventDefault();

        sethTx1 = ""; sethTx2 = "";

        if (!sethChecks()) return;

        sethError = "";
        sethLoading = true;

        keplrState.sendSeth(Math.round(sethAmount * Math.pow(10, 6)).toString(), sethDestination)
        .then(rec => {

            sethTx1 = rec.transactionHash;

            fetch("/transactions", {
                ...postOptions,
                body: JSON.stringify({type: "sethToEth" , body: rec})
            })
            .then(async res => {
                if (res.ok) return await res.json()
                else throw new Error(await res.json())
            })
            .then(res => {
                console.log("post res",res)
                sethTx2 = res.txHash;
            })
            .catch(e => {
                if (e.txHash)  sethTx2 = e.txHash;
                sethError = e.message ?? JSON.stringify(e)
            })
            .finally(() => sethLoading = false)

        })
        .catch(err => {
            sethError = e.message ?? e.toString();
            sethLoading = false
            console.error(err)
        })


        
    }
</script>


<form class="my-3">
    <h6>Swap ETH to sETH</h6>
    <div class="row d-flex justify-content-between gy-2">
        <div class="col-4 col-md-2">
            <input type="number" min="0.001" max="0.1" step="0.001" class="form-control" bind:value={ethAmount}>
        </div>
        <div class="col-8 col-md-6 col-lg-8">
            <input type="text" class="form-control" bind:value={ethDestination}>
        </div>
        <div class="col-12 col-md-4 col-lg-2 d-flex justify-content-end">
            <button on:click={ethToSeth} disabled={ethDisabled} class="btn btn-success">
                Swap
            </button>
        </div>
    </div>

    { #if ethLoading }
        <div class="d-flex mt-2 ps-1">
            <Loading />
        </div>
    { /if }

    { #if ethError }
        <div class="d-flex gap-2 error flex-wrap">
            <b>Error:</b>
            <span>{ethError}</span>
        </div>
    { /if }

    { #if ethTx1 }
        <div class="d-flex gap-2 flex-wrap">
            <b>TxHash1:</b>
            <span>{ethTx1}</span>
        </div>
    { /if }

    { #if ethTx2 }
        <div class="d-flex gap-2 flex-wrap">
            <b>TxHash2:</b>
            <span>{ethTx2}</span>
        </div>
    { /if }
</form>



<form class="my-3">
    <h6>Swap Swap sETH to ETH</h6>
    <div class="row d-flex justify-content-between gy-2">
        <div class="col-4 col-md-2">
            <input type="number" min="0.001" max="0.1" step="0.001"  class="form-control" bind:value={sethAmount}>
        </div>
        <div class="col-8 col-md-6 col-lg-8">
            <input type="text" class="form-control" bind:value={sethDestination}>
        </div>
        <div class="col-12 col-md-4 col-lg-2 d-flex justify-content-end">
            <button on:click={sethToeth} disabled={sethDisabled} class="btn btn-success">
                Swap
            </button>
        </div>
    </div>

    { #if sethLoading }
        <div class="d-flex mt-2 ps-1">
            <Loading />
        </div>
    { /if }

    { #if sethError }
        <div class="d-flex gap-2 error flex-wrap">
            <b>Error:</b>
            <span>{sethError}</span>
        </div>
    { /if }

    { #if sethTx1 }
        <div class="d-flex gap-2 flex-wrap">
            <b>TxHash1:</b>
            <span>{sethTx1}</span>
        </div>
    { /if }

    { #if sethTx2 }
        <div class="d-flex gap-2 flex-wrap">
            <b>TxHash2:</b>
            <span>{sethTx2}</span>
        </div>
    { /if }

</form>

