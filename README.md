<p align="center">
  <a href="https://kyve.network">
    <img src="https://user-images.githubusercontent.com/62398724/137493477-63868209-a19b-4efa-9413-f06d41197d6d.png" style="border-radius: 50%" height="96">
  </a>
  <h3 align="center"><code>@kyve/evm</code></h3>
  <p align="center">✅ The official KYVE EVM integration.</p>
</p>

> Note: The whole documentation on how to run a protocol node can be found [here](https://docs.kyve.network/intro/protocol-node.html)

## How to get the evm binaries

### Requirements

Wallets

- A [Keplr](https://keplr.app) wallet with $KYVE. (You can claim some [here](https://app.kyve.network/faucet))
- An [Arweave](https://arweave.org/) keyfile with some AR. (You can claim some [here](https://faucet.arweave.net/))

Minimum hardware requirements

- 1vCPU
- 4GB RAM
- 1GB DISK

### Get the prebuilt binaries

The prebuilt binaries for every operating system can be downloaded at the [EVM repository](https://github.com/KYVENetwork/evm) under `releases`.

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
