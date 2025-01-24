import { useContractWrite } from 'wagmi';
import { multivaultAbi } from '../abis/multivault';
import { MULTIVAULT_CONTRACT_ADDRESS } from '../../consts';

export function useBatchCreateTriple() {
  const { writeAsync: writeContractAsync } = useContractWrite({
    address: MULTIVAULT_CONTRACT_ADDRESS,
    abi: multivaultAbi,
    functionName: 'batchCreateTriple'
  });

  return {
    writeContractAsync
  };
} 