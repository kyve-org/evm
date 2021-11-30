import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import { BundlerFunction } from "@kyve/core/dist/src/faces";
import cliProgress from "cli-progress";
import chalk from "chalk";
import { ethers } from "ethers";
import { ConfigType } from "./faces";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const bundlerFunction: BundlerFunction<ConfigType> = async (
  config,
  fromHeight,
  toHeight
) => {
  const bundle: BlockWithTransactions[] = [];
  const provider = new ethers.providers.JsonRpcBatchProvider(config.rpc);

  const waitForBlock = async (height: number): Promise<void> => {
    return new Promise(async (resolve) => {
      let currentHeight = await provider.getBlockNumber();

      while (currentHeight < height) {
        await sleep(10 * 1000);
        currentHeight = await provider.getBlockNumber();
      }

      resolve();
    });
  };

  await waitForBlock(toHeight);

  const progress = new cliProgress.SingleBar({
    format: `${chalk.gray(
      new Date().toISOString().replace("T", " ").replace("Z", " ")
    )} ${chalk.bold.blueBright(
      "INFO"
    )} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} blocks`,
  });
  progress.start(toHeight - fromHeight, 0);

  const promises = [];
  for (let height = fromHeight; height < toHeight; height++) {
    promises.push(
      provider.getBlockWithTransactions(height).then((block) => {
        if (block.transactions.length) {
          block.transactions.forEach(
            // @ts-ignore
            (transaction) => delete transaction.confirmations
          );
        }

        bundle.push(block);
        progress.increment();
      })
    );
  }

  await Promise.all(promises);
  progress.stop();

  return bundle;
};

export default bundlerFunction;
