<script lang="ts">

    import { keplrState } from "../stores"

    
    let amount: number = 0;

    const onClick = (e : any) => {
        e.preventDefault();
        console.log("Amount:", amount, Math.round(amount * Math.pow(10, 6)).toString())

        keplrState.sendSscrt(Math.round(amount * Math.pow(10, 6)).toString())
        .then(res => console.log(res))
        .catch(e => console.error(e))
    }

</script>


<form class="my-3">
    <label for="sscrt">Swap SSCRT to ETH</label>
    <div class="form-group d-flex">
        <input type="number" id="sscrt" class="form-control" bind:value={amount}>
        <button on:click={onClick} class="btn btn-primary">
            Swap
        </button>

    </div>
</form>
