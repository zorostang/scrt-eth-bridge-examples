<script lang="ts">

    import { keplrState } from "../lib/keplr"
	import { web3, connected, selectedAccount } from "svelte-web3"
    import { keplrConnected, scrtAccount } from "$lib/stores";

    import jsonSwap  from "../assets/Contract.json"
    import jsonErc20  from "../assets/ERC20.json"
    import { postOptions } from "$lib/utils";
    import type { Contract } from 'web3-eth-contract';
    import Loading from "./loading.svelte";

    const WSCRT_ADDRESS = import.meta.env.VITE_ERC20;
    const MANAGER_ADDRESS = import.meta.env.VITE_MULTISIG;

    let 
        wscrtLoading : boolean = false,
        wscrtError : string = "",
        wscrtAmount : number = 1,
        wscrtDestination = "",
        wscrtTx1 : string = "",
        wscrtTx2 : string = "",
        
        sscrtLoading : boolean = false,
        sscrtError : string = "",
        sscrtAmount : number = 1, 
        sscrtDestination = "",
        sscrtTx1 : string = "",
        sscrtTx2 : string = "";

    $: if ($connected ) sscrtDestination = $selectedAccount;
    $: if ($keplrConnected) wscrtDestination = $scrtAccount;

    $: wscrtDisabled = !$connected || wscrtLoading || wscrtAmount === 0 || !wscrtDestination
    $: sscrtDisabled = !$keplrConnected || sscrtLoading || sscrtAmount === 0 || !sscrtDestination
    
    const wscrtChecks = () => {
        let passed = true;
        if (!$connected) {
            wscrtError = "Metamask is not connected"
            passed = false;
        }
        if (wscrtAmount === 0) {
            wscrtError = "WSCRT amount is zero"
            passed = false;
        }

        if (!wscrtDestination) {
            wscrtError = "Destination is not specified"
            passed = false;
        }
        return passed;
    }

    const sscrtChecks = () => {
        let passed = true;
        if (!$keplrConnected) {
            wscrtError = "Keplr is not connected"
            passed = false;
        }
        if (sscrtAmount === 0) {
            wscrtError = "WSCRT amount is zero"
            passed = false;
        }

        if (!sscrtDestination) {
            wscrtError = "Destination is not specified"
            passed = false;
        }
        return passed;
    }

    const aprove = async (e : any) => {
        e.preventDefault();

        wscrtTx1 = ""; wscrtTx2 = "";

        if (!wscrtChecks()) return;

        wscrtError = "";
        wscrtLoading = true;

        try {
            const contract : Contract =  new $web3.eth.Contract(jsonErc20.abi as any, WSCRT_ADDRESS)

            await contract.methods.approve(
                MANAGER_ADDRESS,
                $web3.utils.toWei(wscrtAmount.toString()),
            )
            .send({ value: "0", from: $selectedAccount})
            .on('receipt', async (receipt) => {
                console.log("receipt:", receipt)
                wscrtTx1 = receipt.transactionHash;
                wscrtLoading = false;
            })
            .on('error', (e) => {
                wscrtError = e.message ?? e.toString();
                wscrtLoading = false;
                console.error("Error:", e);
            })
            
        } catch (e) {
            wscrtError = e.message ?? e.toString();
            wscrtLoading = false
            console.error(e)
        }
    
    }

    const sscrtToWscrt = (e : any) => {
        e.preventDefault();

        sscrtTx1 = ""; sscrtTx2 = "";

        if (!sscrtChecks()) return;

        sscrtError = "";
        sscrtLoading = true;

        keplrState.sendSscrt(Math.round(sscrtAmount * Math.pow(10, 6)).toString(), sscrtDestination)
        .then(rec => {
            sscrtTx1 = rec.transactionHash

            fetch("/transactions", {
                ...postOptions,
                body: JSON.stringify({type: "ssrtToWscrt" , body: rec})
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
                sscrtTx2 = res.txHash;
            })
            .catch(e => {
                if (e.txHash)  sscrtTx2 = e.txHash;
                sscrtError = e.message ?? JSON.stringify(e)
            })
            .finally(() => sscrtLoading = false)
        })
        .catch(e => {
            sscrtError = e.message ?? e.toString();
            sscrtLoading = false
            console.error(e)
        })

    }


    const wscrtToSscrt = async (e : any) => {
        e.preventDefault();

        wscrtTx1 = ""; wscrtTx2 = "";

        if (!wscrtChecks()) return;

        wscrtError = "";
        wscrtLoading = true;

        const contract =  new $web3.eth.Contract(jsonSwap.abi as any, MANAGER_ADDRESS)

        try {

            contract.methods.swapToken(
                $web3.utils.fromAscii(wscrtDestination), 
                $web3.utils.toWei(wscrtAmount.toString(), 'ether'),
                WSCRT_ADDRESS
            ).send({
                value: "0",
                from: $selectedAccount,
                gas: "90000",
                gasPrice: "90000000000"
            })
            .on('receipt', async (receipt) => {
                console.log("receipt:", receipt)
                wscrtTx1 = receipt.transactionHash;

                fetch("/transactions", {
                    ...postOptions,
                    body: JSON.stringify({type: "wscrtToSscrt" , body: receipt.events["SwapToken"] })
                })
                .then(async res => {
                    if (res.ok) return await res.json()
                    else {
                        const j = await res.json()
                        console.log("error post:", j)
                        throw new Error(j.message ?? "Error swapping")
                    }
                })
                .then(res => {
                    console.log("post res",res)
                    wscrtTx2 = res.txHash;
                })
                .catch(e => {
                    console.log("error:", e);
                    if (e.txHash)  wscrtTx2 = e.txHash;
                    wscrtError = e.message ?? JSON.stringify(e);
                })
                .finally(() => wscrtLoading = false)
                
                //if (!res.ok) console.log("error text:", await res.text())

            })
            .on('error', (e) => {
                wscrtError = e.message ?? JSON.stringify(e);
                wscrtLoading = false;
                console.error("Error:", e);
                //reject()
            })

            //.on('transactionHash', function(hash){ txHash = hash })

        } catch (e) {
            wscrtError = e.message ?? e.toString();
            wscrtLoading = false
            console.log("wscrtTosscrt err:", e);
        }
    }

</script>


<form class="my-3">
    <h6>Swap sSCRT to WSCRT</h6>
    <div class="row d-flex justify-content-between gy-2">
        <div class="col-4 col-md-2">
            <input type="number" class="form-control col-3" bind:value={sscrtAmount}>
        </div>
        <div class="col-8 col-md-6 col-lg-8">
            <input type="text" class="form-control col-6" bind:value={sscrtDestination}>
        </div>
        <div class="col-12 col-md-4 col-lg-2 d-flex justify-content-end">
            <button disabled={sscrtDisabled} on:click={sscrtToWscrt} class="btn btn-success">
                Swap
            </button>
        </div>
    </div>

    { #if sscrtLoading }
        <div class="d-flex mt-2 ps-1">
            <Loading />
        </div>
    { /if }

    { #if sscrtError }
        <div class="d-flex gap-2 error flex-wrap">
            <b>Error:</b>
            <span>{sscrtError}</span>
        </div>
    { /if }

    { #if sscrtTx1 }
        <div class="d-flex gap-2 flex-wrap">
            <b>TxHash1:</b>
            <span>{sscrtTx1}</span>
        </div>
    { /if }

    { #if sscrtTx2 }
        <div class="d-flex gap-2 flex-wrap">
            <b>TxHash2:</b>
            <span>{sscrtTx2}</span>
        </div>
    { /if }
</form>


<form class="my-3 mt-5">
    <h6 >Swap WSCRT to sSCRT</h6>
    <div class="row d-flex justify-content-between gy-2">
        <div class="col-4 col-md-2">
            <input type="number" class="form-control" bind:value={wscrtAmount}>
        </div>

        <div class="col-8 col-md-6 col-lg-8">
            <input type="text" class="form-control" bind:value={wscrtDestination}>
        </div>

        <div class="col-12 col-md-4 col-lg-2 d-flex gap-2 justify-content-end">
            <button disabled={wscrtDisabled} on:click={aprove} class="btn btn-success">
                Aprove
            </button>
            <button disabled={wscrtDisabled} on:click={wscrtToSscrt} class="btn btn-success">
                Swap
            </button>
        </div>
    </div>
    { #if wscrtLoading }
        <div class="d-flex mt-2 ps-1">
            <Loading />
        </div>
    { /if }

    { #if wscrtError }
        <div class="d-flex gap-2 error flex-wrap">
            <b>Error:</b>
            <span>{wscrtError}</span>
        </div>
    { /if }

    { #if wscrtTx1 }
        <div class="d-flex gap-2 flex-wrap">
            <b>TxHash1:</b>
            <span>{wscrtTx1}</span>
        </div>
    { /if }

    { #if wscrtTx2 }
        <div class="d-flex gap-2 flex-wrap">
            <b>TxHash2:</b>
            <span>{wscrtTx2}</span>
        </div>
    { /if }
</form>


<style>
    .error {
        color: maroon;
    }
</style>