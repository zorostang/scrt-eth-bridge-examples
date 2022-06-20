import { config } from 'dotenv';
config({ path: `.env` });

export const { 
    NODE_ENV, 
    PORT, 
    DB_HOST, 
    DB_PORT, 
    DB_DATABASE,
    PROXY_ADDRESS,
    SWAP_ADDRESS,
    ETH_GOV_TOKEN_ADDRESS,
    SCRT_ENDPOINT,
    ETH_ENDPOINT,
    ETH_PK,
    ETH_PK2,
    ETH_ERC20_ADDRESS
} = process.env;
