<script lang="ts">

    import { keplrState } from "../stores"
	import { web3, connected, selectedAccount } from "svelte-web3"

    import json  from "../assets/Contract.json"
    import { onMount } from "svelte";

    const WSCRT_ADDRESS = "0x4D11F8de0F8B821c048837857B2bad3a358873ff"
    const MANAGER_ADDRESS = "0x1ad18e914e0cce6ee3e3437c378a0ef98dccefe3"

    
    let sscrtAmount : number = 0, wscrtAmount : number = 0;

    let sscrtDestination = "", wscrtDestination = "";

    $: if ($connected)
        wscrtDestination = $selectedAccount;
    

    const sscrtToWscrt = (e : any) => {
        e.preventDefault();

        
        keplrState.sendSscrt(Math.round(sscrtAmount * Math.pow(10, 6)).toString(), wscrtDestination)
        .then(res => {
            console.log(res)

             fetch("/transactions", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({type: "ssrtToWscrt" , body: res})
            })
            .then(res => {
                console.log("post res",res)
            })
            .catch(e => console.error("post err", e)
            ) 
            keplrState.incrementNonce();
            return keplrState.getLastBurnedTokens()
        })
        .then(b => console.log("burned:", b))
        .catch(e => console.error(e))

    }


    const wscrtToSscrt = async (e : any) => {
        e.preventDefault();

        const contract =  new $web3.eth.Contract(json.abi, MANAGER_ADDRESS)

        console.log("amount", (BigInt(wscrtAmount) * (10n ** 18n)).toString())

        try {
            const res = await contract.methods.swapToken($web3.utils.fromAscii(sscrtDestination), (BigInt(wscrtAmount) * (10n ** 18n)).toString(), WSCRT_ADDRESS).send({
                value: "0",
                from: $selectedAccount,
            })
            console.log("wscrtTosscrt res:", res);
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
    <label for="sscrt">Swap SSCRT to WSCRT</label>
    <div class="form-group d-flex">
        <input type="number" id="sscrt" class="form-control" bind:value={sscrtAmount}>
        <input type="text" id="destination" class="form-control" bind:value={wscrtDestination}>

        <button on:click={sscrtToWscrt} class="btn btn-primary">
            Swap
        </button>
    </div>
</form>


<form class="my-3">
    <label for="sscrt">Swap WSCRT to SSRT</label>
    <div class="form-group d-flex">
        <input type="number" id="sscrt" class="form-control" bind:value={wscrtAmount}>
        <input type="text" id="destination" class="form-control" bind:value={sscrtDestination}>

        <button on:click={wscrtToSscrt} class="btn btn-primary">
            Swap
        </button>
    </div>
</form>
