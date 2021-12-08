import {
  BlockTag,
  BlockWithTransactions,
} from "@ethersproject/abstract-provider";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export class Provider extends StaticJsonRpcProvider {
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
