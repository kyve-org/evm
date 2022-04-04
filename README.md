<p align="center">
  <a href="https://kyve.network">
    <img src="https://user-images.githubusercontent.com/62398724/137493477-63868209-a19b-4efa-9413-f06d41197d6d.png" style="border-radius: 50%" height="96">
  </a>
  <h3 align="center"><code>@kyve/evm</code></h3>
  <p align="center">✅ The official KYVE EVM integration.</p>
</p>

## How to run a protocol evm node

### Requirements

Wallets

- A [Keplr](https://keplr.app) wallet with $KYVE. (You can claim some [here](https://app.kyve.network/faucet))
- An [Arweave](https://arweave.org/) keyfile with some AR. (You can claim some [here](https://faucet.arweave.net/))

Minimum hardware requirements

- 1vCPU
- 4GB RAM
- 1GB DISK

### Get some $KYVE

Before continuing, make sure that you have the [Keplr](https://keplr.app) wallet installed in your browser. Head over to the [KYVE app](https://app.kyve.network) and make sure to connect your wallet (this automatically adds and switches to the KYVE network).

Go to the faucet tab and claim some tokens via one of three faucets. The wheel is the easiest option.

### Choose a pool

Before you can run a protocol node you have to choose a pool you want to join. You can find an overview of all pools
in the KYVE app [here](https://app.kyve.network/). Once you have chosen a pool you have to remember the pool id and the
pool runtime for later. You can find this information right below the pool name once you have clicked on a pool in the overview. In this example we have chosen the first pool with the pool id `0` and the runtime `@kyve/evm`.

### Verify that you can claim a validator slot

Due to a limited number of validator slots in each pool only the nodes with the highest stake can claim
a validator slot. You can only claim a validator slot if you have **more than the minimum staking amount**.

To check the minimum staking amount you can click on the tab `Validators` once you have selected a pool. There you should see something like this:

![minimum stake](/minimum_stake.png)

In this case all validator slots are occupied, but since the minimum staking amount is 300 $KYVE you just need to have more than 300 to claim a slot. If the minimum staking amount is zero you just have to have more than zero $KYVE.

::: warning
**IMPORTANT**: Do not stake yet! Just verify that you can afford the minimum staking amount, you will stake later in this tutorial.
:::

::: warning
**IMPORTANT**: If you don't have more $KYVE than the minimum staking amount you can not continue!
:::

### Manually build the binaries

Since we want to run a protocol node on a `@kyve/evm` runtime pool we have to clone the correct repository. In our
case clone the [EVM repository](https://github.com/KYVENetwork/evm) and make sure your are on branch `main`.

```
git clone https://github.com/KYVENetwork/evm.git
cd evm
```

Now run the following commands to install dependencies and build the binaries

```
yarn install
yarn build:binaries
```

> Note: In the future we will add Docker support and release the prebuilt binaries to GitHub

### Verify that your binary has been built correctly

The step above should have created a directory called `out` with three binaries. Now execute the correct binary that matches your operating system using the following command (example is on a MacOS machine)

```
./out/evm-macos --help
```

If everything is set up correctly you should see the following

```
Usage: @kyve/evm [options]

Options:
  --name <string>           The identifier name of the node. [optional, default = auto generated]
  -p, --poolId <number>     The id of the pool you want to run on.
  -m, --mnemonic <string>   Your mnemonic of your account.
  -k, --keyfile <string>    The path to your Arweave keyfile.
  -n, --network <string>    The chain id of the network. [optional, default = beta] (default: "beta")
  -sp, --space <number>     The size of disk space in bytes the node is allowed to use. [optional, default = 1000000000 (1 GB)] (default: "1000000000")
  -b, --batchSize <number>  The batch size of fetching items from datasource. For synchronous fetching enter 1. [optional, default = 1] (default: "1")
  --metrics                 Run Prometheus metrics server. [optional, default = false] (default: false)
  -v, --verbose             Run node in verbose mode. [optional, default = false] (default: false)
  --version                 output the version number
  -h, --help                display help for command
```

### Start your node

To run your node, copy your Arweave keyfile into your working directory and fetch the mnemonic from Keplr.

Run the following command with the same binary as above

```
./out/evm-macos --poolId 0 --mnemonic "your mnemonic in here ..." --keyfile ./arweave.json --network korellia
```

If your node has started correctly, it should print some logs like this:

```
2022-04-01 08:32:27.597  INFO  🚀 Starting node ...

        Node name     = light-pink-cricket
        Address       = kyve1eka2hngntu5r2yeuyz5pd45a0fadarp3zue8gd
        Pool Id       = 0
        Cache height  = 5087
        @kyve/core    = v0.2.2
        @kyve/evm     = v0.2.0

2022-04-01 08:32:27.598  DEBUG Attempting to fetch pool state.
2022-04-01 08:32:27.724  INFO  💻 Running node on runtime @kyve/evm.
2022-04-01 08:32:27.727  INFO  ⏱  Pool version requirements met
2022-04-01 08:32:27.728  INFO  ✅ Fetched pool state
2022-04-01 08:32:27.728  DEBUG Attempting to verify node.
2022-04-01 08:32:27.728  WARN ⚠️  Node is not an active validator!
2022-04-01 08:32:27.728  WARN ⚠️  Stake $KYVE here to join as a validator: https://app.korellia.kyve.network/#/pools/0/validators - Idling ...
```

### Stake node

When you see your node idling everything is correct. Since the node has not claimed a validator slot yet your node
can not participate. In order to do that head back to the [app](https://app.kyve.network) and click on the `Validator` tab.
After that click on the button `Become a validator` and follow the instructions.

![become validator](/become_validator.png)

After you have successfully staked you should see your address in the Pool validators table.

![verify stake](/verify_stake.png)

When you look at your node logs you should then see that the node is starting to verify bundles.

```
2022-04-01 08:32:27.597  INFO  🚀 Starting node ...

        Node name     = light-pink-cricket
        Address       = kyve1eka2hngntu5r2yeuyz5pd45a0fadarp3zue8gd
        Pool Id       = 0
        Cache height  = 5087
        @kyve/core    = v0.2.2
        @kyve/evm     = v0.2.0

2022-04-01 08:32:27.598  DEBUG Attempting to fetch pool state.
2022-04-01 08:32:27.724  INFO  💻 Running node on runtime @kyve/evm.
2022-04-01 08:32:27.727  INFO  ⏱  Pool version requirements met
2022-04-01 08:32:27.728  INFO  ✅ Fetched pool state
2022-04-01 08:32:27.728  DEBUG Attempting to verify node.
2022-04-01 08:32:27.728  WARN ⚠️  Node is not an active validator!
2022-04-01 08:32:27.728  WARN ⚠️  Stake $KYVE here to join as a validator: https://app.korellia.kyve.network/#/pools/0/validators - Idling ...

2022-04-01 08:32:27.728  WARN ⚠️  Node is not an active validator!
2022-04-01 08:32:27.728  WARN ⚠️  Stake $KYVE here to join as a validator: https://app.korellia.kyve.network/#/pools/0/validators - Idling ...

2022-04-01 08:33:27.728  WARN ⚠️  Node is not an active validator!
2022-04-01 08:33:27.728  WARN ⚠️  Stake $KYVE here to join as a validator: https://app.korellia.kyve.network/#/pools/0/validators - Idling ...

2022-04-01 8:34:16.575  INFO  ⚡️ Starting new proposal
2022-04-01 8:34:17.123  INFO  🧐 Selected as VALIDATOR
2022-04-01 8:34:17.512  DEBUG Waiting for new proposal ...
```
