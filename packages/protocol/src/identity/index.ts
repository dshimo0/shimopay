import { getAddress, isAddress } from 'ethers';
export function createDid(chainId: number, address: string): string {
  if (!Number.isSafeInteger(chainId) || chainId <= 0) throw new Error('Invalid chain');
  return `did:pkh:eip155:${chainId}:${getAddress(address)}`;
}
export function parseDid(did: string) {
  const match = /^did:pkh:eip155:([1-9][0-9]*):(0x[0-9a-fA-F]{40})$/.exec(did);
  if (!match || !isAddress(match[2]) || !Number.isSafeInteger(Number(match[1]))) throw new Error('Invalid DID');
  return { namespace: 'eip155', chainId: Number(match[1]), address: getAddress(match[2]) };
}
export function validateDid(did: string) { try { parseDid(did); return true; } catch { return false; } }
export function didToAddress(did: string) { return parseDid(did).address; }
