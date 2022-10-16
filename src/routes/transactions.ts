import "../db";
import { txModel } from "../lib/models";
import { ethClient, ethContract, erc20Contract, account, getScrtClient } from "../client";
import Web3 from "web3";
import { keplrState } from "$lib/keplr";

const SCRT_PROXY = import.meta.env.VITE_SCRT_PROXY as string;
const ETH_PROXY = import.meta.env.VITE_ETH_PROXY as string;

const SWAP_ADDRESS = import.meta.env.VITE_SWAP_ADDRESS as string;;
const ERC20_ADDRESS = import.meta.env.VITE_ERC20 as string;;
const MULTISIG_ADDRESS = import.meta.env.VITE_MULTISIG as string;;


type Result = {
    txHash: string;
    status: string;
    message?: string;
} 

const ssrtToWscrt = async (body) => {
    let status = "error", txHash = "";

    const txId = body.logs[0].events
        .find(m => m.type === "wasm").attributes
        .find(a => a.key === "tx_id").value

    if (await txModel.exists({ txId })) return {
        status,
        txHash,
        message: "Already paid"
    };

    const scrtClient = await getScrtClient();
    const burned = await scrtClient.queryContractSmart(SWAP_ADDRESS, { swap : { nonce: parseInt(txId), token: SCRT_PROXY }})
    const { amount, destination } =  burned.swap.result;
    const destAddress = ethClient.utils.toChecksumAddress(destination);

    // adds 12 more zeros
    const amountFormatted = Web3.utils.toWei(amount, 'szabo'); //amount + (new Array(12).fill(0).join(""));
    
    const innertTxData = erc20Contract.methods.transfer(destAddress, amountFormatted).encodeABI();
    const tokenAddress = ethClient.utils.toChecksumAddress(ERC20_ADDRESS)
    
    const nonce = await ethContract.methods.getTokenNonce(ERC20_ADDRESS).call() 
        
    // improvement idea: make sure ethContract has erc20 tokens on its balance beforehand
    const data = ethContract.methods.submitTransaction(
        tokenAddress, 
        "0", 
        (parseInt(nonce)+1).toString(), 
        tokenAddress, 
        "100000000000000", 
        innertTxData
    ).encodeABI()
        
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

    await txModel.create({txId, destination, amount, status })
    return { status, txHash };
}


const wscrtToSscrt = async (body) => {

    let status = "error", txHash = "";


    if (await txModel.exists({ txId: body.id })) return {
        status,
        txHash,
        message: "Already paid"
    };

    const events = await ethContract.getPastEvents("SwapToken", { 
        fromBlock: body.blockNumber, 
        toBlock: 'latest',
    })

    const found = events.find((e : any) => e.id === body.id)
    
    if (found) {

        console.log(`Found`, found)
        const { recipient, amount } = found.returnValues;
        const scrtRecipient = Web3.utils.toAscii(recipient);
        const scrtClient = await getScrtClient()

        console.log(scrtRecipient, Web3.utils.fromWei(amount, 'lovelace'))
        
        const mint = await scrtClient.execute(SCRT_PROXY,  { 
            mint : { recipient: scrtRecipient, amount: Web3.utils.fromWei(amount, 'lovelace')} },
            "", undefined, 
            { gas: "800000", amount: [{ amount: "150000", denom: "uscrt" }] }
        );

        const res = Buffer.from(mint.data).toString();
        console.log("wscrt res:", res);

        txHash = mint.transactionHash

        await txModel.create({txId: body.id, destination: scrtRecipient, amount, status })

        status = "success";
    
    }

    return { status, txHash };

}


const sethToEth = async (body) => {

    let status = "error", txHash = "";

    const txId = body.logs[0].events
        .find(m => m.type === "wasm").attributes
        .find(a => a.key === "tx_id").value

    if (await txModel.exists({ txId })) return {
        status,
        txHash,
        message: "Already paid"
    };

    const scrtClient = await getScrtClient();
    const burned = await scrtClient.queryContractSmart(SWAP_ADDRESS, { swap : { nonce: parseInt(txId), token: ETH_PROXY }})
    const { amount, destination } =  burned.swap.result;
    const destAddress = ethClient.utils.toChecksumAddress(destination);
    const amountFormatted = Web3.utils.toWei(amount, 'szabo'); // amount + (new Array(12).fill(0).join(""));


    await new Promise<void>((resolve, reject) => {
        account.signTransaction({ to: destAddress, value: amountFormatted, gas: "400000", gasPrice: "20000000000", })
        .then(signed => 
            ethClient.eth.sendSignedTransaction(signed.rawTransaction)
            .on('transactionHash', function(hash){ txHash = hash })
            .on('receipt', function(receipt){
                console.log("receipt:", receipt)
                status = 'success';
                keplrState.incrementNonce()
                resolve();
            })
            .on('error', (e) => {console.error("Error:", e), reject()})

        )
        .then(() => {})
        .catch(err => console.error("sign error", err)); 
    });
    await txModel.create({txId, destination, amount, status })
   
    return { status, txHash };
}


const ethToSeth = async (body) => {

    let status = "error", txHash = "";

    if (await txModel.exists({ txId: body.id })) return {
        status,
        txHash,
        message: "Already paid"
    };

    const events = await ethContract.getPastEvents("Swap", { 
        fromBlock: body.blockNumber, 
        toBlock: 'latest',
    })

    const found = events.find((e : any) => e.id === body.id)
    
    if (found) {
        const { recipient, amount } = found.returnValues;
        const scrtRecipient = Web3.utils.toAscii(recipient);
        const scrtClient = await getScrtClient()

        const mint = await scrtClient.execute(ETH_PROXY,  { 
            mint : { recipient: scrtRecipient, amount: Web3.utils.fromWei(amount, 'lovelace') } },
            "", undefined, 
            { gas: "800000", amount: [{ amount: "150000", denom: "uscrt" }] }
        );

        const res = Buffer.from(mint.data).toString();
        console.log("result:", res);
        txHash = mint.transactionHash
        await txModel.create({txId: body.id, destination: scrtRecipient, amount, status })

        status = "success";
        
    }

    return { status, txHash };

}


const SWAP_MAPPING : { [typ: string] : (body:any) => Promise<Result> } = {
    "wscrtToSscrt": wscrtToSscrt,
    "ethToSeth" : ethToSeth,
    "ssrtToWscrt": ssrtToWscrt,
    "sethToEth" : sethToEth,
}



/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ request }) {
    
    const {type, body} = await request.json();

    try {
        const result = await SWAP_MAPPING[type](body)
        return { status: result.status === "success" ? 201 : 400,  body: result };
    } catch(e) {
        console.error("Error:", e)
        return { status: 400, body: e }
    }

   
}