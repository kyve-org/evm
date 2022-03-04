import KYVE, { sleep } from "@kyve/core";
import { providers } from "ethers";
import { version } from "../package.json";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

KYVE.metrics.register.setDefaultLabels({
  app: process.env.KYVE_RUNTIME,
});

class EVM extends KYVE {
  public async getDataItem(height: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      let provider;
      let dataItem;

      try {
        provider = new providers.StaticJsonRpcProvider(this.pool.config.rpc);
      } catch (err) {
        reject(err);
      }

      while (true) {
        try {
          const block = await provider?.getBlockWithTransactions(height)!;

          if (block.transactions.length) {
            block.transactions.forEach(
              // @ts-ignore
              (transaction) => delete transaction.confirmations
            );
          }

          dataItem = block;

          break;
        } catch {
          await sleep(1000);
        }
      }

      await this.db.put(height, dataItem);

      resolve();
    });
  }
}

new EVM().start();
