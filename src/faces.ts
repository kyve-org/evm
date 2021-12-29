import { _Block, TransactionResponse } from "@ethersproject/abstract-provider/src.ts/index";
import { Optional } from 'utility-types';

export type ConfigType = { rpc: string; wss: string };
export type UploadData = _Block & {
    transactions: Array<Optional<TransactionResponse, 'confirmations'>>
}