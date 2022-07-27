import { Node, Arweave, Gzip, JsonFileCache } from '@kyve/core';

import EVM from './runtime';

new Node()
  .addRuntime(new EVM())
  .addStorageProvider(new Arweave())
  .addCompression(new Gzip())
  .addCache(new JsonFileCache())
  .bootstrap();
