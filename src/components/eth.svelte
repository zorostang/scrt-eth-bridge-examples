<script lang="ts">
    import type {Contract} from 'web3-eth-contract';
    import { keplrState } from "$lib/keplr";
    import { keplrConnected } from "$lib/stores";
    import { postOptions } from "$lib/utils";
	import { web3, connected, selectedAccount } from "svelte-web3"
    import json from "../assets/Contract.json"
    
    const MULTISIG = import.meta.env.VITE_MULTISIG as string; 

    let ethAmount : number, sethAmount : number, ethDestination : string, sethDestination : string;
    let contract : Contract;

    $: if ($connected) contract =  new $web3.eth.Contract(json.abi as any, MULTISIG)


    const ethToSeth = (e) => {
        e.preventDefault();
        if (!$connected) return;

        contract.methods.swap($web3.utils.fromAscii(ethDestination)).send({
            value: $web3.utils.toWei(ethAmount.toString()),
            from: $selectedAccount
        })

        .on("receipt", receipt => {
            console.log("res:", receipt)

            fetch("/transactions", {
                ...postOptions,
                body: JSON.stringify({type: "ethToSeth" , body: receipt.events["Swap"]})
            })
            .then(res => res.json())
            .then(res => {
                console.log("post res",res)
            })
            .catch(e => console.error("post err", e)
            ) 

        })
        .catch(err => console.error(err))
    }

    const sethToeth = (e) => {
        e.preventDefault();
        if (!$keplrConnected) return;

        //(new Promise<void>(resolve => {resolve()}))
        keplrState.sendSeth(Math.round(sethAmount * Math.pow(10, 6)).toString(), sethDestination)
        .then(res => {
            console.log("then")
            //console.log("res:", res)
            fetch("/transactions", {
                ...postOptions,
                body: JSON.stringify({type: "sethToEth" , body: res})
            })
            .then(res => res.json())
            .then(res => {
                console.log("post res",res)
            })
            .catch(e => console.error("post err", e)
            ) 
        })
        .catch(err => console.error(err))


        
    }
</script>


<form class="my-3">
    <label for="sscrt">Swap ETH to SETH</label>
    <div class="form-group d-flex">
        <input type="number" min="0.001"  class="form-control" bind:value={ethAmount}>
        <input type="text" class="form-control" bind:value={ethDestination}>
        <button on:click={ethToSeth} class="btn btn-primary">
            Swap
        </button>
    </div>
</form>

<form class="my-3">
    <label for="sscrt">Swap SETH to ETH</label>
    <div class="form-group d-flex">
        <input type="number"  class="form-control" bind:value={sethAmount}>
        <input type="text" class="form-control" bind:value={sethDestination}>
        <button on:click={sethToeth} class="btn btn-primary">
            Swap
        </button>
    </div>
</form>
