interface IpfsResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export async function uploadToIPFS(data: any, jwt: string): Promise<IpfsResponse> {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const formData = new FormData();
  formData.append('file', blob);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload to IPFS. Please check your PINATA_JWT and try again.');
  }

  return response.json();
}

export async function uploadTextToIPFS(text: string, jwt: string): Promise<IpfsResponse> {
  const blob = new Blob([text], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', blob);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload text to IPFS');
  }

  return response.json();
} 