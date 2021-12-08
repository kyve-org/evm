import KYVE from "@kyve/core";
import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import cliProgress from "cli-progress";
import chalk from "chalk";
import { Provider, sleep } from "./utils";
import { BlockInstructions } from "@kyve/core/dist/src/faces";
import { version } from "../package.json";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

class EVM extends KYVE {
  public async createBundle(
    config: { rpc: string; wss: string },
    blockInstructions: BlockInstructions
  ): Promise<any[]> {
    const bundle: BlockWithTransactions[] = [];
    const provider = new Provider(config.rpc);

    const waitForBlock = async (height: number): Promise<void> => {
      return new Promise(async (resolve) => {
        let currentHeight = await provider.safeGetBlockNumber();

        while (currentHeight < height) {
          await sleep(10 * 1000);
          currentHeight = await provider.safeGetBlockNumber();
        }

        resolve();
      });
    };

    await waitForBlock(blockInstructions.toHeight);

    const progress = new cliProgress.SingleBar({
      format: `${chalk.gray(
        new Date().toISOString().replace("T", " ").replace("Z", " ")
      )} ${chalk.bold.blueBright(
        "INFO"
      )} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} blocks`,
    });

    progress.start(
      blockInstructions.toHeight - blockInstructions.fromHeight,
      0
    );

    const promises = [];

    for (
      let height = blockInstructions.fromHeight;
      height < blockInstructions.toHeight;
      height++
    ) {
      promises.push(
        provider.safeGetBlockWithTransactions(height).then((block) => {
          bundle.push(block);
          progress.increment();
        })
      );

      // TODO: Can we make this dynamic?
      await sleep(10);
    }

    await Promise.all(promises);

    progress.stop();

    bundle.sort((a, b) => b.number - a.number);

    return bundle;
  }
}

(async () => {
  new EVM().start();
})();
