import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'scrt_swaps', timestamps: true, versionKey: false } })
export class ScrtSwap {
    
    @prop({ type: String })
    public amount: string;

    @prop({ type: String })
    public destination: string;

    @prop({ type: String })
    public source: string;

    @prop({ type: String })
    public token: string;
}


@modelOptions({ schemaOptions: { collection: 'eth_txs', timestamps: true, versionKey: false } })
export class EthTx {
    
    @prop({ type: String })
    public amount: string;

    @prop({ type: String })
    public destination: string;

    @prop({ type: String, index: true})
    public txId: string;
}


export const scrtSwapModel = getModelForClass(ScrtSwap);
export const ethTxModel = getModelForClass(EthTx);

