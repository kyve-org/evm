import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import { BundlerFunction } from "@kyve/core/dist/src/faces";
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
  const provider = new ethers.providers.StaticJsonRpcProvider(config.rpc);

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

  for (let height = fromHeight; height < toHeight; height++) {
    const block = await provider.getBlockWithTransactions(height);

    if (block.transactions.length) {
      block.transactions.forEach(
        // @ts-ignore
        (transaction) => delete transaction.confirmations
      );
    }

    bundle.push(block);
  }

  return bundle;
};

export default bundlerFunction;
