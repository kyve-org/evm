import { DataItem, IRuntime } from '@kyve/core';
import { name, version } from '../package.json';
import { Network, Signature } from './types';
import { fetchBlock } from './utils';

export default class EVM implements IRuntime {
  public name = name;
  public version = version;

  public async getDataItem(key: string, config: any): Promise<DataItem> {
    let block;

    try {
      let network: Network | undefined;
      if (config.chainId && config.chainName) {
        network = {
          chainId: config.chainId,
          name: config.chainName,
        };
      }

      block = await fetchBlock(
        config.rpc,
        +key,
        await this.getSignature(),
        network
      );
    } catch (err) {
      throw err;
    }

    if (!block) throw new Error();

    return { key, value: block };
  }

  public async getNextKey(key: string): Promise<string> {
    if (key) {
      return (parseInt(key) + 1).toString();
    }

    return '0';
  }

  public async getFormattedValueFromDataItem(value: any): Promise<string> {
    return value.hash;
  }

  private async getSignature(): Promise<Signature> {
    // TODO: move to core
    // const address = await this.sdk.wallet.getAddress();
    // const timestamp = new Date().valueOf().toString();
    // const message = `${address}//${this.poolId}//${timestamp}`;
    // const { signature, pub_key } = await this.sdk.signString(message);
    // return {
    //   signature,
    //   pubKey: pub_key.value,
    //   poolId: this.poolId.toString(),
    //   timestamp,
    // };

    return {
      signature: '',
      pubKey: '',
      poolId: '',
      timestamp: '',
    };
  }
}
