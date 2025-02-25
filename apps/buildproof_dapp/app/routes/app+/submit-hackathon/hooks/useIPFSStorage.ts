import { useLoaderData } from '@remix-run/react'
import { hashDataToIPFS } from '@lib/utils/ipfs-utils'

import type { IpfsAtom, IpfsAtomInput } from './useAtomCreation'


export const useIPFSStorage = () => {


  const storeHackathonData = async (
    hackathonDataInput: IpfsAtomInput,
  ) => {


    const hackathonData: IpfsAtom = {
            '@context': 'https://schema.org/',
            '@type': 'Thing',
            ...hackathonDataInput,
          }

          const { ipfsHash: hackathonHash } = await hashDataToIPFS(
            hackathonData,
          )
          
          return hackathonHash
        }
      
        return storeHackathonData
        
      }
