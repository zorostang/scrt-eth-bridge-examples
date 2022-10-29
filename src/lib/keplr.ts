import {  SigningCosmWasmClient } from "secretjs";
import { Buffer } from "buffer"
import { keplrConnected, scrtAccount } from "./stores";
import { tryWait } from "./utils";

const restAddress = import.meta.env.VITE_SCRT_ENDPOINT as string
const sSCRTcontract = import.meta.env.VITE_SSCRT as string
const sETHcontract = import.meta.env.VITE_SETH as string

const PROXY_HASH = import.meta.env.VITE_PROXY_HASH as string;
const SCRT_PROXY = import.meta.env.VITE_SCRT_PROXY as string;
const ETH_PROXY = import.meta.env.VITE_ETH_PROXY as string;

class KeplrState {

    private client : SigningCosmWasmClient | undefined;
    public address : string = "";

    private readonly permitParams : any = {
        permit_name: "new_permit",
        allowed_tokens: [this.tokenContract],
        permissions: ['owner'],
    };

    private signature : any;


    constructor(
        public connected: boolean = false,
    	public chainId : string = 'pulsar-2',
        public contractAddress : string = "secret1925shc39c2juu2k375f2w4a98sehytu763jp2z",
        public proxyAddress : string = "secret12nntrlzadp0c6cdzz6h24esm2eryvj2cq83yca",
        public codeHash : string = "60d4f9b200f68166a9c7bfaefd86abdbd413679b5ef4f7276178c70acc75bb55",
        public tokenContract : string = "secret1uy7phvlk2pak99mzr8tjh88zekvmju6fal497k",
        public vk : string = "api_key_9MY/sCho72bEzPQHwnfd9bZq5szuFJONKSj+R2VDzew="
    ) {
        if (typeof window !== 'undefined') {
            const conn : string | null  = localStorage.getItem("connected");
            connected = conn === "true";

            const sigStr : string | null  = localStorage.getItem("signature");
            if (sigStr) this.signature = JSON.parse(sigStr);
        }
    }

    async ifConnected() {
        try {
            await tryWait(() => !this.connected, "Couldn't get tokens", 5000)
            return true
        } catch (_) {
            return false;
        }
    }


    async setupKeplr() {
        
        // Wait for Keplr to be injected to the page
        await tryWait(() => (!window.keplr && !window.getOfflineSigner && !window.getEnigmaUtils), 
                            "Couldn't connect to Keplr. Make sure it is installed")
        
                                    
        // Enable Keplr.
        // This pops-up a window for the user to allow keplr access to the webpage.
        await window.keplr.enable(this.chainId);

    
        // Setup SecrtJS with Keplr's OfflineSigner
        // This pops-up a window for the user to sign on each tx we sent
        const keplrOfflineSigner  = window.getOfflineSigner(this.chainId);

        const accounts = await keplrOfflineSigner.getAccounts();
        this.address = accounts[0].address;
        

        this.client = new SigningCosmWasmClient(
          restAddress,
          this.address,
          keplrOfflineSigner,
          window.getEnigmaUtils(this.chainId),
        );

        keplrConnected.set(true);
        scrtAccount.set(this.address);

        this.connected = true;
        localStorage.setItem("connected", "true")
    }


 

    async sendSscrt(amount : string, destination: string) {

        const handle = {
            send: {
                amount: amount,
                recipient: SCRT_PROXY,
                recipient_code_hash: PROXY_HASH, //this.codeHash,
                msg: Buffer.from(destination).toString('base64')   
            },
            
        }
        return await this.client!.execute(sSCRTcontract, handle, "", undefined, { gas: "510000", amount: undefined })    
    }


    async sendSeth(amount : string, destination: string) {

        const handle = {
            send: {
                amount: amount,
                recipient: ETH_PROXY,
                recipient_code_hash: PROXY_HASH,
                msg: Buffer.from(destination).toString('base64')   
            }
        }

        return await this.client.execute(sETHcontract, handle, "", undefined, { gas: "1200000", amount: undefined })    
    }


    async getSignature() {

        
        const {signature} = await window.keplr.signAmino(
            this.chainId,
            this.tokenContract,
            {
                chain_id: this.chainId,
                account_number: "0", // Must be 0
                sequence: "0", // Must be 0
                fee: {
                    amount: [{denom: "uscrt", amount: "0"}], // Must be 0 uscrt
                    gas: "1", // Must be 1
                },
                msgs: [
                    {
                        type: "query_permit", // Must be "query_permit"
                        value: this.permitParams
                    },
                ],
                memo: "", // Must be empty
            },
            {
                preferNoSetFee: true, // Fee must be 0, so hide it from the user
                preferNoSetMemo: true, // Memo must be empty, so hide it from the user
            }
        );
      this.signature = signature;

      localStorage.setItem("signature", JSON.stringify(signature));

      return signature
  }


    async customQueryPermit(query:object) {

        const q = {
            with_permit: { 

                query,

                permit: {
                  params: {
                    ...this.permitParams, 
                    chain_id : this.chainId
                  },    
                      
                  signature: this.signature ?? await this.getSignature(),
              },       
          
            }
        }
        const r = await this.client.queryContractSmart(this.contractAddress, q)
        return r
    }

    async customQuery(query:object) {
        const r = await this.client.queryContractSmart(this.contractAddress, query)
        return r
    }


    async getToken(id:string) {
        return await this.customQueryPermit({ nft_dossier : { token_id : id }})
    }

    async getBalance() {

        return await this.client.queryContractSmart(this.tokenContract, {  balance : { address : this.address, key : this.vk }})
    }


    async setKey() {
        return await this.client.execute(this.tokenContract, { create_viewing_key : { entropy : "123"} })
    }


    async transfer(token_id:string, recipient:string) {
        return await this.client.execute(this.contractAddress, { transfer_nft : { token_id, recipient }} )    
    }


    async getTokens() {
        await tryWait(() => !this.address, "Couldn't get tokens", 5000)
        return await this.customQueryPermit({ tokens : { owner : this.address }})
    }

}


export const keplrState = new KeplrState();
