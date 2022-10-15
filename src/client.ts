import Web3 from "web3"
import { CosmWasmClient } from "secretjs";
import json from "./assets/Contract.json"
import erc20json from "./assets/ERC20.json";

const SCRT_ENDPOINT = import.meta.env.VITE_SCRT_ENDPOINT as string;
const ETH_ENDPOINT = import.meta.env.VITE_ETH_ENDPOINT as string;
const ETH_PK = import.meta.env.VITE_ETH_PK as string;
const MULTISIG = import.meta.env.VITE_MULTISIG as string;
const ERC20 = import.meta.env.VITE_ERC20 as string;


export const scrtClient = new CosmWasmClient(SCRT_ENDPOINT);
export const ethClient = new Web3(new Web3.providers.HttpProvider(ETH_ENDPOINT, { }));
export const account = ethClient.eth.accounts.wallet.add(ETH_PK);
export const ethContract =  new ethClient.eth.Contract(json.abi as any, MULTISIG)
export const erc20Contract = new ethClient.eth.Contract(erc20json.abi as any, ERC20)


