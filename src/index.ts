import KYVE, { BlockInstructions, dataSizeOfString, logger } from "@kyve/core";
import { version } from "../package.json";
import { SafeProvider, sleep } from "./worker";
import cliProgress from "cli-progress";
import chalk from "chalk";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

KYVE.metrics.register.setDefaultLabels({
  app: process.env.KYVE_RUNTIME,
});

class EVM extends KYVE {
  public async worker() {
    const batchSize = 10;
    const rateLimit = 10;

    while (true) {
      try {
        const provider = new SafeProvider(this.poolState.config.rpc);
        const batch: any[] = [];

        let workerHeight;

        try {
          workerHeight = await this.db.get(-1);
        } catch {
          workerHeight = this.poolState.height.toNumber();
        }

        logger.debug(`Worker height = ${workerHeight}`);

        for (
          let height = workerHeight;
          height < workerHeight + batchSize;
          height++
        ) {
          batch.push(provider.safeGetBlockWithTransactions(height));
          await sleep(rateLimit);
        }

        const ops = [
          ...(await Promise.all(batch)).map((b) => ({
            type: "put",
            key: b.number,
            value: b,
          })),
          {
            type: "put",
            key: -1,
            value: workerHeight + batchSize,
          },
        ];

        await this.db.batch(ops);

        logger.debug(
          `Saved batch to db. Worker height = ${workerHeight + batchSize}`
        );

        await sleep(rateLimit * 10);
      } catch (error) {
        logger.error("Error fetching data batch", error);
        await sleep(10 * 1000);
      }
    }
  }

  public async createBundle(
    blockInstructions: BlockInstructions
  ): Promise<any[]> {
    const bundleDataSizeLimit = 50 * 1000 * 1000; // 50 MB
    const bundle: any[] = [];

    const progress = new cliProgress.SingleBar({
      format: `${chalk.gray(
        new Date().toISOString().replace("T", " ").replace("Z", " ")
      )} ${chalk.bold.blueBright(
        "INFO"
      )} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} bytes`,
    });

    progress.start(bundleDataSizeLimit, 0);

    let currentDataSize = 0;
    let currentHeight = blockInstructions.fromHeight;

    while (true) {
      try {
        const block = await this.db.get(currentHeight);

        currentDataSize += dataSizeOfString(JSON.stringify(block));

        if (currentDataSize <= bundleDataSizeLimit) {
          bundle.push(block);
          currentHeight += 1;
          progress.update(currentDataSize);
        } else {
          progress.stop();
          break;
        }
      } catch {
        await sleep(10 * 1000);
      }
    }

    logger.debug(`Created bundle with length = ${bundle.length}`);

    return bundle;
  }
}

new EVM().start();
