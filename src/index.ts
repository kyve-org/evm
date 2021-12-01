import KYVE from "@kyve/core";
import bundler from "./bundler";
import { version } from "../package.json";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

(async () => {
  const { node } = await KYVE.generate();
  node.start(bundler);
})();
