import KYVE, { Bundle, formatBundle } from "@kyve/core";
import { SafeProvider, sleep } from "./provider";
import { version } from "../package.json";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

KYVE.metrics.register.setDefaultLabels({
  app: process.env.KYVE_RUNTIME,
});

class EVM extends KYVE {
  public async requestWorkerBatch(workerHeight: number): Promise<any[]> {
    const batchSize = 100;
    const rateLimit = 10;

    const provider = new SafeProvider(this.pool.config.rpc);
    const currentHeight = await provider.getBlockNumber();
    const promises: any[] = [];

    const toHeight =
      workerHeight + batchSize <= currentHeight
        ? workerHeight + batchSize
        : currentHeight;

    for (let height = workerHeight; height < toHeight; height++) {
      promises.push(provider.safeGetBlockWithTransactions(height));
      await sleep(rateLimit);
    }

    const batch = await Promise.all(promises);

    return batch.map((b) => ({
      key: b.number,
      value: b,
    }));
  }

  public async createBundle(): Promise<Bundle> {
    const bundleDataSizeLimit = 20 * 1000 * 1000; // 20 MB
    const bundleItemSizeLimit = 10000;
    const bundle: any[] = [];

    let currentDataSize = 0;
    let h = +this.pool.bundleProposal.toHeight;

    while (true) {
      try {
        const block = await this.db.get(h);
        const encodedBlock = Buffer.from(JSON.stringify(block));
        currentDataSize += encodedBlock.byteLength + 32;

        if (
          currentDataSize < bundleDataSizeLimit &&
          bundle.length < bundleItemSizeLimit
        ) {
          bundle.push(encodedBlock);
          h += 1;
        } else {
          break;
        }
      } catch {
        if (bundle.length) {
          break;
        } else {
          await sleep(10 * 1000);
        }
      }
    }

    return {
      fromHeight: this.pool.bundleProposal.toHeight,
      toHeight: h,
      bundle: formatBundle(bundle),
    };
  }

  public async loadBundle(): Promise<Buffer> {
    const bundle: any[] = [];
    let h: number = +this.pool.bundleProposal.fromHeight;

    while (h < +this.pool.bundleProposal.toHeight) {
      try {
        const block = await this.db.get(h);
        const encodedBlock = Buffer.from(JSON.stringify(block));

        bundle.push(encodedBlock);
        h += 1;
      } catch {
        await sleep(10 * 1000);
      }
    }

    return formatBundle(bundle);
  }
}

new EVM().start();
