import {
  ListenFunctionObservable,
  ValidateFunctionSubscriber,
} from "@kyve/core/dist/src/faces";
import { ethers } from "ethers";
import hash from "object-hash";
import { Logger } from "tslog";
import { ConfigType } from "./faces";

const validateFunction = (
  listener: ListenFunctionObservable,
  validator: ValidateFunctionSubscriber,
  config: ConfigType,
  logger: Logger
) => {
  logger.getChildLogger({
    name: "EVM",
  });

  // Connect to the RPC endpoint.
  const client = new ethers.providers.StaticJsonRpcProvider(config.rpc);
  logger.info(`✅ Connection created. Endpoint = ${config.rpc}`);

  // Subscribe to the listener.
  listener.subscribe(async (res) => {
    for (const item of res.bundle) {
      const blockHash = (item.tags || []).find((tag) => tag.name === "Block")
        ?.value!;

      logger.debug(`Found block. Hash = ${blockHash}`);

      const block = await client.getBlockWithTransactions(blockHash);
      if (block.transactions.length) {
        block.transactions.forEach(
          // @ts-ignore
          (transaction) => delete transaction.confirmations
        );
      }

      const localHash = hash(JSON.parse(JSON.stringify(block)));
      const uploaderHash = hash(JSON.parse(item.data));

      if (localHash !== uploaderHash) {
        validator.vote({
          transaction: res.transaction,
          valid: false,
        });
        return;
      }
    }

    validator.vote({
      transaction: res.transaction,
      valid: true,
    });
  });
};

export default validateFunction;
