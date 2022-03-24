<script>
    import { onMount } from "svelte";
	import { web3, connected, selectedAccount } from "svelte-web3"

    import json from "../assets/Contract.json"

    let amount;

    let contract;

    onMount(() => { 
        setTimeout(() => {
            contract =  new $web3.eth.Contract(json.abi, "0xFA22c1BF3b076D2B5785A527C38949be47Ea1082")
            console.log(contract.methods)
        }, 1500)
    })
    
    const onClick = (e) => {
        e.preventDefault();
        if (!$connected) return;
        console.log($selectedAccount)
        contract.methods.getFeeCollector().call()
        .then(async _ => {

            //const owners = await contract.methods.getOwners().call()
            //console.log("owners:", owners)

            return contract.methods.swap(["secret1925shc39c2juu2k375f2w4a98sehytu763jp2z"]).send({
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
