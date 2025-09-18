const pinataJwt = import.meta.env.VITE_PINATA_JWT_KEY

export const hashDataToIPFS = async (data: any) => {
  if (!pinataJwt) {
    throw new Error('PINATA_JWT_KEY is not configured')
  }

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const formData = new FormData()
  formData.append('file', blob)

  const response = await fetch(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    },
  )

  if (!response.ok) {
    throw new Error(
      'Failed to upload to IPFS. Please check your PINATA_JWT and try again.',
    )
  }

  const ipfsResult = await response.json()

  return {
    value: data,
    ipfsHash: `ipfs://${ipfsResult.IpfsHash}`,
  }
}
