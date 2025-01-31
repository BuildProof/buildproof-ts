import { useState, useMemo, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import {
    ClaimRow,
    Claim,
    SegmentedControl,
    SegmentedControlItem,
    EmptyStateCard,
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    PaginationSummary,
    PaginationRowSelection,
    PaginationPageCounter,
    PaginationFirst,
    PaginationLast,
    ClaimPosition,
    MultiSlider,
    cn,
    Button,
    Input,
    CurrencyType,
    Switch
} from '@0xintuition/buildproof_ui';
import { handleSliderChange, resetSingleSlider, resetAllSliders } from './handleSliderChange';
import { sortItems } from './sortItems';
import type { VoteItem, SupportedCurrency } from './types';
import { VotingPageView } from './VotingPageView';
import type { GetTriplesWithPositionsQuery } from '@0xintuition/graphql';
import { useBatchDepositTriple } from '../../lib/hooks/useBatchDepositTriple'
import { calculateStakes } from '../../lib/utils/calculateStakes'
import { parseEther } from 'viem'
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface VotingPageProps {
    triplesData: GetTriplesWithPositionsQuery | undefined;
    userAddress: string | undefined;
}

interface EthPriceResponse {
    price: string;
}

export const VotingPage = ({ triplesData, userAddress }: VotingPageProps) => {
    const [selectedTab, setSelectedTab] = useState('voting');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currency, setCurrency] = useState<SupportedCurrency>('ETH');
    const [ethAmount, setEthAmount] = useState('0.001');
    const [displayAmount, setDisplayAmount] = useState('0.001');
    const [ethPrice, setEthPrice] = useState('0');

    // État pour les valeurs des sliders
    const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>({});
    const [debouncedSliderValues, setDebouncedSliderValues] = useState<{ [key: string]: number }>({});
    const [sortedItemIds, setSortedItemIds] = useState<string[]>([]);
    
    // Create a subject for slider changes
    const sliderSubject = useRef(new Subject<{ id: string; value: number }>());

    // Fetch ETH price
    const ethPriceFetcher = useFetcher<EthPriceResponse>();
    
    useEffect(() => {
        // Initial fetch only
        ethPriceFetcher.load('/resources/eth-price');
    }, []);

    useEffect(() => {
        if (ethPriceFetcher.data?.price) {
            setEthPrice(ethPriceFetcher.data.price);
        }
    }, [ethPriceFetcher.data]);

    const convertValue = (value: string, fromCurrency: SupportedCurrency, toCurrency: SupportedCurrency): string => {
        if (fromCurrency === toCurrency) return value;
        const numValue = Number(value);
        if (isNaN(numValue)) return '0';
        
        if (fromCurrency === 'ETH' && toCurrency === 'USDC') {
            return (numValue * Number(ethPrice)).toString();
        } else {
            return (numValue / Number(ethPrice)).toString();
        }
    };

    // Transform the GraphQL data into our VoteItem format
    const data: VoteItem[] = useMemo(() => {
        if (!triplesData?.triples) return [];
        
        return triplesData.triples.map((triple: any) => {
            const userVaultPosition = triple.vault?.positions?.[0];
            const userCounterVaultPosition = triple.counter_vault?.positions?.[0];
            
            const totalShares = (Number(triple.vault?.total_shares ?? 0) + Number(triple.counter_vault?.total_shares ?? 0)).toString();
            const vaultShares = triple.vault?.total_shares ?? '0';
            const counterVaultShares = triple.counter_vault?.total_shares ?? '0';

            return {
                id: triple.id,
                numPositionsFor: triple.vault?.position_count ?? 0,
                numPositionsAgainst: triple.counter_vault?.position_count ?? 0,
                totalTVL: convertValue(totalShares, 'ETH', currency),
                tvlFor: convertValue(vaultShares, 'ETH', currency),
                tvlAgainst: convertValue(counterVaultShares, 'ETH', currency),
                currency: currency,
                subject: triple.subject?.label ?? '',
                predicate: triple.predicate?.label ?? '',
                object: triple.object?.label ?? '',
                votesCount: (triple.vault?.position_count ?? 0) + (triple.counter_vault?.position_count ?? 0),
                totalEth: Number(triple.vault?.total_shares ?? 0) + Number(triple.counter_vault?.total_shares ?? 0),
                userPosition: userVaultPosition?.shares ?? userCounterVaultPosition?.shares ?? undefined,
                positionDirection: userVaultPosition ? ClaimPosition.claimFor :
                    userCounterVaultPosition ? ClaimPosition.claimAgainst :
                        undefined
            };
        });
    }, [triplesData, currency, ethPrice]);

    // Set up the subscription when the component mounts
    useEffect(() => {
        const subscription = sliderSubject.current.pipe(
            distinctUntilChanged((prev, curr) => 
                prev.id === curr.id && prev.value === curr.value
            )
        ).subscribe(({ id, value }) => {
            setDebouncedSliderValues(prev => ({
                ...prev,
                [id]: value
            }));
        });

        return () => subscription.unsubscribe();
    }, []);

    // Effect to sort items when debounced values change
    useEffect(() => {
        const sortedItems = sortItems(data, debouncedSliderValues);
        const sortedIds = sortedItems.map(item => item.id);
        setSortedItemIds(sortedIds);
    }, [debouncedSliderValues, data]);

    // Use sorted IDs to maintain order
    const sortedItems = useMemo(() => {
        return sortedItemIds.map(id => data.find(item => item.id === id)).filter(Boolean) as VoteItem[];
    }, [data, sortedItemIds]);

    // Appliquer la pagination sur les données triées
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return sortedItems.slice(startIndex, endIndex);
    }, [sortedItems, currentPage, rowsPerPage]);

    // Calculer le nombre total de pages basé sur les items triés
    const totalPages = useMemo(() => Math.ceil(sortedItems.length / rowsPerPage), [sortedItems.length, rowsPerPage]);

    const tabs = [
        { value: 'overview', label: 'Overview' },
        { value: 'voting', label: 'Voting' },
        { value: 'results', label: 'Results' },
    ];

    const { batchDepositTriple, isPending } = useBatchDepositTriple();

    // Update display amount when currency changes
    useEffect(() => {
        setDisplayAmount(convertValue(ethAmount, 'ETH', currency));
    }, [currency, ethAmount]);

    // Handle input amount change
    const handleAmountChange = (value: string) => {
        if (currency === 'ETH') {
            setEthAmount(value);
            setDisplayAmount(value);
        } else {
            setDisplayAmount(value);
            setEthAmount(convertValue(value, 'USDC', 'ETH'));
        }
    };

    // Calculate total based on immediate values for UI feedback
    const totalAbsoluteValue = useMemo(() => {
        return Object.values(sliderValues).reduce((sum, value) => sum + Math.abs(value), 0);
    }, [sliderValues]);

    // Check if total is exactly 100
    const canSubmit = totalAbsoluteValue === 100;

    const toggleCurrency = () => {
        setCurrency(prev => {
            const newCurrency = prev === 'ETH' ? 'USDC' : 'ETH';
            setDisplayAmount(convertValue(ethAmount, 'ETH', newCurrency));
            return newCurrency;
        });
    };

    // Handle submit function
    const handleSubmit = async () => {
        if (!userAddress || !ethAmount || !triplesData?.triples) return

        try {
            const totalStakeWei = parseEther(ethAmount)
            
            // Transform triples to include percentage from sliderValues
            const triplesWithPercentages = triplesData.triples.map(triple => ({
                id: triple.id,
                vault_id: triple.vault_id,
                counter_vault_id: triple.counter_vault_id,
                percentage: sliderValues[triple.id] || 0
            }))

            const stakes = calculateStakes(triplesWithPercentages, totalStakeWei)

            // Use hardcoded attestor address
            const attestorAddress = "0x64Abd54a86DfeB710eF2943d6304FC7B29f18e36"

            // Submit all stakes in one transaction
            if (stakes.ids.length > 0) {
                await batchDepositTriple(
                    {
                        receiver: userAddress as `0x${string}`,
                        ids: stakes.ids,
                        values: stakes.values,
                        attestorAddress: attestorAddress as `0x${string}`
                    },
                    { value: totalStakeWei }
                )
            }

            // Handle success (e.g., show notification, reset form, etc.)
        } catch (error) {
            console.error('Error submitting stakes:', error)
            // Handle error (e.g., show error notification)
        }
    };

    // Handle slider changes - now split into two functions
    const handleSliderChange = (id: string, value: number) => {
        // Update only the immediate UI feedback
        setSliderValues(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Handle slider release or input blur
    const handleSliderCommit = (id: string, value: number) => {
        // Push the final value to the subject
        sliderSubject.current.next({ id, value });
    };

    // Reset functions should update both immediate and debounced values
    const resetAllSliders = () => {
        setSliderValues({});
        setDebouncedSliderValues({});
    };

    const resetSingleSlider = (id: string) => {
        setSliderValues(prev => {
            const newValues = { ...prev };
            delete newValues[id];
            return newValues;
        });
        setDebouncedSliderValues(prev => {
            const newValues = { ...prev };
            delete newValues[id];
            return newValues;
        });
    };

    return (
        <VotingPageView
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            tabs={tabs}
            ethAmount={displayAmount}
            setEthAmount={handleAmountChange}
            totalAbsoluteValue={totalAbsoluteValue}
            resetAllSliders={resetAllSliders}
            sortedItems={paginatedItems}
            sliderValues={sliderValues}
            resetSingleSlider={resetSingleSlider}
            handleSliderChange={handleSliderChange}
            handleSliderCommit={handleSliderCommit}
            canSubmit={canSubmit}
            handleSubmit={handleSubmit}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage.toString()}
            setRowsPerPage={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
            }}
            setCurrentPage={setCurrentPage}
            data={sortedItems}
            currency={currency}
            onCurrencyToggle={toggleCurrency}
        />
    );
}; 