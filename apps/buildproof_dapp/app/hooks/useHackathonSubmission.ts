import { usePublicClient } from 'wagmi';
import { keccak256, toHex } from 'viem';
import { multivaultAbi } from '../lib/abis/multivault';
import { MULTIVAULT_CONTRACT_ADDRESS } from '../consts';
import { useBatchCreateAtom } from './useBatchCreateAtom';
import { useBatchCreateTriple } from './useBatchCreateTriple';

export interface Triple {
  subjectId: bigint;
  predicateId: bigint;
  objectId: bigint;
}

export function useHackathonSubmission() {
  const publicClient = usePublicClient();
  const { writeContractAsync: writeBatchCreateAtom } = useBatchCreateAtom();
  const { writeContractAsync: writeBatchCreateTriple } = useBatchCreateTriple();

  const checkAtomExists = async (value: string): Promise<bigint | null> => {
    if (!publicClient) return null;
    
    try {
      const atomHash = keccak256(toHex(value));
      const atomId = await publicClient.readContract({
        address: MULTIVAULT_CONTRACT_ADDRESS,
        abi: multivaultAbi,
        functionName: 'atomsByHash',
        args: [atomHash]
      });
      return BigInt(atomId as number);
    } catch (error) {
      return null;
    }
  };

  const createMissingAtoms = async (atomValues: string[]) => {
    if (atomValues.length === 0) return null;
    
    try {
      const valuePerAtom = BigInt("1000000000000000"); // 0.001 ETH per atom
      const hash = await writeBatchCreateAtom({
        address: MULTIVAULT_CONTRACT_ADDRESS,
        abi: multivaultAbi,
        functionName: 'batchCreateAtom',
        args: [atomValues.map(v => toHex(v))],
        value: valuePerAtom * BigInt(atomValues.length)
      });
      
      return hash;
    } catch (error) {
      console.error('Error creating atoms:', error);
      throw error;
    }
  };

  const createTriples = async (triples: Triple[]) => {
    try {
      const valuePerTriple = BigInt("1000000000000000"); // 0.001 ETH per triple
      const hash = await writeBatchCreateTriple({
        address: MULTIVAULT_CONTRACT_ADDRESS,
        abi: multivaultAbi,
        functionName: 'batchCreateTriple',
        args: [
          triples.map(t => t.subjectId),
          triples.map(t => t.predicateId),
          triples.map(t => t.objectId)
        ],
        value: valuePerTriple * BigInt(triples.length)
      });

      return hash;
    } catch (error) {
      console.error('Error creating triples:', error);
      throw error;
    }
  };

  const waitForAtoms = async (atomValues: string[], maxRetries = 3): Promise<(bigint | null)[]> => {
    let retryCount = 0;
    let allAtomsExist = false;
    let atomIds: (bigint | null)[] = [];

    while (retryCount < maxRetries && !allAtomsExist) {
      atomIds = await Promise.all(
        atomValues.map(value => checkAtomExists(value))
      );
      
      allAtomsExist = atomIds.every(id => id !== null);
      if (!allAtomsExist) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        retryCount++;
      }
    }

    return atomIds;
  };

  return {
    checkAtomExists,
    createMissingAtoms,
    createTriples,
    waitForAtoms
  };
} 