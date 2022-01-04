import KYVE, {
  Bundle,
  BundleInstructions,
  BundleProposal,
  logger,
  Progress,
} from "@kyve/core";
import path from "path";
import { loadSync, Type } from "protobufjs";
import { SafeProvider, sleep } from "./provider";
import { version } from "../package.json";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

KYVE.metrics.register.setDefaultLabels({
  app: process.env.KYVE_RUNTIME,
});

class EVM extends KYVE {
  type: Type;

  constructor() {
    super();

    const root = loadSync(path.join(__dirname, "schema.proto"));
    this.type = root.lookupType("Block");
  }

  public async requestWorkerBatch(workerHeight: number): Promise<any[]> {
    const batchSize = 100;
    const rateLimit = 10;

    const provider = new SafeProvider(this.poolState.config.rpc);
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

  public async createBundle(
    bundleInstructions: BundleInstructions
  ): Promise<Bundle> {
    const bundleDataSizeLimit = 20 * 1000 * 1000; // 20 MB
    const bundleItemSizeLimit = 10000;
    const bundle: any[] = [];

    const progress = new Progress("blocks");

    logger.debug(
      `Creating bundle from height = ${bundleInstructions.fromHeight} ...`
    );

    let currentDataSize = 0;
    let h = bundleInstructions.fromHeight;

    progress.start(bundleItemSizeLimit, 0);

    while (true) {
      try {
        const block = await this.db.get(h);
        currentDataSize += Buffer.from(JSON.stringify(block)).byteLength;

        if (
          currentDataSize < bundleDataSizeLimit &&
          bundle.length < bundleItemSizeLimit
        ) {
          bundle.push(block);
          h += 1;
          progress.update(h - bundleInstructions.fromHeight);
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

    progress.stop();

    logger.debug(`Created bundle with length = ${bundle.length}`);

    return {
      fromHeight: bundleInstructions.fromHeight,
      toHeight: h,
      bundle,
    };
  }

  public async loadBundle(bundleProposal: BundleProposal): Promise<any[]> {
    const bundle: any[] = [];
    const progress = new Progress("blocks");
    let h: number = bundleProposal.fromHeight;

    progress.start(bundleProposal.toHeight - bundleProposal.fromHeight, 0);

    while (h < bundleProposal.toHeight) {
      try {
        const block = await this.db.get(h);

        bundle.push(block);
        h += 1;
        progress.update(h - bundleProposal.fromHeight);
      } catch {
        await sleep(10 * 1000);
      }
    }

    progress.stop();

    return bundle;
  }
}

new EVM().start();
