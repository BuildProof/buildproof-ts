import {
  createMultiVaultContract,
  getMultivaultContract,
  publicClient,
} from '@server/viem'
import type {
  IdentityVaultDetails,
  MultivaultConfig,
  VaultDetails,
} from '@types/vault'
import { formatUnits, parseUnits, type Address } from 'viem'

interface MulticallResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any
  error?: Error
  status: 'failure' | 'success'
}

const baseVault = BigInt(0)

export async function getVaultDetails(
  contract: string,
  vid: string,
  wallet?: Address,
) {
  const multiVaultContract = createMultiVaultContract(contract)

  const coreContractConfigs = [
    {
      ...multiVaultContract,
      functionName: 'vaults',
      args: [vid],
    },
    {
      ...multiVaultContract,
      functionName: 'currentSharePrice',
      args: [vid],
    },
    {
      ...multiVaultContract,
      functionName: 'vaultFees',
      args: [0],
    },
    {
      ...multiVaultContract,
      functionName: 'generalConfig',
      args: [],
    },
    {
      ...multiVaultContract,
      functionName: 'atomConfig',
      args: [],
    },
  ]
  const coreContractConfigsLength = coreContractConfigs.length
  if (wallet) {
    coreContractConfigs.push({
      ...multiVaultContract,
      functionName: 'getVaultStateForUser',
      args: [vid, wallet],
    })
  }

  const resp: MulticallResponse[] = await publicClient.multicall({
    contracts: coreContractConfigs,
  })
  const totalAssets = resp[0].result[0] as bigint
  const formattedTotalAssets = formatUnits(totalAssets, 18)
  const totalConviction = resp[0].result[1] as bigint
  const formattedTotalConviction = formatUnits(totalConviction, 18)
  const convictionPrice = resp[1].result as bigint
  const formattedConvictionPrice = formatUnits(convictionPrice, 18)
  const entryFee = resp[2].result[0] as bigint
  const exitFee = resp[2].result[1] as bigint
  const protocolFee = resp[2].result[2] as bigint
  const admin = resp[3].result[0] as string
  const protocolVault = resp[3].result[1] as string
  const feeDenominator = resp[3].result[2] as bigint
  const minDeposit = resp[3].result[3] as bigint
  const formattedMinDeposit = formatUnits(minDeposit, 18)
  const minShare = resp[3].result[4] as bigint
  const formattedMinShare = formatUnits(minShare, 18)
  const atomCost = resp[4].result[0] as bigint
  const formattedAtomCost = formatUnits(atomCost, 18)
  const atomCreationFee = resp[4].result[1] as bigint
  const formattedAtomCreationFee = formatUnits(atomCreationFee, 18)
  const formattedProtocolFee =
    +formatUnits(protocolFee, 18) / +formatUnits(feeDenominator, 18)
  const formattedEntryFee =
    +formatUnits(entryFee, 18) / +formatUnits(feeDenominator, 18)
  const formattedExitFee =
    +formatUnits(exitFee, 18) / +formatUnits(feeDenominator, 18)

  const currentIndex = coreContractConfigsLength

  let userConviction: string = '',
    formattedUserConviction: string = '',
    userConvictionValue: string = '',
    formattedUserConvictionValue: string = ''

  if (wallet) {
    userConviction = resp[currentIndex].result[0].toString()
    formattedUserConviction = formatUnits(BigInt(userConviction), 18)
    userConvictionValue = resp[currentIndex].result[1].toString()
    formattedUserConvictionValue = formatUnits(BigInt(userConvictionValue), 18)
  }

  return {
    assets_sum: totalAssets.toString(),
    formatted_assets_sum: formattedTotalAssets,
    conviction_sum: totalConviction.toString(),
    formatted_conviction_sum: formattedTotalConviction,
    conviction_price: convictionPrice.toString(),
    formatted_conviction_price: formattedConvictionPrice,
    entry_fee: entryFee.toString(),
    formatted_entry_fee: formattedEntryFee.toString(),
    exit_fee: exitFee.toString(),
    formatted_exit_fee: formattedExitFee.toString(),
    protocol_fee: protocolFee.toString(),
    formatted_protocol_fee: formattedProtocolFee.toString(),
    admin,
    protocol_vault: protocolVault,
    fee_denominator: feeDenominator.toString(),
    min_deposit: minDeposit.toString(),
    formatted_min_deposit: formattedMinDeposit,
    min_share: minShare.toString(),
    formatted_min_share: formattedMinShare,
    atom_cost: atomCost.toString(),
    formatted_atom_cost: formattedAtomCost,
    atom_creation_fee: atomCreationFee.toString(),
    formatted_atom_creation_fee: formattedAtomCreationFee,
    ...(wallet
      ? {
          user_conviction: userConviction.toString(),
          formatted_user_conviction: formattedUserConviction,
          user_conviction_value: userConvictionValue?.toString(),
          formatted_user_conviction_value: formattedUserConvictionValue,
        }
      : {}),
  } as VaultDetails
}

export async function getIdentityListDetails(
  contract: string,
  vids: string[],
  wallet: Address,
): Promise<IdentityVaultDetails[]> {
  const multiVaultContract = createMultiVaultContract(contract)

  const identityDetailPromises = vids.map(async (vid) => {
    const coreContractConfigs = [
      {
        ...multiVaultContract,
        functionName: 'generalConfig',
        args: [],
      },
      {
        ...multiVaultContract,
        functionName: 'atomConfig',
        args: [],
      },
      {
        ...multiVaultContract,
        functionName: 'vaultFees',
        args: [0],
      },
      {
        ...multiVaultContract,
        functionName: 'vaults',
        args: [vid],
      },
      {
        ...multiVaultContract,
        functionName: 'currentSharePrice',
        args: [vid],
      },
      {
        ...multiVaultContract,
        functionName: 'getVaultBalance',
        args: [vid, wallet],
      },
    ]

    const resp: MulticallResponse[] = await publicClient.multicall({
      contracts: coreContractConfigs,
    })

    const admin = resp[0].result[0] as string
    const protocolVault = resp[0].result[1] as string
    const feeDenominator = resp[0].result[2] as bigint
    const formattetdFeeDenominator = formatUnits(feeDenominator, 18)
    const minDeposit = resp[0].result[3] as bigint
    const formattedMinDeposit = formatUnits(minDeposit, 18)
    const minShare = resp[0].result[4] as bigint
    const formattedMinShare = formatUnits(minShare, 18)
    const atomCost = resp[1].result[0] as bigint
    const formattedAtomCost = formatUnits(atomCost, 18)
    const atomCreationFee = resp[1].result[0] as bigint
    const formattedAtomCreationFee = formatUnits(atomCreationFee, 18)
    const atomEquityFee = resp[1].result[1] as bigint
    const formattedAtomEquityFee = formatUnits(atomEquityFee, 18)
    const entryFee = resp[2].result[0] as bigint
    const formattedEntryFee = formatUnits(entryFee, 18)
    const exitFee = resp[2].result[1] as bigint
    const formattedExitFee = formatUnits(exitFee, 18)
    const protocolFee = resp[2].result[2] as bigint
    const formattedProtocolFee = formatUnits(protocolFee, 18)

    const totalAssets = resp[3].result[0] as bigint
    const formattedTotalAssets = formatUnits(totalAssets, 18)
    const totalConviction = resp[3].result[1] as bigint
    const formattedTotalConviction = formatUnits(totalConviction, 18)
    const convictionPrice = resp[4].result as bigint
    const formattedConvictionPrice = formatUnits(convictionPrice, 18)
    const userConviction = resp[5].result.toString()
    const formattedUserConviction = formatUnits(userConviction, 18)
    const userConvictionValue = parseUnits(
      (+formattedUserConviction * +formattedConvictionPrice).toString(),
      18,
    ).toString()
    const formattedUserConvictionValue = formatUnits(
      BigInt(userConvictionValue),
      18,
    )

    return {
      vault_id: vid,
      assets_sum: totalAssets.toString(),
      formatted_assets_sum: formattedTotalAssets,
      conviction_sum: totalConviction.toString(),
      formatted_conviction_sum: formattedTotalConviction,
      conviction_price: convictionPrice.toString(),
      formatted_conviction_price: formattedConvictionPrice,
      user_conviction: userConviction,
      formatted_user_conviction: formattedUserConviction,
      user_conviction_value: userConvictionValue,
      formatted_user_conviction_value: formattedUserConvictionValue,

      entry_fee: entryFee.toString(),
      formatted_entry_fee: formattedEntryFee,
      exit_fee: exitFee.toString(),
      formatted_exit_fee: formattedExitFee,
      protocol_fee: protocolFee.toString(),
      formatted_protocol_fee: formattedProtocolFee,
      admin,
      protocol_vault: protocolVault,
      fee_denominator: feeDenominator.toString(),
      formatted_fee_denominator: formattetdFeeDenominator,
      min_deposit: minDeposit.toString(),
      formatted_min_deposit: formattedMinDeposit,
      min_share: minShare.toString(),
      formatted_min_share: formattedMinShare,
      atom_cost: atomCost.toString(),
      formatted_atom_cost: formattedAtomCost,
      atom_creation_fee: atomCreationFee.toString(),
      formatted_atom_creation_fee: formattedAtomCreationFee,
      atom_equity_fee: atomEquityFee.toString(),
      formatted_atom_equity_fee: formattedAtomEquityFee,
    } as IdentityVaultDetails
  })

  return Promise.all(identityDetailPromises)
}

export async function getMultiVaultConfig(contract: string) {
  const multiVaultContract = createMultiVaultContract(contract)

  const coreContractConfigs = [
    {
      ...multiVaultContract,
      functionName: 'generalConfig',
      args: [],
    },
    {
      ...multiVaultContract,
      functionName: 'vaultFees',
      args: [0],
    },
    {
      ...multiVaultContract,
      functionName: 'atomConfig',
      args: [],
    },
  ]

  const resp: MulticallResponse[] = await publicClient.multicall({
    contracts: coreContractConfigs,
  })

  const admin = resp[0].result[0] as `0x${string}`
  const protocol_vault = resp[0].result[1] as `0x${string}`
  const fee_denominator = resp[0].result[2] as bigint
  const formatted_fee_denominator = formatUnits(fee_denominator, 18)
  const min_deposit = resp[0].result[3] as bigint
  const formatted_min_deposit = formatUnits(min_deposit, 18)
  const min_share = resp[0].result[4] as bigint
  const formatted_min_share = formatUnits(min_share, 18)
  const entry_fee = resp[1].result[0] as bigint
  const formatted_entry_fee = formatUnits(entry_fee, 18)
  const exit_fee = resp[1].result[1] as bigint
  const formatted_exit_fee = formatUnits(exit_fee, 18)
  const protocol_fee = resp[1].result[2] as bigint
  const formatted_protocol_fee = formatUnits(protocol_fee, 18)
  const atom_cost = resp[2].result[0] as bigint
  const formatted_atom_cost = formatUnits(atom_cost, 18)
  const atom_creation_fee = resp[2].result[1] as bigint
  const formatted_atom_creation_fee = formatUnits(atom_creation_fee, 18)

  return {
    admin,
    protocol_vault,
    fee_denominator: fee_denominator.toString(),
    formatted_fee_denominator,
    min_deposit: min_deposit.toString(),
    formatted_min_deposit,
    min_share: min_share.toString(),
    formatted_min_share,
    entry_fee: entry_fee.toString(),
    formatted_entry_fee,
    exit_fee: exit_fee.toString(),
    formatted_exit_fee,
    protocol_fee: protocol_fee.toString(),
    formatted_protocol_fee,
    atom_cost: atom_cost.toString(),
    formatted_atom_cost,
    atom_creation_fee: atom_creation_fee.toString(),
    formatted_atom_creation_fee,
  } as MultivaultConfig
}

export async function getFees() {
  const [entryFee, exitFee, protocolFee] =
    (await getMultivaultContract.read.vaultFees([baseVault])) as [
      bigint, // entryFee
      bigint, // exitFee
      bigint, // protocolFee
    ]
  return [entryFee, exitFee, protocolFee]
}

export async function getGeneralConfig() {
  const [admin, protocolVault, feeDenominator, minDeposit, minShare] =
    (await getMultivaultContract.read.generalConfig()) as [
      string, // admin
      string, // protocolVault
      bigint, // feeDenominator
      bigint, // minDeposit
      bigint, // minShare
    ]
  return [admin, protocolVault, feeDenominator, minDeposit, minShare]
}

export async function getAtomCost() {
  const atomCost = (await getMultivaultContract.read.getAtomCost()) as bigint
  return atomCost
}