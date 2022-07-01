import KYVE, { Item } from '@kyve/core';
import { Network, Signature } from './types';
import { fetchBlock } from './utils';
import { name, version } from '../package.json';

process.env.KYVE_RUNTIME = name;
process.env.KYVE_VERSION = version;

KYVE.metrics.register.setDefaultLabels({
  app: process.env.KYVE_RUNTIME,
});

class KyveEvm extends KYVE {
  public async getDataItem(key: string): Promise<Item> {
    let block;

    try {
      let network: Network | undefined;
      if (this.pool.config.chainId && this.pool.config.chainName) {
        network = {
          chainId: this.pool.config.chainId,
          name: this.pool.config.chainName,
        };
      }

      block = await fetchBlock(
        this.pool.config.rpc,
        +key,
        await this.getSignature(),
        network
      );
    } catch (err) {
      this.logger.warn(` Failed to get data item from height ${key}`);
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

  public async formatValue(value: any): Promise<string> {
    return value.hash;
  }

  private async getSignature(): Promise<Signature> {
    const address = await this.sdk.wallet.getAddress();
    const timestamp = new Date().valueOf().toString();

    const message = `${address}//${this.poolId}//${timestamp}`;

    const { signature, pub_key } = await this.sdk.signString(message);

    return {
      signature,
      pubKey: pub_key.value,
      poolId: this.poolId.toString(),
      timestamp,
    };
  }
}

// noinspection JSIgnoredPromiseFromCall
new KyveEvm().start();
