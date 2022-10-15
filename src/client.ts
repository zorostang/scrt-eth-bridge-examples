import Web3 from "web3"
import { CosmWasmClient, encodeSecp256k1Pubkey, EnigmaUtils, pubkeyToAddress, Secp256k1Pen, SigningCosmWasmClient } from "secretjs";
import json from "./assets/Contract.json"
import erc20json from "./assets/ERC20.json";

const SCRT_ENDPOINT = import.meta.env.VITE_SCRT_ENDPOINT as string;
const ETH_ENDPOINT = import.meta.env.VITE_ETH_ENDPOINT as string;
const ETH_PK = import.meta.env.VITE_ETH_PK as string;
const SCRT_WALLET = import.meta.env.VITE_SCRT_WALLET as string;
const MULTISIG = import.meta.env.VITE_MULTISIG as string;
const ERC20 = import.meta.env.VITE_ERC20 as string;


let scrtClient : SigningCosmWasmClient | undefined;

export const getScrtClient = async () => {
    if (scrtClient) return scrtClient;

    const signingPen = await Secp256k1Pen.fromMnemonic(SCRT_WALLET);
    const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);
    const scrtAddress = pubkeyToAddress(pubkey, 'secret');
    const txEncryptionSeed = EnigmaUtils.GenerateNewSeed();

    console.log("address: " + scrtAddress)
    
    scrtClient =  new SigningCosmWasmClient(
        SCRT_ENDPOINT, 
        scrtAddress, 
        (signBytes) => signingPen.sign(signBytes),
        txEncryptionSeed
    )
    return scrtClient;
}


export const ethClient = new Web3(new Web3.providers.HttpProvider(ETH_ENDPOINT, { }));
export const account = ethClient.eth.accounts.wallet.add(ETH_PK);
export const ethContract =  new ethClient.eth.Contract(json.abi as any, MULTISIG)
export const erc20Contract = new ethClient.eth.Contract(erc20json.abi as any, ERC20)


