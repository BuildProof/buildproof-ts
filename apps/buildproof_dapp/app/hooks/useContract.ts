import { usePublicClient, useWalletClient } from 'wagmi';
import type { Abi, Address } from 'viem';

interface ContractConfig<TAbi extends Abi> {
  abi: TAbi;
  address: Address;
  functionName: string;
}

interface ContractWriteArgs {
  args?: unknown[];
  value?: bigint;
}

export function useContract<TAbi extends Abi>(config: ContractConfig<TAbi>) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const write = async (args?: ContractWriteArgs) => {
    try {
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      const { request } = await publicClient.simulateContract({
        ...config,
        account: walletClient.account,
        args: args?.args,
        value: args?.value,
      });

      const hash = await walletClient.writeContract(request);
      
      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (error) {
      console.error('Contract write error:', error);
      throw error;
    }
  };

  return {
    write,
    isLoading: false,
    isSuccess: false,
    error: null
  };
} 