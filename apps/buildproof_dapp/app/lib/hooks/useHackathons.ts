import { useEffect, useState } from 'react'

import { configureClient, useGetTriplesQuery } from '@0xintuition/graphql_bp'
import { ipfsToHttpUrl } from '@lib/utils/pinata'

configureClient({
  apiUrl: 'https://dev.base-sepolia.intuition-api.com/v1/graphql',
})

type HackathonStatus = 'past' | 'upcoming' | 'ongoing'

interface AtomData {
  id: string
  data: string
  label?: string | null
  image?: string | null
  as_subject_triples?: Array<{
    predicate: {
      id: string
      data: string
      label: string
    }
    object: {
      id: string
      data: string
      label: string
    }
  }>
}

interface Triple {
  id: string
  subject: AtomData
  predicate: AtomData
  object: AtomData
}

export interface Hackathon {
  id: string
  title: string
  description: string
  tags: string[]
  cashPrize: string
  imgSrc: string
  startDate: string
  endDate: string
  winners?: string[]
  isLiked: boolean
  status: HackathonStatus
}

const TAG_PREDICATE_ID = 3
const TOP_WEB3_TOOLING_LABEL = 'BuildProof test'

export function useHackathons(adminAddresses: string[] = []) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [ipfsDataMap, setIpfsDataMap] = useState<Record<string, any>>({})

  const {
    data: triplesData,
    isLoading,
    error,
  } = useGetTriplesQuery({
    limit: 100,
    where: {
      _and: [
        { predicate_id: { _eq: TAG_PREDICATE_ID } },
        { object: { label: { _eq: TOP_WEB3_TOOLING_LABEL } } },
      ],
    },
    adminAddresses: adminAddresses,
  })

  useEffect(() => {
    const fetchIpfsData = async (ipfsUrl: string, atomId: string) => {
      if (ipfsUrl.startsWith('ipfs://')) {
        const ipfsHash = ipfsUrl.replace('ipfs://', '')
        const url = `https://ipfs.io/ipfs/${ipfsHash}`
        try {
          const response = await fetch(url)
          const data = await response.json()
          setIpfsDataMap((prev) => ({
            ...prev,
            [atomId]: data,
          }))
        } catch (err) {
          console.error('Error fetching IPFS data:', err)
        }
      }
    }

    if (triplesData?.triples) {
      triplesData.triples.forEach((triple) => {
        if (triple.subject?.data) {
          fetchIpfsData(triple.subject.data, triple.subject.id)
        }
      })
    }
  }, [triplesData])

  useEffect(() => {
    if (triplesData?.triples && Object.keys(ipfsDataMap).length > 0) {
      console.log('Triples reçus:', triplesData.triples)

      const newHackathons = triplesData.triples
        .map((triple) => {
          if (!triple.subject) return null

          const ipfsData = ipfsDataMap[triple.subject.id]
          if (!ipfsData) return null

          // Trouver le cash prize dans les triples du sujet
          const cashPrize =
            triple.subject.as_subject_triples?.find(
              (t) => t.predicate.label === 'total cash prize',
            )?.object.label || '0'

          // Trouver les dates dans les triples du sujet
          const startDateTriple = triple.subject.as_subject_triples?.find(
            (t) => t.predicate.label === 'starts_on',
          )
          const endDateTriple = triple.subject.as_subject_triples?.find(
            (t) => t.predicate.label === 'ends_on',
          )
          const now = new Date()
          const startDate = startDateTriple?.object.label
            ? new Date(startDateTriple.object.label)
            : now
          const endDate = endDateTriple?.object.label
            ? new Date(endDateTriple.object.label)
            : now

          const image = ipfsToHttpUrl(ipfsData.image) || triple.subject.image

          let status: HackathonStatus = 'upcoming'
          if (now > endDate) {
            status = 'past'
          } else if (now >= startDate && now <= endDate) {
            status = 'ongoing'
          }
          const hackathon: Hackathon = {
            id: triple.subject.id,
            title: triple.subject.label || 'Unnamed Hackathon',
            description: ipfsData.description || 'No description available',
            tags: [triple.object.label || ''].filter(Boolean),
            cashPrize: `$${cashPrize}`,
            imgSrc:
              image ||
              triple.subject.image ||
              'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
            startDate: startDateTriple?.object.label || 'TBA',
            endDate: endDateTriple?.object.label || 'TBA',
            status,
            isLiked: false,
          }

          return hackathon
        })
        .filter((h): h is Hackathon => h !== null)

      console.log('Hackathons filtrés final:', newHackathons)
      setHackathons(newHackathons)
    }
  }, [triplesData, ipfsDataMap, adminAddresses])

  return {
    hackathons,
    isLoading,
    error,
  }
}
