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
        `⚠️  EXTERNAL ERROR: Failed to connect with rpc: ${this.pool.config.rpc}. Retrying ...`
      );
      this.logger.debug(err);
      // forward error to core
      throw err;
    }

    // fetch block with transactions at requested height
    try {
      block = await provider?.getBlockWithTransactions(key)!;

      // delete transaction confirmations from block since they are not deterministic
      if (block.transactions.length) {
        block.transactions.forEach(
          (transaction: Partial<providers.TransactionResponse>) =>
            delete transaction.confirmations
        );
      }
    } catch (err) {
      this.logger.warn(
        `⚠️  EXTERNAL ERROR: Failed to fetch data item from source at height ${key}. Retrying ...`
      );
      this.logger.debug(err);
      // forward error to core
      throw err;
    }

    return {
      key,
      value: block,
    };
  }

  // validate the data item uploaded by a node
  public async validate(
    uploadBundle: Buffer,
    uploadBytes: number,
    downloadBundle: Buffer,
    downloadBytes: number
  ): Promise<boolean> {
    // default validate consists of a simple hash comparison
    return super.validate(
      uploadBundle,
      uploadBytes,
      downloadBundle,
      downloadBytes
    );
  }
}

new EVM().start();
