<script>
    import { onMount } from "svelte";
	import { web3, connected, selectedAccount } from "svelte-web3"

    import json from "../assets/Contract.json"

    let amount;
    let contract;

    onMount(() => { 
        setTimeout(() => {
            contract =  new $web3.eth.Contract(json.abi, "0x4D11F8de0F8B821c048837857B2bad3a358873ff")
        }, 1500)
    })
    
    const onClick = (e) => {
        e.preventDefault();
        if (!$connected) return;
        console.log($selectedAccount)


        contract.methods.getFeeCollector().call()
        .then(() => {

            return contract.methods.swap("0x0d8Fd8519406b9d6e17a8231da1Dc855780Bd5eC").send({
                value: $web3.utils.toWei("0.02"),
                from: $selectedAccount,
            })
        })

        .then(res => {
            console.log("res:", res)
        })
        .catch(err => console.error(err))


        
    }
</script>


<form class="my-3">
    <label for="sscrt">Swap ETH ro TST</label>
    <div class="form-group d-flex">
        <input type="number" id="sscrt" class="form-control" bind:value={amount}>
        <button on:click={onClick} class="btn btn-primary">
            Swap
        </button>

    </div>
</form>
