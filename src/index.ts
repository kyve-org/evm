import KYVE from "@kyve/core";
import { createEVMBundle } from "./bundle";
import { version } from "../package.json";
import { BlockInstructions } from "@kyve/core/dist/src/faces";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

KYVE.metrics.register.setDefaultLabels({
  app: process.env.KYVE_RUNTIME,
});

class EVM extends KYVE {
  public async createBundle(
    config: { rpc: string; wss: string },
    blockInstructions: BlockInstructions
  ): Promise<any[]> {
    return await createEVMBundle(config, blockInstructions);
  }
}

new EVM().start();
