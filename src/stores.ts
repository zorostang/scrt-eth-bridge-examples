import {  SigningCosmWasmClient } from "secretjs";
import { Buffer } from "buffer"

const restAddress = "https://lcd.pulsar.griptapejs.com/"
const sSCRTcontract = "secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg"


const sleep = (ms : number) => new Promise((accept) => setTimeout(accept, ms));


const tryWait = async (conditionCallback : Function, 
                errorText : string,
                timeout : number = 1200) => {

    let counter = 0;

    while (conditionCallback()) {
        counter += 10;
        if (counter > timeout) {
            throw Error(errorText);
        }
        await sleep(10);
    }
    
}




class Web3State {

    private client : any;
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

        
            
            
    
        this.connected = true;
        localStorage.setItem("connected", "true")
    }


    async addToken() {

        const handle = {
            add_token: {  
                address: this.proxyAddress, //"secret1uy7phvlk2pak99mzr8tjh88zekvmju6fal497k",
                code_hash: "a1fbec81cea8ffcd0a7ec95cc3adfc64c4b3a4584c51af08ba0569fa1f91a821", //"2da545ebc441be05c9fa6338f3353f35ac02ec4b02454bc49b1a66f4b9866aed",
                minimum_amount : "5"  
            }
        }

        return await this.client.execute(this.contractAddress, handle)    
    }

    async sendSscrt(amount : string, destination: string) {

        const handle = {
            send: {
                amount: amount,
                recipient: this.proxyAddress,
                recipient_code_hash: "a1fbec81cea8ffcd0a7ec95cc3adfc64c4b3a4584c51af08ba0569fa1f91a821", //this.codeHash,
                msg: Buffer.from(destination).toString('base64')   
            }
        }

 

        return await this.client.execute(sSCRTcontract, handle)    
    }


    async sendSeth(amount : string) {

        const msg = "MHhGQTIyYzFCRjNiMDc2RDJCNTc4NUE1MjdDMzg5NDliZTQ3RWExMDgy";

        const handle = {
            send: {
                amount: amount,
                recipient: this.tokenContract,
                recipient_code_hash: this.codeHash,
                //msg: Buffer.from(JSON.stringify(Msg)).toString('base64') 
                msg       
            }
        }

        return await this.client.execute(sSCRTcontract, handle)    
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

    async checkTx(hash="AE362C4BEFCD9DFE46093A2CC858DEC5066220DE804E185C1B336E91858EE4B0") {
        return await this.client.restClient.txById(hash);
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

    async getLastBurnedTokens() {
        return await this.client.queryContractSmart(this.contractAddress, { swap : { nonce: this.lastNonce(), token: this.proxyAddress }})

    }

    lastNonce() {
        const storage = localStorage.getItem("lastNonce"); 
        if (!storage) {
            return 4
        } else {
            return parseInt(storage);
        }
    }

    incrementNonce() {
        const storage = localStorage.getItem("lastNonce"); 
        if (!storage) {
            localStorage.setItem("lastNonce", "1")
        } else {
            localStorage.setItem("lastNonce", (parseInt(storage) + 1).toString());
        }
    }






}


export const keplrState = new Web3State();
