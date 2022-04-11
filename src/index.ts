import KYVE from "@kyve/core";
import { providers } from "ethers";
import { version } from "../package.json";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

KYVE.metrics.register.setDefaultLabels({
  app: process.env.KYVE_RUNTIME,
});

class EVM extends KYVE {
  // pull data item from source
  public async getDataItem(key: number): Promise<{ key: number; value: any }> {
    let provider;
    let block;

    // setup provider for evm chain
    try {
      provider = new providers.StaticJsonRpcProvider(this.pool.config.rpc);
    } catch (err) {
      this.logger.warn(
        ` EXTERNAL ERROR: Failed to connect with rpc: ${this.pool.config.rpc}. Retrying ...`
      );
      // forward error to core
      throw err;
    }

    // try to fetch current block height
    try {
      const height = await provider.getBlockNumber();

      // throw error if requested block height is not available yet
      if (height < key) {
        this.logger.warn(
          ` EXTERNAL ERROR: Requested block does not exist yet. Retrying ...`
        );
        throw new Error();
      }
    } catch (err) {
      this.logger.warn(
        ` EXTERNAL ERROR: Failed to fetch current block height. Retrying ...`
      );
      // forward error to core
      throw err;
    }

    // fetch block with transactions at requested height
    try {
      block = await provider?.getBlockWithTransactions(key)!;

      // delete transaction confirmations from block since they are not deterministic
      block.transactions.forEach(
        (transaction: Partial<providers.TransactionResponse>) =>
          delete transaction.confirmations
      );
    } catch (err) {
      this.logger.warn(
        ` EXTERNAL ERROR: Failed to fetch data item from source at height ${key}. Retrying ...`
      );
      // forward error to core
      throw err;
    }

    return {
      key,
      value: block,
    };
  }
}

new EVM().start();
