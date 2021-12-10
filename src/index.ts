import KYVE from "@kyve/core";
import { BlockInstructions } from "@kyve/core/dist/src/faces";
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
    const batchSize = 1000;
    const rateLimit = 10;

    while (true) {
      try {
        const provider = new SafeProvider(this.poolState.config.rpc);
        const batch: any[] = [];
        const promises: any[] = [];

        let workerHeight;

        try {
          workerHeight = await this.db.get(-1);
        } catch {
          const poolHeight = this.poolState.height.toNumber();

          await this.db.put(-1, poolHeight);
          workerHeight = poolHeight;
        }

        KYVE.logger.debug(`Worker height = ${workerHeight}`);

        for (
          let height = +workerHeight;
          height < +workerHeight + batchSize;
          height++
        ) {
          promises.push(
            provider.safeGetBlockWithTransactions(height).then((block) => {
              batch.push(block);
            })
          );
          await sleep(rateLimit);
        }

        await Promise.all(promises);

        await this.db.batch(
          batch.map((b) => ({
            type: "put",
            key: +b.number,
            value: JSON.stringify(b),
          }))
        );
        await this.db.put(-1, +workerHeight + batchSize);
        KYVE.logger.debug(
          `Saved batch to db. Worker height = ${+workerHeight + batchSize}`
        );
        await sleep(rateLimit * 10);
      } catch (error) {
        KYVE.logger.error("Error fetching data batch", error);
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

        currentDataSize += KYVE.dataSizeOfString(block);
        currentHeight += 1;

        if (currentDataSize <= bundleDataSizeLimit) {
          bundle.push(block);
          progress.update(currentDataSize);
        } else {
          progress.stop();
          break;
        }
      } catch {
        KYVE.logger.debug(
          `Could not fetch block at height = ${currentHeight} - ${(
            (currentDataSize * 100) /
            bundleDataSizeLimit
          ).toFixed(2)}%. Waiting ...`
        );
        await sleep(10 * 1000);
      }
    }

    KYVE.logger.debug(`Created bundle with length = ${bundle.length}`);

    return bundle;
  }
}

new EVM().start();
