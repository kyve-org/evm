import { BundlerFunction } from "@kyve/core/dist/src/faces";
import { ethers } from "ethers";
import { ConfigType } from "./faces";

const bundlerFunction: BundlerFunction<ConfigType> = async (
  config,
  fromHeight,
  toHeight
) => {
  const bundle: any[] = [];
  const provider = new ethers.providers.StaticJsonRpcProvider(config.rpc);

  // TODO: handle scenario where toHeight is higher than current block height
  // TODO: maybe implement sleep in order not to get rate limited

  for (let height = fromHeight; height < toHeight; height++) {
    const block = await provider.getBlockWithTransactions(height);
    bundle.push(block);
  }

  return bundle;
};

export default bundlerFunction;
