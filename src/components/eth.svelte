<script lang="ts">
    import type {Contract} from 'web3-eth-contract';
    import { keplrState } from "$lib/keplr";
    import { keplrConnected, scrtAccount } from "$lib/stores";
    import { postOptions } from "$lib/utils";
	import { web3, connected, selectedAccount } from "svelte-web3"
    import json from "../assets/Contract.json"
    
    const MULTISIG = import.meta.env.VITE_MULTISIG as string; 

    let 
        ethAmount : number = 0.001, 
        sethAmount : number = 0.001, 
        ethDestination : string = $selectedAccount, 
        sethDestination : string = $scrtAccount;

    let contract : Contract;

    $: if ($connected) {
        contract =  new $web3.eth.Contract(json.abi as any, MULTISIG)
        sethDestination = $selectedAccount
    }
    
    $: if ($keplrConnected) ethDestination = $scrtAccount;


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

        keplrState.sendSeth(Math.round(sethAmount * Math.pow(10, 6)).toString(), sethDestination)
        .then(res => {
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
    <label for="sscrt">Swap ETH to sETH</label>
    <div class="form-group d-flex">
        <input type="number" min="0.001" max="0.1" step="0.001" class="form-control" bind:value={ethAmount}>
        <input type="text" class="form-control" bind:value={ethDestination}>
        <button on:click={ethToSeth} class="btn btn-primary">
            Swap
        </button>
    </div>
</form>

<form class="my-3">
    <label for="sscrt">Swap sETH to ETH</label>
    <div class="form-group d-flex">
        <input type="number" min="0.001" max="0.1" step="0.001"  class="form-control" bind:value={sethAmount}>
        <input type="text" class="form-control" bind:value={sethDestination}>
        <button on:click={sethToeth} class="btn btn-primary">
            Swap
        </button>
    </div>
</form>
