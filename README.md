<p align="center">
  <a href="https://kyve.network">
    <img src="https://user-images.githubusercontent.com/62398724/137493477-63868209-a19b-4efa-9413-f06d41197d6d.png" style="border-radius: 50%" height="96">
  </a>
  <h3 align="center"><code>@kyve/evm</code></h3>
  <p align="center">✅ The official KYVE EVM integration.</p>
</p>

## How to run a node

### Requirements

- Ethereum Wallet
- You need $DEV and $KYVE (You can get some for free [here](https://app.kyve.network/faucet))
- Any device with a good internet connection

### Docker

You can run the EVM integration directly from Docker.

To pull the latest Docker image, run:

```
docker pull kyve/evm:latest
```

And to start your node, run the following (don't forget to pass in [options](#options)):

```
docker run --rm --name kyve-evm-node kyve/evm:latest --pool {POOL_ADDRESS} --private-key {PRIVATE_KEY} --stake 100
```

### Prebuilt Binaries

We also provide prebuilt binaries for you to run.

We currently support Linux, MacOS, and Windows binaries - which you can download from [here](https://github.com/KYVENetwork/evm/releases).

To run a binary, all you need to do is specify your [options](#options).

### Options

#### `-p, --pool <string>`

The address of the pool you want to run on.

#### `-s, --stake <number>`

The amount of tokens you want to stake.

#### `-pk, --private-key <string>`

Your Ethereum private key that holds $KYVE.

#### `-k, --keyfile <string>` _optional_

The path to your Arweave keyfile.

#### `-n, --name <string>` _optional, default is a random name_

The identifier name of the node.

#### `-st, --send-statistics <boolean>` _optional, default is true_

Send statistics.

#### `-e, --endpoint <string>` _optional_

A custom Moonbase Alpha endpoint. [optional]

### Run on linux

```
./kyve-evm-linux --pool {POOL_ADDRESS} --private-key {PRIVATE_KEY} --stake 100
```

### Run on macos

```
./kyve-evm-macos --pool {POOL_ADDRESS} --private-key {PRIVATE_KEY} --stake 100
```

### Run on windows

```
.\kyve-evm-win.exe --pool {POOL_ADDRESS} --private-key {PRIVATE_KEY} --stake 100
```

## Verify a node is running correctly

### Uploader

When you run as an uploader you should see something like:

```
2021-10-19 11:30:11.424  INFO 🚀 Starting node ...
    Name          = bored-barriss-offee
    Address       = 0x7948b7D103f4B70645a1e6d32F7BeEC776D68008
    Pool          = 0x841b639Fc930BB2eBc820B36E9A6810758D31A63
    Desired Stake = 100 $KYVE
    Version       = v0.0.3
2021-10-19 11:30:11.429  DEBUG [Metadata] Attempting to fetch the metadata.
2021-10-19 11:30:12.224  DEBUG [Metadata] Successfully fetched the metadata.
2021-10-19 11:30:12.225  DEBUG [Settings] Attempting to fetch the settings.
2021-10-19 11:30:12.943  DEBUG [Settings] Successfully fetched the settings.
2021-10-19 11:30:12.948  DEBUG [Config] Attempting to fetch the config.
2021-10-19 11:30:13.702  DEBUG [Config] Successfully fetched the config.
2021-10-19 11:30:13.703  INFO 💻 Running node on runtime @kyve/evm.
2021-10-19 11:30:15.130  DEBUG [Stake] Attempting to stake 100 $KYVE.
2021-10-19 11:30:18.758  DEBUG [Stake] Approving 100 $KYVE to be spent. Transaction = 0x6f1b0dc91bcc245497e4c36573e3558ac12fbc958b082d3053ad76006306f8de
2021-10-19 11:33:22.406  INFO [Stake] 👍 Successfully approved.
2021-10-19 11:33:25.360  DEBUG [Stake] Staking 100 $KYVE. Transaction = 0x475239ca3023ed2420bd1ae28b5bd031424e836d4b45d065d839d036a5dc083b
2021-10-19 11:40:50.727  INFO [Stake] 📈 Successfully staked.
2021-10-19 11:40:51.495  INFO [EVM] ✅ Connection created. Endpoint = wss://api.avax.network/ext/bc/C/ws
```

### Validator

When you run as a validator you should see something like:

```
2021-10-19 11:01:00.309  INFO 🚀 Starting node ...
    Name          = thoughtful-tarfful
    Address       = 0x785f8F0283C5fb0aaC4049A070B731D3316a9D52
    Pool          = 0x841b639Fc930BB2eBc820B36E9A6810758D31A63
    Desired Stake = 100 $KYVE
    Version       = v0.0.3
2021-10-19 11:01:00.314  DEBUG [Metadata] Attempting to fetch the metadata.
2021-10-19 11:01:01.144  DEBUG [Metadata] Successfully fetched the metadata.
2021-10-19 11:01:01.144  DEBUG [Settings] Attempting to fetch the settings.
2021-10-19 11:01:01.885  DEBUG [Settings] Successfully fetched the settings.
2021-10-19 11:01:01.889  DEBUG [Config] Attempting to fetch the config.
2021-10-19 11:01:02.597  DEBUG [Config] Successfully fetched the config.
2021-10-19 11:01:02.597  INFO 💻 Running node on runtime @kyve/evm.
2021-10-19 11:01:14.020  DEBUG [Stake] Attempting to stake 100 $KYVE.
2021-10-19 11:01:17.756  DEBUG [Stake] Approving 100 $KYVE to be spent. Transaction = 0x9ea0b66587c704cbaef918271b97254646c4cb668c9bff6e6cb448606249689d
2021-10-19 11:13:55.444  INFO [Stake] 👍 Successfully approved.
2021-10-19 11:13:58.666  DEBUG [Stake] Staking 100 $KYVE. Transaction = 0xd4d1229e761ac4f0540864ecef39df6aa0920c694548a1d9e2ac8ae14b362f57
2021-10-19 11:27:43.624  INFO [Stake] 📈 Successfully staked.
2021-10-19 11:27:43.629  INFO [Validator] ✅ Connection created. Endpoint = https://api.avax.network/ext/bc/C/rpc
```
