export const GREETER_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

export const GREETER_ABI = [
  {
    inputs: [{ internalType: 'string', name: '_initial', type: 'string' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'string', name: 'newGreeting', type: 'string' }],
    name: 'GreetingChanged',
    type: 'event',
  },
  {
    inputs: [],
    name: 'greeting',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: '_greeting', type: 'string' }],
    name: 'setGreeting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const RPC_URL = 'http://localhost:8545';

export const HARDHAT_TEST_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const;
