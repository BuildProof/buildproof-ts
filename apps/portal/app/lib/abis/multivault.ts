export const multivaultAbi = [
  {
    type: 'fallback',
    stateMutability: 'payable',
  },
  {
    type: 'receive',
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'SET_ADMIN',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'SET_EXIT_FEE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'atomConfig',
    inputs: [],
    outputs: [
      {
        name: 'atomWalletInitialDepositAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'atomCreationProtocolFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'atomDepositFractionAmount',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'atoms',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'atomsByHash',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'batchCreateAtom',
    inputs: [
      {
        name: 'atomUris',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'batchCreateTriple',
    inputs: [
      {
        name: 'subjectIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'predicateIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'objectIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'cancelOperation',
    inputs: [
      {
        name: 'operationId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'computeAtomWalletAddr',
    inputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'convertToAssets',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'convertToShares',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'count',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'createAtom',
    inputs: [
      {
        name: 'atomUri',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createTriple',
    inputs: [
      {
        name: 'subjectId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'predicateId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'objectId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'currentSharePrice',
    inputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deployAtomWallet',
    inputs: [
      {
        name: 'atomId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'depositAtom',
    inputs: [
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'depositTriple',
    inputs: [
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'entryFeeAmount',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'exitFeeAmount',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'generalConfig',
    inputs: [],
    outputs: [
      {
        name: 'admin',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'protocolVault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'feeDenominator',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minDeposit',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minShare',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'atomUriMaxLength',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'decimalPrecision',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minDelay',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAtomCost',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAtomWarden',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCounterIdFromTriple',
    inputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'getDepositFees',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDepositSharesAndFees',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRedeemAssetsAndFees',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTripleAtoms',
    inputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTripleCost',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVaultStateForUser',
    inputs: [
      {
        name: 'vaultId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'init',
    inputs: [
      {
        name: '_generalConfig',
        type: 'tuple',
        internalType: 'struct IEthMultiVault.GeneralConfig',
        components: [
          {
            name: 'admin',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'protocolVault',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'feeDenominator',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'minDeposit',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'minShare',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'atomUriMaxLength',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'decimalPrecision',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'minDelay',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_atomConfig',
        type: 'tuple',
        internalType: 'struct IEthMultiVault.AtomConfig',
        components: [
          {
            name: 'atomWalletInitialDepositAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'atomCreationProtocolFee',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_tripleConfig',
        type: 'tuple',
        internalType: 'struct IEthMultiVault.TripleConfig',
        components: [
          {
            name: 'tripleCreationProtocolFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'atomDepositFractionOnTripleCreation',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'atomDepositFractionForTriple',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_walletConfig',
        type: 'tuple',
        internalType: 'struct IEthMultiVault.WalletConfig',
        components: [
          {
            name: 'permit2',
            type: 'address',
            internalType: 'contract IPermit2',
          },
          {
            name: 'entryPoint',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'atomWarden',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'atomWalletBeacon',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: '_defaultVaultFees',
        type: 'tuple',
        internalType: 'struct IEthMultiVault.VaultFees',
        components: [
          {
            name: 'entryFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exitFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'protocolFee',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isTriple',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isTripleId',
    inputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'maxRedeem',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'previewDeposit',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'previewRedeem',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'protocolFeeAmount',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'redeemAtom',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'redeemTriple',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'scheduleOperation',
    inputs: [
      {
        name: 'operationId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAdmin',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAtomCreationProtocolFee',
    inputs: [
      {
        name: 'atomCreationProtocolFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAtomDepositFractionForTriple',
    inputs: [
      {
        name: 'atomDepositFractionForTriple',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAtomUriMaxLength',
    inputs: [
      {
        name: 'atomUriMaxLength',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAtomWalletInitialDepositAmount',
    inputs: [
      {
        name: 'atomWalletInitialDepositAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAtomWarden',
    inputs: [
      {
        name: 'atomWarden',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setEntryFee',
    inputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'entryFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setExitFee',
    inputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'exitFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMinDeposit',
    inputs: [
      {
        name: 'minDeposit',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMinShare',
    inputs: [
      {
        name: 'minShare',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setProtocolFee',
    inputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'protocolFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setProtocolVault',
    inputs: [
      {
        name: 'protocolVault',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTripleCreationProtocolFee',
    inputs: [
      {
        name: 'tripleCreationProtocolFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'timelocks',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'readyTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'executed',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tripleAtomShares',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tripleConfig',
    inputs: [],
    outputs: [
      {
        name: 'tripleCreationProtocolFee',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'atomDepositFractionOnTripleCreation',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'atomDepositFractionForTriple',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tripleHash',
    inputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tripleHashFromAtoms',
    inputs: [
      {
        name: 'subjectId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'predicateId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'objectId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'triples',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'triplesByHash',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'vaultFees',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'entryFee',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'exitFee',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'protocolFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'vaults',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'totalAssets',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'totalShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'walletConfig',
    inputs: [],
    outputs: [
      {
        name: 'permit2',
        type: 'address',
        internalType: 'contract IPermit2',
      },
      {
        name: 'entryPoint',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'atomWarden',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'atomWalletBeacon',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AtomCreated',
    inputs: [
      {
        name: 'creator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'atomWallet',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'atomData',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
      {
        name: 'vaultID',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Deposited',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'receiver',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'vaultBalance',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'userAssetsAfterTotalFees',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'sharesForReceiver',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'entryFee',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeesTransferred',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'protocolVault',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Paused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Redeemed',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'vaultBalance',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'assetsForReceiver',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'shares',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'exitFee',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'id',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TripleCreated',
    inputs: [
      {
        name: 'creator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'subjectId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'predicateId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'objectId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'vaultID',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Unpaused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'EnforcedPause',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExpectedPause',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_AdminOnly',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_ArraysNotSameLength',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_AtomDoesNotExist',
    inputs: [
      {
        name: 'atomId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'MultiVault_AtomExists',
    inputs: [
      {
        name: 'atomUri',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
  },
  {
    type: 'error',
    name: 'MultiVault_AtomUriTooLong',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_BurnFromZeroAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_BurnInsufficientBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_DeployAccountFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_DepositOrWithdrawZeroShares',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_HasCounterStake',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_InsufficientBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_InsufficientDepositAmountToCoverFees',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_InsufficientRemainingSharesInVault',
    inputs: [
      {
        name: 'remainingShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'MultiVault_InsufficientSharesInVault',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_InvalidExitFee',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_InvalidFeeSet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_MinimumDeposit',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_OperationAlreadyExecuted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_OperationAlreadyScheduled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_OperationNotScheduled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_ReceiveNotAllowed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_TimelockNotExpired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_TransferFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_TripleExists',
    inputs: [
      {
        name: 'subjectId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'predicateId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'objectId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'MultiVault_VaultDoesNotExist',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_VaultIsTriple',
    inputs: [
      {
        name: 'vaultId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'MultiVault_VaultNotAtom',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MultiVault_VaultNotTriple',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
]