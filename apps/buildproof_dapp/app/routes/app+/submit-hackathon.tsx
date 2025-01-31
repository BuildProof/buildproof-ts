import React, { useState, useEffect } from 'react';
import { Button, ButtonVariant, ButtonSize } from '@0xintuition/buildproof_ui';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate, useLoaderData } from '@remix-run/react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { BasicInfoForm } from '../../components/submit-hackathon/BasicInfoForm';
import { DateSelection } from '../../components/submit-hackathon/DateSelection';
import { ConfirmationDialog } from '../../components/submit-hackathon/ConfirmationDialog';
import PrizeDistribution from '../../components/submit-hackathon/prize-distribution';
import type { Prize } from '../../components/submit-hackathon/prize-distribution';
import { uploadToIPFS, uploadTextToIPFS } from '../../services/ipfs';
import { multivaultAbi } from '../../lib/abis/multivault';
import { MULTIVAULT_CONTRACT_ADDRESS } from '../../consts';
import { keccak256, toHex, type Address } from 'viem';
import { PrizeSection } from '../../components/submit-hackathon/PrizeSection';

export async function loader({ request }: LoaderFunctionArgs) {
  const pinataJwt = process.env.PINATA_JWT_KEY;
  return json({
    env: {
      PINATA_JWT: pinataJwt || null
    }
  });
}

const SubmitHackathon = () => {
  const { env } = useLoaderData<typeof loader>();
  const { authenticated, ready, login } = usePrivy();
  const navigate = useNavigate();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Form state
  const [partnerName, setPartnerName] = useState('');
  const [hackathonTitle, setHackathonTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCashPrize, setTotalCashPrize] = useState(0);
  const [prizes, setPrizes] = useState<Prize[]>([
    { name: 'First Place', amount: 0, percent: 0 }
  ]);

  // UI state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [triples, setTriples] = useState<any[]>([]);

  // Add loading states
  const [isCreatingAtoms, setIsCreatingAtoms] = useState(false);
  const [isCreatingTriples, setIsCreatingTriples] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/login?redirectTo=/app/submit-hackathon');
    }
  }, [ready, authenticated, navigate]);

  // Update wallet connection check
  useEffect(() => {
    const connectWallet = async () => {
      if (authenticated && !walletClient) {
        try {
          await login();
          // Add a small delay to allow wallet connection to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Failed to connect wallet:', error);
        }
      }
    };

    connectWallet();
  }, [authenticated, walletClient, login]);

  if (!ready || !authenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const checkAtomExists = async (value: string): Promise<bigint | null> => {
    if (!publicClient) return null;
    
    try {
      const atomHash = keccak256(toHex(value));
      const atomId = await publicClient.readContract({
        address: MULTIVAULT_CONTRACT_ADDRESS as `0x${string}`,
        abi: multivaultAbi,
        functionName: 'atomsByHash',
        args: [atomHash]
      });
      return BigInt(atomId as number);
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for validation
    const atomsToCheck = [
      hackathonTitle,
      'starts_on',
      'ends_on',
      'has_prize',
      ...prizes.map(prize => prize.name)
    ];

    // Create triples to validate
    const triplesToValidate = [
      {
        subject: hackathonTitle,
        predicate: 'Total Cash Prize',
        object: totalCashPrize
      },
      {
        subject: hackathonTitle,
        predicate: 'starts_on',
        object: startDate,
        displayValue: new Date(startDate).toLocaleDateString()
      },
      {
        subject: hackathonTitle,
        predicate: 'ends_on',
        object: endDate,
        displayValue: new Date(endDate).toLocaleDateString()
      },
      ...prizes.map(prize => ({
        subject: hackathonTitle,
        predicate: 'has_prize',
        object: {
          name: prize.name,
          amount: prize.amount
        }
      }))
    ];

    setTriples(triplesToValidate);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      setIsCreatingAtoms(true);
      setIsCreatingTriples(false);

      // First ensure authentication
      if (!authenticated) {
        await login();
        // Add delay after login
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!authenticated) {
          throw new Error('Please connect your wallet first');
        }
      }

      // Then check for wallet connection
      if (!walletClient) {
        console.log('Attempting to reconnect wallet...');
        await login();
        // Add delay after login attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!walletClient) {
          throw new Error('Unable to connect to wallet. Please try again.');
        }
      }

      // Finally verify account
      if (!walletClient.account) {
        throw new Error('No wallet account selected. Please select an account in your wallet.');
      }

      if (!publicClient) {
        throw new Error('Network connection not available');
      }

      if (!env.PINATA_JWT) {
        throw new Error('PINATA_JWT is not configured. Please contact the administrator.');
      }

      // 1. Store data on IPFS
      const hackathonData = {
        title: hackathonTitle,
        description,
        partnerName,
        totalCashPrize,
        startDate,
        endDate,
        prizes: prizes.map(prize => ({
          name: prize.name,
          amount: prize.amount
        }))
      };

      const [ipfsResult, titleIpfs, descIpfs] = await Promise.all([
        uploadToIPFS(hackathonData, env.PINATA_JWT),
        uploadTextToIPFS(hackathonTitle, env.PINATA_JWT),
        uploadTextToIPFS(description, env.PINATA_JWT)
      ]);

      // 2. Create atoms for IPFS data and other necessary atoms
      const atomsToCreate = [
        titleIpfs.IpfsHash,
        descIpfs.IpfsHash,
        ipfsResult.IpfsHash,
        'starts_on',
        'ends_on',
        'has_prize',
        ...prizes.map(prize => prize.name)
      ];

      // Create missing atoms
      const missingAtoms = await Promise.all(
        atomsToCreate.map(async (value) => {
          const exists = await checkAtomExists(value);
          return exists ? null : value;
        })
      );

      const filteredMissingAtoms = missingAtoms.filter((atom): atom is string => atom !== null);
      
      if (filteredMissingAtoms.length > 0) {
        const valuePerAtom = BigInt("1000000000000000"); // 0.001 ETH per atom
        
        try {
          const { request } = await publicClient.simulateContract({
            account: walletClient.account.address,
            address: MULTIVAULT_CONTRACT_ADDRESS as Address,
            abi: multivaultAbi,
            functionName: 'batchCreateAtom',
            args: [filteredMissingAtoms.map(v => toHex(v))],
            value: valuePerAtom * BigInt(filteredMissingAtoms.length)
          });

          const hash = await walletClient.writeContract(request);
          await publicClient.waitForTransactionReceipt({ hash });
        } catch (error) {
          console.error('Error creating atoms:', error);
          throw new Error('Failed to create atoms. Please check your wallet and try again.');
        }
      }

      // Wait for atoms to be created
      let retryCount = 0;
      let allAtomsExist = false;
      let atomIds: (bigint | null)[] = [];

      while (retryCount < 3 && !allAtomsExist) {
        atomIds = await Promise.all(
          atomsToCreate.map(value => checkAtomExists(value))
        );
        
        allAtomsExist = atomIds.every(id => id !== null);
        if (!allAtomsExist) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          retryCount++;
        }
      }

      if (atomIds.some(id => id === null)) {
        throw new Error('Failed to create or retrieve required atoms. Please try again.');
      }

      setIsCreatingAtoms(false);
      setIsCreatingTriples(true);

      const [titleIpfsId, descIpfsId, dataIpfsId, startsOnId, endsOnId, hasPrizeId, ...prizeIds] = atomIds;

      // 3. Create triples
      const triplesToCreate = [
        {
          subjectId: titleIpfsId!,
          predicateId: startsOnId!,
          objectId: BigInt(new Date(startDate).getDate())
        },
        {
          subjectId: titleIpfsId!,
          predicateId: endsOnId!,
          objectId: BigInt(new Date(endDate).getDate())
        },
        ...prizes.map((prize, index) => ({
          subjectId: titleIpfsId!,
          predicateId: hasPrizeId!,
          objectId: prizeIds[index]!
        }))
      ];

      const valuePerTriple = BigInt("1000000000000000"); // 0.001 ETH per triple
      
      try {
        const { request } = await publicClient.simulateContract({
          account: walletClient.account.address,
          address: MULTIVAULT_CONTRACT_ADDRESS as Address,
          abi: multivaultAbi,
          functionName: 'batchCreateTriple',
          args: [
            triplesToCreate.map(t => t.subjectId),
            triplesToCreate.map(t => t.predicateId),
            triplesToCreate.map(t => t.objectId)
          ],
          value: valuePerTriple * BigInt(triplesToCreate.length)
        });

        const hash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash });
      } catch (error) {
        console.error('Error creating triples:', error);
        throw new Error('Failed to create triples. Please check your wallet and try again.');
      }

      setIsCreatingTriples(false);
      setShowConfirmation(false);
      window.location.href = 'http://127.0.0.1:8080/app';
    } catch (error) {
      setIsCreatingAtoms(false);
      setIsCreatingTriples(false);
      console.error('Transaction error:', error);
      
      // Update error messages
      let errorMessage = 'Transaction failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('wallet')) {
          errorMessage = `Wallet Error: ${error.message}. Please ensure your wallet is connected and try again.`;
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected. Please try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network Error: Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  const isFormValid = () => {
    const isAllFieldsFilled =
      partnerName !== '' &&
      hackathonTitle !== '' &&
      description !== '' &&
      startDate !== '' &&
      endDate !== '' &&
      totalCashPrize > 0;

    const totalPrizeAmount = prizes.reduce((total, prize) => total + (prize.amount || 0), 0);
    // Allow a small difference due to rounding
    const isTotalCorrect = Math.abs(totalPrizeAmount - totalCashPrize) <= 1;

    return isAllFieldsFilled && isTotalCorrect;
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Submit a New Hackathon</h1>
        
        <BasicInfoForm
          partnerName={partnerName}
          hackathonTitle={hackathonTitle}
          description={description}
          onPartnerNameChange={setPartnerName}
          onTitleChange={setHackathonTitle}
          onDescriptionChange={setDescription}
        />

        <DateSelection
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <PrizeSection
          totalCashPrize={totalCashPrize}
          prizes={prizes}
          onTotalCashPrizeChange={setTotalCashPrize}
          onPrizesChange={setPrizes}
        />

        <div className="flex justify-end">
        <Button
          variant={ButtonVariant.accentOutline}
          size={ButtonSize.md}
          type="submit"
          disabled={!isFormValid()}
          className="px-4 py-2"
        >
          Submit
        </Button>
      </div>
    </form>

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        triples={triples}
        onConfirm={handleConfirm}
        isLoading={isCreatingAtoms || isCreatingTriples}
        loadingText={isCreatingAtoms ? 'Creating Atoms...' : isCreatingTriples ? 'Creating Triples...' : undefined}
      />
    </>
  );
};

export default SubmitHackathon;
