<script lang="ts">
  import { keplrState } from "$lib/keplr";
  import { keplrConnected } from "$lib/stores";
  import { postOptions } from "$lib/utils";
    import { onMount } from "svelte";
	import { web3, connected, selectedAccount } from "svelte-web3"
    import json from "../assets/Contract.json"
    
    const MULTISIG = import.meta.env.VITE_MULTISIG as string; 

    let ethAmount, sethAmount, ethDestination, sethDestination;
    let contract;
    
    $: if ($connected) contract =  new $web3.eth.Contract(json.abi as any, MULTISIG)

    
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

    const sethToeth = (e) => {
        e.preventDefault();
        if (!$keplrConnected) return;

        /* const res = {
            "logs": [
                {
                    "msg_index": 0,
                    "log": "",
                    "events": [
                        {
                            "type": "message",
                            "attributes": [
                                {
                                    "key": "action",
                                    "value": "/secret.compute.v1beta1.MsgExecuteContract"
                                },
                                {
                                    "key": "module",
                                    "value": "compute"
                                },
                                {
                                    "key": "sender",
                                    "value": "secret179qaqxg75urzvtnk6sw2csmy7pec4rht2mrpha"
                                },
                                {
                                    "key": "contract_address",
                                    "value": "secret1f5ruzda8yynhj9aeyctmzner3gxhfgxsjc53qy"
                                }
                            ]
                        },
                        {
                            "type": "wasm",
                            "attributes": [
                                {
                                    "key": "contract_address",
                                    "value": "secret1f5ruzda8yynhj9aeyctmzner3gxhfgxsjc53qy"
                                },
                                {
                                    "key": "contract_address",
                                    "value": "secret1h3qm686yv2v2zvlee6ajpqx0dpcf5ud7rccn5m"
                                },
                                {
                                    "key": "contract_address",
                                    "value": "secret1925shc39c2juu2k375f2w4a98sehytu763jp2z"
                                },
                                {
                                    "key": "tx_id",
                                    "value": "1"
                                },
                                {
                                    "key": "contract_address",
                                    "value": "secret1h3qm686yv2v2zvlee6ajpqx0dpcf5ud7rccn5m"
                                }
                            ]
                        }
                    ]
                }
            ],
            "transactionHash": "E060BEA2EB53FB024C3370674EC4E3D1D0494D2D1FB4FFC086F59CA9628992DC",
            "data": {
                "0": 123,
                "1": 34,
                "2": 115,
                "3": 101,
                "4": 110,
                "5": 100,
                "6": 34,
                "7": 58,
                "8": 123,
                "9": 34,
                "10": 115,
                "11": 116,
                "12": 97,
                "13": 116,
                "14": 117,
                "15": 115,
                "16": 34,
                "17": 58,
                "18": 34,
                "19": 115,
                "20": 117,
                "21": 99,
                "22": 99,
                "23": 101,
                "24": 115,
                "25": 115,
                "26": 34,
                "27": 125,
                "28": 125,
                "29": 32,
                "30": 32,
                "31": 32,
                "32": 32,
                "33": 32,
                "34": 32,
                "35": 32,
                "36": 32,
                "37": 32,
                "38": 32,
                "39": 32,
                "40": 32,
                "41": 32,
                "42": 32,
                "43": 32,
                "44": 32,
                "45": 32,
                "46": 32,
                "47": 32,
                "48": 32,
                "49": 32,
                "50": 32,
                "51": 32,
                "52": 32,
                "53": 32,
                "54": 32,
                "55": 32,
                "56": 32,
                "57": 32,
                "58": 32,
                "59": 32,
                "60": 32,
                "61": 32,
                "62": 32,
                "63": 32,
                "64": 32,
                "65": 32,
                "66": 32,
                "67": 32,
                "68": 32,
                "69": 32,
                "70": 32,
                "71": 32,
                "72": 32,
                "73": 32,
                "74": 32,
                "75": 32,
                "76": 32,
                "77": 32,
                "78": 32,
                "79": 32,
                "80": 32,
                "81": 32,
                "82": 32,
                "83": 32,
                "84": 32,
                "85": 32,
                "86": 32,
                "87": 32,
                "88": 32,
                "89": 32,
                "90": 32,
                "91": 32,
                "92": 32,
                "93": 32,
                "94": 32,
                "95": 32,
                "96": 32,
                "97": 32,
                "98": 32,
                "99": 32,
                "100": 32,
                "101": 32,
                "102": 32,
                "103": 32,
                "104": 32,
                "105": 32,
                "106": 32,
                "107": 32,
                "108": 32,
                "109": 32,
                "110": 32,
                "111": 32,
                "112": 32,
                "113": 32,
                "114": 32,
                "115": 32,
                "116": 32,
                "117": 32,
                "118": 32,
                "119": 32,
                "120": 32,
                "121": 32,
                "122": 32,
                "123": 32,
                "124": 32,
                "125": 32,
                "126": 32,
                "127": 32,
                "128": 32,
                "129": 32,
                "130": 32,
                "131": 32,
                "132": 32,
                "133": 32,
                "134": 32,
                "135": 32,
                "136": 32,
                "137": 32,
                "138": 32,
                "139": 32,
                "140": 32,
                "141": 32,
                "142": 32,
                "143": 32,
                "144": 32,
                "145": 32,
                "146": 32,
                "147": 32,
                "148": 32,
                "149": 32,
                "150": 32,
                "151": 32,
                "152": 32,
                "153": 32,
                "154": 32,
                "155": 32,
                "156": 32,
                "157": 32,
                "158": 32,
                "159": 32,
                "160": 32,
                "161": 32,
                "162": 32,
                "163": 32,
                "164": 32,
                "165": 32,
                "166": 32,
                "167": 32,
                "168": 32,
                "169": 32,
                "170": 32,
                "171": 32,
                "172": 32,
                "173": 32,
                "174": 32,
                "175": 32,
                "176": 32,
                "177": 32,
                "178": 32,
                "179": 32,
                "180": 32,
                "181": 32,
                "182": 32,
                "183": 32,
                "184": 32,
                "185": 32,
                "186": 32,
                "187": 32,
                "188": 32,
                "189": 32,
                "190": 32,
                "191": 32,
                "192": 32,
                "193": 32,
                "194": 32,
                "195": 32,
                "196": 32,
                "197": 32,
                "198": 32,
                "199": 32,
                "200": 32,
                "201": 32,
                "202": 32,
                "203": 32,
                "204": 32,
                "205": 32,
                "206": 32,
                "207": 32,
                "208": 32,
                "209": 32,
                "210": 32,
                "211": 32,
                "212": 32,
                "213": 32,
                "214": 32,
                "215": 32,
                "216": 32,
                "217": 32,
                "218": 32,
                "219": 32,
                "220": 32,
                "221": 32,
                "222": 32,
                "223": 32,
                "224": 32,
                "225": 32,
                "226": 32,
                "227": 32,
                "228": 32,
                "229": 32,
                "230": 32,
                "231": 32,
                "232": 32,
                "233": 32,
                "234": 32,
                "235": 32,
                "236": 32,
                "237": 32,
                "238": 32,
                "239": 32,
                "240": 32,
                "241": 32,
                "242": 32,
                "243": 32,
                "244": 32,
                "245": 32,
                "246": 32,
                "247": 32,
                "248": 32,
                "249": 32,
                "250": 32,
                "251": 32,
                "252": 32,
                "253": 32,
                "254": 32,
                "255": 32
            }
        }; */
        
        //(new Promise<void>(resolve => {resolve()}))
        keplrState.sendSeth(Math.round(sethAmount * Math.pow(10, 6)).toString(), sethDestination)
        .then(res => {
            console.log("then")
            //console.log("res:", res)
            fetch("/transactions", {
                ...postOptions,
                body: JSON.stringify({type: "sethToEth" , body: res})
            })
            .then(res => {
                console.log("post res",res)
            })
            .catch(e => console.error("post err", e)
            ) 
            keplrState.incrementNonce();
            return keplrState.getLastBurnedTokens()
        })
        .catch(err => console.error(err))


        
    }
</script>


<form class="my-3">
    <label for="sscrt">Swap ETH to SETH</label>
    <div class="form-group d-flex">
        <input type="number"  class="form-control" bind:value={ethAmount}>
        <input type="text" class="form-control" bind:value={ethDestination}>
        <button on:click={onClick} class="btn btn-primary">
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
