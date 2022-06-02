import "../db";
import { ethTxModel } from "../models";
import { scrtClient, ethClient, ethContract, erc20Contract, account } from "../client";
import {  PROXY_ADDRESS, SWAP_ADDRESS,  ETH_ERC20_ADDRESS, ETH_GOV_TOKEN_ADDRESS } from "../config"

enum SwapType {
 ssrtToWscrt = "ssrtToWscrt",
 wsrtToSscrt = "wscrtToSscrt",
 sethToEth = "sethToEth",
 ethToSeth = "ethToSeth",
}


const ssrtToWscrt = async (body) => {

    const txId = body.logs[0].events
        .find(m => m.type === "wasm").attributes
        .find(a => a.key === "tx_id").value

    const found = await ethTxModel.findOne({ txId })

    if (found) return {
        status: 400,
        body: "Already paid"
    };


    const burned = await scrtClient.queryContractSmart(SWAP_ADDRESS, { swap : { nonce: parseInt(txId), token: PROXY_ADDRESS }})
    const { amount, destination } =  burned.swap.result
    const destAddress = ethClient.utils.toChecksumAddress(destination) //destination);
    const amountFormatted = amount + (new Array(12).fill(0).join(""));
    const innertTxData = erc20Contract.methods.transfer(destAddress, amountFormatted).encodeABI();
    const tokenAddress = ethClient.utils.toChecksumAddress(ETH_ERC20_ADDRESS)
    const data = ethContract.methods.submitTransaction(tokenAddress, "0", txId, tokenAddress, "100000000000000", innertTxData).encodeABI()

    const tx  = { 
        data, 
        gas: "400000",
        gasPrice: "20000000000",
        to: ETH_GOV_TOKEN_ADDRESS
    }


    account.signTransaction(tx)
    .then(signed => {
    return ethClient.eth.sendSignedTransaction(signed.rawTransaction)
    .on('transactionHash', function(hash){
    })
    .on('receipt', function(receipt){
        console.log("receipt:", receipt)
    })
    .on('confirmation', function(confirmationNumber, receipt){ 
    })
    .on('error', (e) => console.error("Error:", e));
    })
    .catch(err => console.error("sign error", err)); 

    await ethTxModel.create({txId, destination, amount})

}

const wscrtToSscrt = async (body) => {

 
    return {}
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
        }
    }

    catch(e) {
        return { status: 400, body: e.message }
    }

   
}