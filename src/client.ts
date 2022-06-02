import Web3 from "web3"
import { CosmWasmClient } from "secretjs";
import { SCRT_ENDPOINT, ETH_ENDPOINT, ETH_GOV_TOKEN_ADDRESS, ETH_ERC20_ADDRESS, ETH_PK } from "./config";
import json from "./assets/Contract.json"
import erc20json from "./assets/ERC20.json";


export const scrtClient = new CosmWasmClient(SCRT_ENDPOINT);
export const ethClient = new Web3(new Web3.providers.HttpProvider(ETH_ENDPOINT, { }));
export const account = ethClient.eth.accounts.wallet.add(ETH_PK);


export const ethContract =  new ethClient.eth.Contract(json.abi, ETH_GOV_TOKEN_ADDRESS)
export const erc20Contract = new ethClient.eth.Contract(erc20json.abi, ETH_ERC20_ADDRESS,)


