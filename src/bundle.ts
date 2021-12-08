import {
  BlockTag,
  BlockWithTransactions,
} from "@ethersproject/abstract-provider";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { BlockInstructions } from "@kyve/core/dist/src/faces";
import cliProgress from "cli-progress";
import chalk from "chalk";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

class Provider extends StaticJsonRpcProvider {
  async safeGetBlockNumber(): Promise<number> {
    while (true) {
      try {
        return await this.getBlockNumber();
      } catch {
        await sleep(10);
      }
    }
  }

  async safeGetBlockWithTransactions(
    blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>
  ): Promise<BlockWithTransactions> {
    while (true) {
      try {
        const block = await this.getBlockWithTransactions(blockHashOrBlockTag);

        if (block.transactions.length) {
          block.transactions.forEach(
            // @ts-ignore
            (transaction) => delete transaction.confirmations
          );
        }

        return block;
      } catch {
        await sleep(10);
      }
    }
  }
}

export const createEVMBundle = async (
  config: { rpc: string; wss: string },
  blockInstructions: BlockInstructions
): Promise<any[]> => {
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

  progress.start(blockInstructions.toHeight - blockInstructions.fromHeight, 0);

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
};
