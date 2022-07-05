import { Signature, DataItem, IRuntime } from '@kyve/core';
import { name, version } from '../package.json';
import { providers } from 'ethers';

export default class EVM implements IRuntime {
  public name = name;
  public version = version;

  public async getDataItem(
    key: string,
    config: any,
    requestSignature: () => Promise<Signature>
  ): Promise<DataItem> {
    // set network settings if available
    let network;

    if (config.chainId && config.chainName) {
      network = {
        chainId: config.chainId,
        name: config.chainName,
      };
    }

    // requestSignature for coinbase cloud
    const signature = await requestSignature();

    // fetch data item from key
    const value = await new providers.StaticJsonRpcProvider(
      {
        url: config.rpc,
        headers: {
          'Content-Type': 'application/json',
          Signature: signature.signature,
          'Public-Key': signature.pubKey,
          'Pool-ID': signature.poolId,
          Timestamp: signature.timestamp,
        },
      },
      network
    ).getBlockWithTransactions(+key);

    // throw if data item is not available
    if (!value) throw new Error();

    // Delete the number of confirmations from a transaction to keep data deterministic.
    value.transactions.forEach(
      (tx: Partial<providers.TransactionResponse>) => delete tx.confirmations
    );

    return {
      key,
      value,
    };
  }

  public async getNextKey(key: string): Promise<string> {
    return (parseInt(key) + 1).toString();
  }

  public async formatValue(value: any): Promise<string> {
    return value.hash;
  }
}
