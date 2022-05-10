import { providers } from 'ethers';
import { Network, Signature } from './types';

export async function fetchBlock(
  endpoint: string,
  height: number,
  signature: Signature,
  network?: Network
): Promise<any> {
  const provider = new providers.StaticJsonRpcProvider(
    {
      url: endpoint,
      headers: {
        'Content-Type': 'application/json',
        Signature: signature.signature,
        'Public-Key': signature.pubKey,
        'Pool-ID': signature.poolId,
        Timestamp: signature.timestamp,
      },
    },
    network
  );

  const block = await provider.getBlockWithTransactions(height);

  // The block is always defined, unless the height is out of range.
  if (block) {
    // Delete the number of confirmations from a transaction to maintain determinism.
    block.transactions.forEach(
      (tx: Partial<providers.TransactionResponse>) => delete tx.confirmations
    );
  }

  return block;
}
