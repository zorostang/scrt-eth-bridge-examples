<script lang="ts">

    import { keplrState } from "../lib/keplr"
	import { web3, connected, selectedAccount } from "svelte-web3"
    import { keplrConnected } from "$lib/stores";

    import json  from "../assets/Contract.json"
    import { onMount } from "svelte";
    import { postOptions } from "$lib/utils";

    const WSCRT_ADDRESS = import.meta.env.VITE_ERC20 as string;
    const MANAGER_ADDRESS = import.meta.env.VITE_MULTISIG as string;

    
    let sscrtAmount : number = 0, wscrtAmount : number = 0;
    let sscrtDestination = "", wscrtDestination = "";

    $: if ($connected && $keplrConnected) wscrtDestination = $selectedAccount;
    

    const allow = () => {

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

        const contract =  new $web3.eth.Contract(json.abi as any, MANAGER_ADDRESS)

        console.log("recep", $web3.utils.fromAscii(sscrtDestination))


        const event = {
            address: '0x236b3130836103443c39cb8Dbdcdc57091dC7Bc0',
            blockHash: '0xfdac0ea7132ec1c68213ac4eaf0e74d37c4e32bdcb56b2aa8512da2bba36bad6',
            blockNumber: 7774291,
            logIndex: 5,
            removed: false,
            transactionHash: '0x76f63e4e66ad42393e7246a83931c46cc4ee9f7bc1aaaa3a338113bbe93954a2',
            transactionIndex: 4,
            id: 'log_9f00cf35',
            returnValues: {
                '0': '0xc7C778D341880587B700d0d6B5609D744Cb46A67',
                '1': '0x736563726574317638356d3473786e6e64776d73777464386a727a336364326d387538656567716d6c38743230',
                '2': '1000000000000000000',
                '3': '0x657f9AD6ec2D3F147F37d56700a4b5ef3468a08c',
                sender: '0xc7C778D341880587B700d0d6B5609D744Cb46A67',
                recipient: '0x736563726574317638356d3473786e6e64776d73777464386a727a336364326d387538656567716d6c38743230',
                amount: '1000000000000000000',
                tokenAddress: '0x657f9AD6ec2D3F147F37d56700a4b5ef3468a08c'
            },
            event: 'SwapToken',
            signature: '0x7bad95c5817621d8789091ae63d99bf8f7bed9ea4963b10c3d3c6bb7273522b3',
            raw: {
                data: '0x000000000000000000000000c7c778d341880587b700d0d6b5609d744cb46a6700000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000657f9ad6ec2d3f147f37d56700a4b5ef3468a08c000000000000000000000000000000000000000000000000000000000000002d736563726574317638356d3473786e6e64776d73777464386a727a336364326d387538656567716d6c3874323000000000000000000000000000000000000000',
                topics: [
                '0x7bad95c5817621d8789091ae63d99bf8f7bed9ea4963b10c3d3c6bb7273522b3'
                ]
            }
        }

        const res = await fetch("/transactions", {
            ...postOptions,
            body: JSON.stringify({type: "wscrtToSscrt" , body: event })
        })
        console.log("res:", res)


        /* try {
            contract.methods.swapToken($web3.utils.fromAscii(sscrtDestination), (BigInt(wscrtAmount) * (10n ** 18n)).toString(), WSCRT_ADDRESS).send({
                value: "0",
                from: $selectedAccount,
            })
            .on('receipt', async function(receipt) {
                console.log("receipt:", receipt)
                //status = 'success';
                //resolve();

                const res = await fetch("/transactions", {
                    ...postOptions,
                    body: JSON.stringify({type: "wscrtToSscrt" , body: receipt.events["SwapToken"] )
                })
                console.log("res:", res)

                if (!res.ok) console.log("error text:", await res.text())

            })
            .on('error', (e) => {
                console.error("Error:", e);
                //reject()
            })

            //.on('transactionHash', function(hash){ txHash = hash })

        } catch (e) {
            console.log("wscrtTosscrt err:", e);
        } */
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
            Allow
        </button>
        <button on:click={wscrtToSscrt} class="btn btn-primary">
            Swap
        </button>
    </div>
</form>
