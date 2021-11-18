import { UploadFunctionSubscriber } from "@kyve/core/dist/src/faces";
import { ethers } from "ethers";
import { Logger } from "tslog";
import { ConfigType } from "./faces";

const uploadFunction = (
  uploader: UploadFunctionSubscriber,
  config: ConfigType,
  logger: Logger
) => {
  logger = logger.getChildLogger({
    name: "Uploader",
  });

  // Connect to the WebSocket endpoint.
  const client = new ethers.providers.WebSocketProvider(config.wss);
  logger.info(`✅ Connection created. Endpoint = ${config.wss}`);

  client._websocket.on("open", () =>
    setInterval(() => client._websocket.ping(), 5000)
  );

  // Subscribe to new blocks.
  client.on("block", async (height: number) => {
    const block = await client.getBlockWithTransactions(height);

    if (block.transactions.length) {
      block.transactions.forEach(
        // @ts-ignore
        (transaction) => delete transaction.confirmations
      );
    }

    const tags = [
      { name: "Block", value: block.hash },
      { name: "Height", value: block.number.toString() },
    ];
    if (block.transactions.length) {
      block.transactions.forEach((transaction) =>
        tags.push({
          name: "Transaction",
          value: transaction.hash,
        })
      );
    }

    uploader.upload({ data: JSON.stringify(block), tags });
  });
};

export default uploadFunction;
