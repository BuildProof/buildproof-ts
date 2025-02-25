import React, { useEffect, useState } from 'react'

import { useDomainFunds } from '@lib/hooks/useDomainFunds'
import { hashDataToIPFS } from '@lib/utils/ipfs-utils'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import {
  IpfsAtomInput,
  useAtomCreation,
  type IpfsAtom,
} from '@routes/app+/submit-hackathon/hooks/useAtomCreation'
import { useHackathonForm } from '@routes/app+/submit-hackathon/hooks/useHackathonForm'
import { useIPFSStorage } from '@routes/app+/submit-hackathon/hooks/useIPFSStorage'
import { usePrizeDistribution } from '@routes/app+/submit-hackathon/hooks/usePrizeDistribution'
import { useTripleCreation } from '@routes/app+/submit-hackathon/hooks/useTripleCreation'
import type {
  Domain,
  Triple,
  TripleToCreate,
} from '@routes/app+/submit-hackathon/utils/types'
import { AdminRoute } from 'app/components/auth/admin-route'
import { ConfirmationDialog } from 'app/components/submit-hackathon/ConfirmationDialog'
import { HackathonDetailsForm } from 'app/components/submit-hackathon/HackathonDetailsForm'
import { PrizeDistributionForm } from 'app/components/submit-hackathon/PrizeDistributionForm'
import { usePublicClient } from 'wagmi'

export type LoaderData = {
  env: {
    PINATA_JWT: string | null
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const pinataJwt = import.meta.env.Vite_PINATA_JWT_KEY
  return json<LoaderData>({
    env: {
      PINATA_JWT: pinataJwt || null,
    },
  })
}

const SubmitHackathon = () => {
  const { env } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const publicClient = usePublicClient()
  const { domainFunds, isLoading: isLoadingFunds } = useDomainFunds()
  const [userAdminDomains, setUserAdminDomains] = useState<Domain[]>([])
  const [displayTriples, setDisplayTriples] = useState<Triple[]>([])
  const [triplesToCreate, setTriplesToCreate] = useState<TripleToCreate[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom hooks
  const {
    formState,
    setters,
    auth,
    handlers: { getMaxAmount, validateForm },
  } = useHackathonForm()

  const { prizes, totalPrizeAmount, addPrize, removePrize, updatePrize } =
    usePrizeDistribution(formState.totalCashPrize)

  const  storeHackathonData  = useIPFSStorage()
  const { createAtomMapping, ensureAtomsExist } = useAtomCreation()
  const { createTriples, writeBatchCreateTriple } = useTripleCreation()

  // Fetch user domains
  useEffect(() => {
    const fetchUserDomains = async () => {
      if (
        !auth.user?.wallet?.address ||
        !domainFunds ||
        domainFunds.length === 0
      )
        return

      try {
        const userAddress = auth.user.wallet.address.toLowerCase()
        const response = await fetch('http://217.154.8.211/api/users')
        const userData = await response.json()
        const userInfo = userData.find(
          (u: any) => u.address.toLowerCase() === userAddress,
        )

        if (!userInfo) return

        const adminDomainIds = userInfo.domains
          .filter((d: any) => d.roles.includes('Administration'))
          .map((d: any) => d.domainId)

        const filteredDomains = domainFunds.filter((d) =>
          adminDomainIds.includes(d.domainId),
        )
        setUserAdminDomains(filteredDomains)
      } catch (error) {
        console.error('Error fetching user domains:', error)
      }
    }

    fetchUserDomains()
  }, [auth.user, domainFunds])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Créer les triples d'affichage pour la confirmation
      const displayTriples: Triple[] = [
        {
          subject: formState.hackathonTitle,
          predicate: 'has tag',
          object: 'BuildProof test',
        },
        {
          subject: formState.hackathonTitle,
          predicate: 'starts_on',
          object: formState.startDate,
          displayValue: new Date(formState.startDate).toLocaleDateString(),
        },
        {
          subject: formState.hackathonTitle,
          predicate: 'ends_on',
          object: formState.endDate,
          displayValue: new Date(formState.endDate).toLocaleDateString(),
        },
        {
          subject: formState.hackathonTitle,
          predicate: 'total cash prize',
          object: formState.totalCashPrize,
        },
        ...prizes.map((prize) => ({
          subject: formState.hackathonTitle,
          predicate: prize.name,
          object: prize.amount,
        })),
      ]

      setDisplayTriples(displayTriples)
      setTriplesToCreate([]) // Reset triplesToCreate
      setters.setShowConfirmation(true)
    } catch (error) {
      console.error('Error preparing submission:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to prepare submission',
      )
    }
  }

  // Handle confirmation
  const handleConfirm = async () => {
    if (!auth.authenticated) {
      await auth.login()
      return
    }

    setIsSubmitting(true)
    try {
      // Créer tous les atomes nécessaires avec hashDataToIPFS
      const hackathonData: IpfsAtomInput = {
        name: formState.hackathonTitle,
        description: formState.description,
      }
      formState.image ? hackathonData.image = formState.image : ''

      // Créer tous les atomes et récupérer leurs hash IPFS
      const atomstoCreate = await Promise.all([
        // Hackathon
        storeHackathonData(hackathonData).then((ipfsHash) => ({
          ipfsHash: ipfsHash,
          role: 'hackathon',
        })),
        // Starts on (predicate)
        storeHackathonData({name: "starts_on"}).then((ipfsHash) => ({
          ipfsHash: ipfsHash,
          role: 'starts_on',
        })),
        // Start date (value)
        storeHackathonData({name: new Date(formState.startDate).toLocaleDateString()}).then((ipfsHash) => ({
          ipfsHash: ipfsHash,
          role: 'starts_on_date',
        })),
        // Ends on (predicate)
        storeHackathonData({name: "ends_on"}).then((ipfsHash) => ({
          ipfsHash: ipfsHash,
          role: 'ends_on',
        })),
        // End date (value)
        storeHackathonData({name: new Date(formState.endDate).toLocaleDateString()}).then((ipfsHash) => ({
          ipfsHash: ipfsHash,
          role: 'ends_on_date',
        })),
        // Total cash prize (predicate)
        storeHackathonData({name: "total cash prize"}).then((ipfsHash) => ({
          ipfsHash: ipfsHash,
          role: 'total_cash_prize',
        })),
        // Total cash prize amount (value)
        storeHackathonData({name: `${formState.totalCashPrize} ${formState.selectedTicker}`}).then((ipfsHash) => ({
          ipfsHash: ipfsHash,
          role: 'total_cash_prize_amount',
        })),
        // BuildProof test
        storeHackathonData({name: "BuildProof test"}).then((ipfsHash) => ({
          ipfsHash: ipfsHash,
          role: 'buildproof_test',
        })),
        // Prizes
        ...prizes
          .flatMap((prize, index) => {
            let prizeKey 
            switch (index) {
              case 0:
                prizeKey = 'first_place'
                break
              case 1:
                prizeKey = 'second_place'
                break
              case 2:
                prizeKey = 'third_place'
                break
              default:
                prizeKey = `other_place_${String.fromCharCode(97 + index - 3)}`
            }
        
            return [
              // Prize name (predicate)
              storeHackathonData({name: prize.name}).then((ipfsHash) => ({
                ipfsHash: ipfsHash,
                role: prizeKey,
              })),
              // Prize amount (value)
              storeHackathonData({name: `${prize.amount} ${formState.selectedTicker}`}).then((ipfsHash) => ({
                ipfsHash: ipfsHash,
                role: `${prizeKey}_amount`,
              })),
            ]
          })
          .flat(),
      ])

      // Créer le mapping des atomes avec leurs rôles
      const atomMapping = await createAtomMapping(atomstoCreate)

      // S'assurer que tous les atomes existent et obtenir leurs IDs
      const finalMapping = await ensureAtomsExist(atomMapping)
      // Créer les triples avec les IDs
      const triplesToCreate = await createTriples(
        Object.entries(finalMapping).reduce(
          (acc, [role, info]) => ({
            ...acc,
            [role]: info.id as bigint,
          }),
          {},
        ),
      )

      // Créer les triples en une seule transaction
      const triplesHash = await writeBatchCreateTriple(triplesToCreate)
      await publicClient?.waitForTransactionReceipt({ hash: triplesHash })

      setters.setShowConfirmation(false)
      navigate(`/hackathonDetails/${finalMapping['hackathon'].id?.toString()}`)
    } catch (error) {
      console.error('Transaction error:', error)
      alert(error instanceof Error ? error.message : 'Transaction failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (!auth.ready || !auth.authenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const maxAmount = getMaxAmount(userAdminDomains)

  return (
    <AdminRoute>
      <form onSubmit={handleSubmit} className="space-y-8">
        <HackathonDetailsForm
          formState={formState}
          setters={setters}
          userAdminDomains={userAdminDomains}
          maxAmount={maxAmount}
        />

        <PrizeDistributionForm
          prizes={prizes}
          totalCashPrize={formState.totalCashPrize}
          selectedTicker={formState.selectedTicker}
          onAddPrize={addPrize}
          onRemovePrize={removePrize}
          onUpdatePrize={updatePrize}
          onSubmit={handleSubmit}
          isValid={validateForm(totalPrizeAmount)}
        />

        <ConfirmationDialog
          open={formState.showConfirmation}
          onOpenChange={setters.setShowConfirmation}
          triples={displayTriples}
          onConfirm={handleConfirm}
          isLoading={isSubmitting}
        />
      </form>
    </AdminRoute>
  )
}

export default SubmitHackathon
