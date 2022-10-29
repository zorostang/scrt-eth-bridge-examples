import pkg from '@typegoose/typegoose';
const { prop, getModelForClass, modelOptions } = pkg;


@modelOptions({ schemaOptions: { collection: 'txs', timestamps: true, versionKey: false } })
export class Tx {
    
    @prop({ type: String })
    public amount: string;

    @prop({ type: String })
    public destination: string;

    @prop({ type: String, index: true})
    public txId: string;

    @prop({ type: String })
    public status: string;
    
}


export const txModel = getModelForClass(Tx);

