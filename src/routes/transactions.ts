import "../db";
import { ethTxModel } from "../models";
import { ethClient, ethContract, erc20Contract, account, getScrtClient } from "../client";
import Web3 from "web3";

const SCRT_PROXY = import.meta.env.VITE_SCRT_PROXY as string;
const ETH_PROXY = import.meta.env.VITE_ETH_PROXY as string;

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

    const scrtClient = await getScrtClient();
    const burned = await scrtClient.queryContractSmart(SWAP_ADDRESS, { swap : { nonce: parseInt(txId), token: SCRT_PROXY }})
    const { amount, destination } =  burned.swap.result;
    const destAddress = ethClient.utils.toChecksumAddress(destination);

    // scrt: 6 zeros, eth: 18 zeros
    const amountFormatted = Web3.utils.toWei(amount, 'szabo'); //amount + (new Array(12).fill(0).join(""));
    
    console.log("a:", amountFormatted)
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
        const { recipient, amount } = found.returnValues;
        const scrtRecipient = Web3.utils.toAscii(recipient);
        const scrtClient = await getScrtClient()

        try {
            const mint = await scrtClient.execute(SCRT_PROXY,  { 
                mint : { recipient: scrtRecipient, amount: amount.slice(0, 7)} },
                "", undefined, 
                { gas: "800000", amount: [{ amount: "150000", denom: "uscrt" }] }
            );
    
            // const res = Buffer.from(mint.data).toString();

            txHash = mint.transactionHash
            status = "success";
        } catch (err) {
            console.error(err.message);
        }
    
    }

    return { status: status === "success" ? 201 : 400, 
            body: { status, txHash }
    }
}


const sethToEth = async (body) => {

    const txId = body.logs[0].events
        .find(m => m.type === "wasm").attributes
        .find(a => a.key === "tx_id").value

    if (await ethTxModel.exists({ txId })) return {
        status: 400,
        body: "Already paid"
    };

    const scrtClient = await getScrtClient();
    const burned = await scrtClient.queryContractSmart(SWAP_ADDRESS, { swap : { nonce: parseInt(txId), token: ETH_PROXY }})
    const { amount, destination } =  burned.swap.result;
    const destAddress = ethClient.utils.toChecksumAddress(destination);
    const amountFormatted = Web3.utils.toWei(amount, 'szabo'); // amount + (new Array(12).fill(0).join(""));


    let status = "error", txHash = "";
    
    await new Promise<void>((resolve, reject) => {
        account.signTransaction({ to: destAddress, value: amountFormatted, gas: "400000", gasPrice: "20000000000", })
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
        .then(() => {})
        .catch(err => console.error("sign error", err)); 
    });
    await ethTxModel.create({txId, destination, amount, status })
    return { status: status === "success" ? 201 : 400, 
            body: { status, txHash }
    }

}


/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ request }) {
    
    const {type, body} = await request.json();

    try {

        switch (type) {
            case SwapType.ssrtToWscrt: {
                return ssrtToWscrt(body);
            } case SwapType.wscrtToSscrt: {
                return wscrtToSscrt(body);
            } case SwapType.sethToEth: {
                return sethToEth(body);
            }
            default: {
                console.log("DEFAULT")
            }
        }
    } catch(e) {
        return { status: 400, body: e.message }
    }

   
}