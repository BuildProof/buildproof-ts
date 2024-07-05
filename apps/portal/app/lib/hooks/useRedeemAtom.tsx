import { type GetContractReturnType } from 'viem'

import { CURRENT_ENV } from '../utils/constants'
import { getChainEnvConfig } from '../utils/environment'
import { useContractWriteAndWait } from './useContractWriteAndWait'
import { useMultivaultContract } from './useMultivaultContract'

export const useRedeemAtom = (contract: string) => {
  const multivault = useMultivaultContract(
    contract,
    getChainEnvConfig(CURRENT_ENV).chainId,
  ) as GetContractReturnType

  return useContractWriteAndWait({
    ...multivault,
    functionName: 'redeemAtom',
  })
}