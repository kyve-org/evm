import KYVE from "@kyve/core";
import { version } from "../package.json";
import bundler from "./bundler";
import { server } from "@kyve/core/dist/src/registry";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

(async () => {
  const { node } = await KYVE.generate();
  node.start(bundler);
  server.listen(8080)
})();
