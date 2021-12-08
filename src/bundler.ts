import {BlockWithTransactions} from "@ethersproject/abstract-provider";
import {BundleFunction} from "@kyve/core/dist/src/faces";
import cliProgress from "cli-progress";
import chalk from "chalk";
import {ConfigType, Provider, sleep} from "./utils";
import {client as metricClient} from "@kyve/core/dist/src/registry";

const gauge = new metricClient.Gauge({
  name: 'current_bundle_size',
  help: 'The size of the current bundle to be validated'
})

const bundlerFunction: BundleFunction<ConfigType> = async (
  config,
  fromHeight,
  toHeight
) => {
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
      provider.safeGetBlockWithTransactions(height).then((block) => {
        bundle.push(block);
        gauge.set(bundle.length);
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

export default bundlerFunction;
