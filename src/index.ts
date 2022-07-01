import { Node } from '@kyve/core';

import Arweave from '@kyve/core/dist/src/storage/Arweave';
import Gzip from '@kyve/core/dist/src/compression/Gzip';
import JsonFileCache from '@kyve/core/dist/src/cache/JsonFileCache';

import EVM from './runtime';

new Node()
  .addRuntime(new EVM())
  .addStorageProvider(new Arweave())
  .addCompression(new Gzip())
  .addCache(new JsonFileCache())
  .start();
