import { useContractWrite } from 'wagmi';
import { multivaultAbi } from '../abis/multivault';
import { MULTIVAULT_CONTRACT_ADDRESS } from '../../consts';

export function useBatchCreateAtom() {
  return useContractWrite({
    address: MULTIVAULT_CONTRACT_ADDRESS as `0x${string}`,
    abi: multivaultAbi,
    functionName: 'batchCreateAtom',
  });
} 