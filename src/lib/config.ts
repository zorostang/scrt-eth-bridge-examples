import { config } from 'dotenv';
config({ path: `.env` });

export const DB_HOST = import.meta.env.VITE_DB_HOST;
export const DB_PORT = import.meta.env.VITE_DB_PORT;
export const DB_DATABASE = import.meta.env.VITE_DB_DATABASE;

export const { 
    NODE_ENV, 
    PORT, 
    PROXY_ADDRESS,
    SWAP_ADDRESS,
    ETH_GOV_TOKEN_ADDRESS,
    SCRT_ENDPOINT,
    ETH_ENDPOINT,
    ETH_PK,
    ETH_ERC20_ADDRESS
} = process.env;
