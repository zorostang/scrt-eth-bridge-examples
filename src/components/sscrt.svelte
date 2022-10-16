<script lang="ts">

    import { keplrState } from "../lib/keplr"
	import { web3, connected, selectedAccount } from "svelte-web3"
    import { keplrConnected, scrtAccount } from "$lib/stores";

    import json  from "../assets/ERC20.json"
    import { onMount } from "svelte";
    import { postOptions } from "$lib/utils";
    import type {Contract} from 'web3-eth-contract';


    const WSCRT_ADDRESS = import.meta.env.VITE_ERC20 as string;
    const MANAGER_ADDRESS = import.meta.env.VITE_MULTISIG as string;
    const ERC20_ADDRESS = import.meta.env.VITE_ERC20 as string;;

    
    let 
        sscrtAmount : number = 1, 
        wscrtAmount : number = 1,
        sscrtDestination = "", 
        wscrtDestination = "";

    $: if ($connected ) wscrtDestination = $selectedAccount;
    $: if ($keplrConnected) sscrtDestination = $scrtAccount;

    const allow = () => {
        const contract : Contract =  new $web3.eth.Contract(json.abi as any, ERC20_ADDRESS)
        contract.methods.increaseAllowance(
            MANAGER_ADDRESS,
            $web3.utils.toWei(wscrtAmount.toString(), 'szabo'),
        )
        .send({ value: "0", from: $selectedAccount})
    }

    const sscrtToWscrt = (e : any) => {
        e.preventDefault();

        //(new Promise((resolve, _) => resolve(res)))
        keplrState.sendSscrt(Math.round(sscrtAmount * Math.pow(10, 6)).toString(), wscrtDestination)
        .then(res => {
            console.log(res)

            fetch("/transactions", {
                ...postOptions,
                body: JSON.stringify({type: "ssrtToWscrt" , body: res})
            })
            .then(res => res.json())
            .then(res => {
                console.log("post res",res)
            })
            .catch(e => console.error("post err", e)
            ) 
        })
        .catch(e => console.error(e))

    }


    const wscrtToSscrt = async (e : any) => {
        e.preventDefault();
        const contract : Contract =  new $web3.eth.Contract(json.abi as any, MANAGER_ADDRESS)

        try {
            contract.methods.swapToken(
                $web3.utils.fromAscii(sscrtDestination), 
                $web3.utils.toWei(wscrtAmount.toString(), 'szabo'),
                WSCRT_ADDRESS
            ).send({
                value: "0",
                from: $selectedAccount,
            })
            .on('receipt', async function(receipt) {
                console.log("receipt:", receipt)
                //status = 'success';
                //resolve();

                const res = await fetch("/transactions", {
                    ...postOptions,
                    body: JSON.stringify({type: "wscrtToSscrt" , body: receipt.events["SwapToken"] })
                })
                
                console.log("res:", await res.json())
                
                //if (!res.ok) console.log("error text:", await res.text())

            })
            .on('error', (e) => {
                console.error("Error:", e);
                //reject()
            })

            //.on('transactionHash', function(hash){ txHash = hash })

        } catch (e) {
            console.log("wscrtTosscrt err:", e);
        }
    }

    onMount(() => {
        keplrState.ifConnected()
        .then(() => {
            sscrtDestination = keplrState.address
        })
    })

</script>


<form class="my-3">
    <label for="sscrt">Swap sSCRT to WSCRT</label>
    <div class="form-group d-flex">
        <input type="number"  class="form-control" bind:value={sscrtAmount}>
        <input type="text"  class="form-control" bind:value={wscrtDestination}>

        <button on:click={sscrtToWscrt} class="btn btn-primary">
            Swap
        </button>
    </div>
</form>


<form class="my-3">

    
    <label for="sscrt">Swap WSCRT to sSCRT</label>
    <div class="form-group d-flex">
        <input type="number"  class="form-control" bind:value={wscrtAmount}>
        <input type="text" class="form-control" bind:value={sscrtDestination}>

        <button on:click={allow} class="btn btn-primary">
            Allow
        </button>
        <button on:click={wscrtToSscrt} class="btn btn-primary">
            Swap
        </button>
    </div>
</form>
