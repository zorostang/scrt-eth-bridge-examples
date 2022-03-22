import {  SigningCosmWasmClient } from "secretjs";

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
    private address : string = "";

    private readonly permitParams : any = {
        permit_name: "_permit",
        allowed_tokens: [this.contractAddress],
        permissions: ['owner'],
    };

    private signature : any;


    constructor(
        public connected: boolean = false,
    	public chainId : string = 'pulsar-2',
        public contractAddress : string = "secret1925shc39c2juu2k375f2w4a98sehytu763jp2z",
        public codeHash : string = "60d4f9b200f68166a9c7bfaefd86abdbd413679b5ef4f7276178c70acc75bb55"
    ) {
        if (typeof window !== 'undefined') {
            const conn : string | null  = localStorage.getItem("connected");
            connected = conn === "true";

            const sigStr : string | null  = localStorage.getItem("signature");
            if (sigStr) this.signature = JSON.parse(sigStr);
        }
    }


    async setupKeplr() {
        
        // Wait for Keplr to be injected to the page
        await tryWait(() => (!window.keplr && !window.getOfflineSigner && !window.getEnigmaUtils), 
                            "Couldn't connect to Keplr. Make sure it is installed")
        
        
                            await window.keplr.experimentalSuggestChain({
                                chainId: this.chainId,
                                    chainName: 'Pulsar-2',
                                    rpc: 'https://rpc.pulsar.griptapejs.com/',
                                    rest: 'https://lcd.pulsar.griptapejs.com/',
                                    bip44: {
                                        coinType: 529,
                                    },
                                    coinType: 529,
                                    stakeCurrency: {
                                        coinDenom: 'SCRT',
                                        coinMinimalDenom: 'uscrt',
                                        coinDecimals: 6,
                                    },
                                    bech32Config: {
                                        bech32PrefixAccAddr: 'secret',
                                        bech32PrefixAccPub: 'secretpub',
                                        bech32PrefixValAddr: 'secretvaloper',
                                        bech32PrefixValPub: 'secretvaloperpub',
                                        bech32PrefixConsAddr: 'secretvalcons',
                                        bech32PrefixConsPub: 'secretvalconspub',
                                    },
                                    currencies: [
                                        {
                                            coinDenom: 'SCRT',
                                            coinMinimalDenom: 'uscrt',
                                            coinDecimals: 6,
                                        },
                                    ],
                                    feeCurrencies: [
                                        {
                                            coinDenom: 'SCRT',
                                            coinMinimalDenom: 'uscrt',
                                            coinDecimals: 6,
                                        },
                                    ],
                                    gasPriceStep: {
                                        low: 0.1,
                                        average: 0.25,
                                        high: 0.4,
                                    },
                                    features: ['secretwasm'],
                                });
                                
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
                address: sSCRTcontract,
                code_hash: "9587d60b8e6b078ace12014ceeee089530b9fabcd76535d93666a6c127ad8813",
                minimum_amount : "5"  
            }
        }

        return await this.client.execute(this.contractAddress, handle)    
    }

    async sendSscrt(amount : string) {

        const msg = "MHhGQTIyYzFCRjNiMDc2RDJCNTc4NUE1MjdDMzg5NDliZTQ3RWExMDgy";

        const handle = {
            send: {
                amount: amount,
                recipient: this.contractAddress,
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
            this.address,
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

    async transfer(token_id:string, recipient:string) {
        return await this.client.execute(this.contractAddress, { transfer_nft : { token_id, recipient }} )    
    }

    async getTokens() {
        await tryWait(() => !this.address, "Couldn't get tokens", 5000)
        return await this.customQueryPermit({ tokens : { owner : this.address }})
    }






}


export const keplrState = new Web3State();
