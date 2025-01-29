import { VotingPage } from '../../components/vote/VotingPage';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUser } from '@server/auth';
import { useGetTriplesWithPositionsQuery } from '@0xintuition/graphql';
import { useAccount, useBalance, usePublicClient } from 'wagmi';
import { type Address } from 'viem';
import React from 'react';
import { getColonyNetworkClient, Network } from '@colony/colony-js';
import { providers } from 'ethers';

// Constants
const TAG_PREDICATE_ID = 4; // for dev environment
const DEFAULT_PAGE_SIZE = 50;
const TOP_WEB3_TOOLING_LABEL = "Top Web3 Developer Tooling";

// Colony Network Contract Address on Arbitrum One
const COLONY_NETWORK_ADDRESS = '0x8e389bf45f926dDDB2BE3636290de42B68aefd51' as const;

// Colony Network ABI (from Arbiscan verified contract)
const COLONY_NETWORK_ABI = [
    {
        "inputs": [],
        "name": "version",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "metaColony",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "resolver",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// Colony Network Proxy ABI
const COLONY_NETWORK_PROXY_ABI = [
    {
        "inputs": [],
        "name": "implementation",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// Colony Network Implementation ABI
const COLONY_NETWORK_IMPLEMENTATION_ABI = [
    {
        "inputs": [],
        "name": "getMetaColony",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        // Ensure user is authenticated
        const user = await requireUser(request);
        console.log('User authenticated:', user.wallet?.address);

        return json({
            userAddress: user.wallet?.address,
            predicateId: TAG_PREDICATE_ID
        });
    } catch (error) {
        console.error('Error in vote loader:', error);
        throw error;
    }
}

const VotePage = () => {
    const { userAddress, predicateId } = useLoaderData<typeof loader>();
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const { data: balance } = useBalance({
        address: address as `0x${string}`,
    });

    // State pour stocker les données de Colony
    const [metaColonyAddress, setMetaColonyAddress] = React.useState<string | null>(null);
    const [networkVersion, setNetworkVersion] = React.useState<string | null>(null);

    // Fetch triples data using GraphQL
    const {
        data: triplesData,
        isLoading,
        error
    } = useGetTriplesWithPositionsQuery(
        {
            limit: DEFAULT_PAGE_SIZE,
            where: {
                _and: [
                    { predicate_id: { _eq: predicateId } },
                    { object: { label: { _eq: TOP_WEB3_TOOLING_LABEL } } }
                ]
            },
            address: userAddress!
        },
        {
            queryKey: ['get-triples-with-positions', predicateId, TOP_WEB3_TOOLING_LABEL, userAddress],
            enabled: !!userAddress && !!predicateId
        }
    );

    // Effet pour obtenir les données de Colony
    React.useEffect(() => {
        const getColonyData = async () => {
            if (!publicClient) return;
            
            try {
                // Create ethers provider from viem client
                const provider = new providers.Web3Provider(publicClient as any);
                
                // Initialize Colony Network client with Arbitrum network
                const networkClient = await getColonyNetworkClient(Network.Custom, provider, {
                    networkAddress: COLONY_NETWORK_ADDRESS
                });
                
                // Get MetaColony
                const metaColonyAddress = networkClient.address;
                console.log('MetaColony address:', metaColonyAddress);
                setMetaColonyAddress(metaColonyAddress);

                // Get network version
                const version = await networkClient.getMetaColony();
                console.log('Network version:', version);
                setNetworkVersion(version);

            } catch (error) {
                console.error('Error getting Colony data:', error);
            }
        };

        getColonyData();
    }, [publicClient]);

    // Loading state
    if (isLoading) {
        return <div className="p-4">Loading triples data...</div>;
    }

    // Error state
    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading triples: {(error as Error).message}
            </div>
        );
    }

    return (
        <div>
            {(metaColonyAddress || networkVersion) && (
                <div className="p-4 mb-4 bg-gray-100 rounded">
                    {networkVersion && <p>Network Version: {networkVersion}</p>}
                    {metaColonyAddress && <p>MetaColony Address: {metaColonyAddress}</p>}
                </div>
            )}
            <VotingPage triplesData={triplesData} userAddress={userAddress} />
        </div>
    );
};

export default VotePage; 
