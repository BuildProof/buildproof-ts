import { Suspense, useState } from 'react'

import { ClaimPosition, Skeleton } from '@0xintuition/buildproof_ui'
import { configureClient } from '@0xintuition/graphql_bp'

import { VotingPageView } from '@components/hackathon/VotingPageHackathon'
import { RedeemStakeModal } from '@components/vote/RedeemStakeModal'
import type { SupportedCurrency, VoteItem } from '@components/vote/types'
import { useBatchDepositTriple } from '@lib/hooks/useBatchDepositTriple'
import { useHackathonTriples } from '@lib/hooks/useHackathonTriples'
import { useVerifyAttestor } from '@lib/hooks/useVerifyAttestor'
import { getChainEnvConfig } from '@lib/utils/environment'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useOutletContext, useParams } from '@remix-run/react'
import { CURRENT_ENV } from 'app/consts'
import { parseEther } from 'viem'

configureClient({
  apiUrl: 'https://dev.base-sepolia.intuition-api.com/v1/graphql',
})

export async function loader({ request }: LoaderFunctionArgs) {
  // Parent route handles authentication and common data
  return null
}

type HackathonContext = {
  userAddress: string
  atomId: number
}

export default function HackathonVotePage() {
  const { id } = useParams()
  const { userAddress } = useOutletContext<HackathonContext>()

  // États nécessaires pour VotingPageView
  const [ethAmount, setEthAmount] = useState('0.001')
  const [currency, setCurrency] = useState<SupportedCurrency>('ETH')
  const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>(
    {},
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')
  const [ethPrice, setEthPrice] = useState('0')
  const [redeemModalState, setRedeemModalState] = useState<{
    isOpen: boolean
    claimId: string
    maxStake: number
  }>({
    isOpen: false,
    claimId: '',
    maxStake: 0,
  })

  const { triplesData, loading, error } = useHackathonTriples({
    hackathonId: id,
    userAddress,
  })

  const { batchDepositTriple } = useBatchDepositTriple()
  const { verifyAndApproveAttestor } = useVerifyAttestor()

  const handleRedeemClick = (claimId: string, maxStake: number) => {
    setRedeemModalState({
      isOpen: true,
      claimId,
      maxStake,
    })
  }

  if (!id || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-16 w-[600px]" />
            <Skeleton className="h-16 w-48" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-full max-w-4xl" />
                <Skeleton className="h-12 w-48" />
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div>Error loading data</div>
  }

  // Transformer les données pour le composant
  const sortedItems =
    triplesData?.triples?.map((triple: any) => ({
      id: triple.id,
      subject: triple.subject?.label || '',
      predicate: triple.predicate?.label || '',
      object: triple.object?.label || '',
      numPositionsFor: triple.vault?.position_count || 0,
      numPositionsAgainst: triple.counter_vault?.position_count || 0,
      totalTVL: triple.vault?.total_shares || '0',
      tvlFor: triple.vault?.total_shares || '0',
      tvlAgainst: triple.counter_vault?.total_shares || '0',
      currency: currency,
      votesCount:
        (triple.vault?.position_count || 0) +
        (triple.counter_vault?.position_count || 0),
      totalEth:
        Number(triple.vault?.total_shares || '0') +
        Number(triple.counter_vault?.total_shares || '0'),
      userPosition:
        triple.vault?.positions?.[0]?.shares ||
        triple.counter_vault?.positions?.[0]?.shares,
      positionDirection: triple.vault?.positions?.[0]
        ? ClaimPosition.claimFor
        : triple.counter_vault?.positions?.[0]
          ? ClaimPosition.claimAgainst
          : undefined,
      vault: {
        current_share_price: triple.vault?.current_share_price || '0',
      },
      counter_vault: {
        current_share_price: triple.counter_vault?.current_share_price || '0',
      },
    })) || []

  const handleSubmit = async () => {
    if (!userAddress || !ethAmount || !triplesData?.triples) return

    try {
      // Vérifier et approuver l'attestor si nécessaire
      const attestorAddress = '0x64Abd54a86DfeB710eF2943d6304FC7B29f18e36'
      await verifyAndApproveAttestor()

      // Préparer les données pour le vote
      const triplesWithPercentages = triplesData.triples
        .map((triple: any) => {
          const percentage = sliderValues[triple.id] || 0
          if (percentage === 0) return null

          const amountToAdd = parseEther(
            ((Math.abs(percentage) / 100) * Number(ethAmount)).toString(),
          )

          return {
            vault_id: triple.vault_id,
            counter_vault_id: triple.counter_vault_id,
            percentage,
            amountToAdd,
          }
        })
        .filter((t): t is NonNullable<typeof t> => t !== null)

      const stakes = {
        ids: triplesWithPercentages.map((t) =>
          BigInt(t.percentage > 0 ? t.vault_id : t.counter_vault_id),
        ),
        values: triplesWithPercentages.map((t) => t.amountToAdd),
      }

      const totalValueToSend = stakes.values.reduce(
        (sum, value) => sum + value,
        0n,
      )

      if (stakes.ids.length > 0) {
        await batchDepositTriple(
          {
            receiver: userAddress as `0x${string}`,
            ids: stakes.ids,
            values: stakes.values,
            attestorAddress: attestorAddress as `0x${string}`,
          },
          { value: totalValueToSend },
        )
      }

      // Réinitialiser les sliders après le vote
      setSliderValues({})
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    }
  }

  return (
    <div className="w-full">
      <Suspense
        fallback={
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <Skeleton className="h-16 w-[600px]" />
              <Skeleton className="h-16 w-48" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-6">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-12 w-full max-w-4xl" />
                  <Skeleton className="h-12 w-48" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        }
      >
        <div
          className="voting-page-container"
          style={{ '--hide-elements': 'true' } as React.CSSProperties}
        >
          <VotingPageView
            tabs={[{ value: 'voting', label: 'Voting' }]}
            ethAmount={ethAmount}
            setEthAmount={setEthAmount}
            totalAbsoluteValue={Object.values(sliderValues).reduce(
              (sum, value) => sum + Math.abs(value),
              0,
            )}
            resetAllSliders={() => setSliderValues({})}
            sortedItems={sortedItems}
            sliderValues={sliderValues}
            resetSingleSlider={(id: string) => {
              const newValues = { ...sliderValues }
              delete newValues[id]
              setSliderValues(newValues)
            }}
            handleSliderChange={(id: string, value: number) => {
              setSliderValues({ ...sliderValues, [id]: value })
            }}
            handleSliderCommit={(id: string, value: number) => {
              setSliderValues({ ...sliderValues, [id]: value })
            }}
            canSubmit={Object.values(sliderValues).some((value) => value !== 0)}
            handleSubmit={handleSubmit}
            currentPage={currentPage}
            totalPages={Math.ceil(sortedItems.length / Number(rowsPerPage))}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            setCurrentPage={setCurrentPage}
            data={sortedItems}
            currency={currency}
            onCurrencyToggle={() =>
              setCurrency(currency === 'ETH' ? '$' : 'ETH')
            }
            setDebouncedSliderValues={setSliderValues}
            userAddress={userAddress}
            triplesData={triplesData}
            ethPrice={ethPrice}
            onRedeemClick={handleRedeemClick}
          />

          <RedeemStakeModal
            isOpen={redeemModalState.isOpen}
            onClose={() =>
              setRedeemModalState({ isOpen: false, claimId: '', maxStake: 0 })
            }
            claimId={redeemModalState.claimId}
            maxStake={redeemModalState.maxStake}
            contractAddress={getChainEnvConfig(CURRENT_ENV).contractAddress}
            userAddress={userAddress}
            totalShares={
              triplesData?.triples.find(
                (t) =>
                  t.vault_id === redeemModalState.claimId ||
                  t.counter_vault_id === redeemModalState.claimId,
              )?.vault?.positions?.[0]?.shares ||
              triplesData?.triples.find(
                (t) =>
                  t.vault_id === redeemModalState.claimId ||
                  t.counter_vault_id === redeemModalState.claimId,
              )?.counter_vault?.positions?.[0]?.shares ||
              '0'
            }
          />
        </div>
      </Suspense>
    </div>
  )
}
