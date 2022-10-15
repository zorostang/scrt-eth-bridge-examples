import "../db";
import { ethTxModel } from "../models";
import { scrtClient, ethClient, ethContract, erc20Contract, account } from "../client";
import Web3 from "web3";

const PROXY_ADDRESS = import.meta.env.VITE_PROXY_ADDRESS as string;
const SWAP_ADDRESS = import.meta.env.VITE_SWAP_ADDRESS as string;;
const ERC20_ADDRESS = import.meta.env.VITE_ERC20 as string;;
const MULTISIG_ADDRESS = import.meta.env.VITE_MULTISIG as string;;


enum SwapType {
 ssrtToWscrt = "ssrtToWscrt",
 wscrtToSscrt = "wscrtToSscrt",
 sethToEth = "sethToEth",
 ethToSeth = "ethToSeth",
}


const ssrtToWscrt = async (body) => {

    const txId = body.logs[0].events
        .find(m => m.type === "wasm").attributes
        .find(a => a.key === "tx_id").value

    if (await ethTxModel.exists({ txId })) return {
        status: 400,
        body: "Already paid"
    };

    const burned = await scrtClient.queryContractSmart(SWAP_ADDRESS, { swap : { nonce: parseInt(txId), token: PROXY_ADDRESS }})
    const { amount, destination } =  burned.swap.result;
    const destAddress = ethClient.utils.toChecksumAddress(destination);

    // scrt: 6 zeros, eth: 18 zeros
    const amountFormatted = amount + (new Array(12).fill(0).join(""));
    const innertTxData = erc20Contract.methods.transfer(destAddress, amountFormatted).encodeABI();
    const tokenAddress = ethClient.utils.toChecksumAddress(ERC20_ADDRESS)
    
    // improvement idea: make sure ethContract has erc20 tokens on its balance beforehand
    const data = ethContract.methods.submitTransaction(tokenAddress, "0", txId, tokenAddress, "100000000000000", innertTxData).encodeABI()
    
    let status = "error", txHash = "";
    
    // improvement idea: make specifiable gas
    const tx  = { 
        data, 
        gas: "400000",
        gasPrice: "20000000000",
        to: MULTISIG_ADDRESS
    }

    await new Promise<void>((resolve, reject) => {
        account.signTransaction(tx)
        .then(signed => 
            ethClient.eth.sendSignedTransaction(signed.rawTransaction)
            .on('transactionHash', function(hash){ txHash = hash })
            .on('receipt', function(receipt){
                console.log("receipt:", receipt)
                status = 'success';
                resolve();
            })
            .on('error', (e) => {console.error("Error:", e), reject()})
        )
        .catch(err => console.error("sign error", err)); 
    })

    await ethTxModel.create({txId, destination, amount, status })

    return { status: status === "success" ? 201 : 400, 
            body: { status, txHash }
    }

}

const wscrtToSscrt = async (body) => {

    const events = await ethContract.getPastEvents("SwapToken", { 
        fromBlock: body.blockNumber, 
        toBlock: 'latest',
    })

    let status = "error", txHash = "";
    const found = events.find((e : any) => e.id === body.id)
    
    if (found) {
        const resBytes = found.returnValues.recipient;
        const recipient = Web3.utils.toAscii(resBytes);
        console.log("r:",recipient)

        status = "success";
    
    }

    return { status: status === "success" ? 201 : 400, 
            body: { status, txHash }
    }
}




/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ request }) {
    
    const {type, body} = await request.json();

    try {

        switch (type) {
            case "ssrtToWscrt": {
                return ssrtToWscrt(body);
            } case "wscrtToSscrt": {
                return wscrtToSscrt(body);
            }
            default: {
                console.log("DEFAULT")
            }
        }
    }

    catch(e) {
        return { status: 400, body: e.message }
    }

   
}