import { useEffect, useState } from 'react';
import {
  createPublicClient,
  createWalletClient,
  getContract,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';
import './App.css';
import {
  GREETER_ABI,
  GREETER_ADDRESS,
  HARDHAT_TEST_PRIVATE_KEY,
  RPC_URL,
} from './lib/greeter';

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(RPC_URL),
});

const account = privateKeyToAccount(HARDHAT_TEST_PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: hardhat,
  transport: http(RPC_URL),
});

const greeter = getContract({
  address: GREETER_ADDRESS,
  abi: GREETER_ABI,
  client: { public: publicClient, wallet: walletClient },
});

function App() {
  const [greeting, setGreeting] = useState('');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving'>('loading');
  const [error, setError] = useState('');

  const loadGreeting = async () => {
    try {
      const value = await greeter.read.greeting();
      setGreeting(value);
      setError('');
    } catch {
      setError('Could not reach the local Hardhat node. Is it running on port 8545?');
    } finally {
      setStatus('idle');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGreeting();
  }, []);

  const saveGreeting = async () => {
    if (!input.trim()) return;
    setStatus('saving');
    try {
      const hash = await greeter.write.setGreeting([input]);
      await publicClient.waitForTransactionReceipt({ hash });
      setInput('');
      await loadGreeting();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
      setStatus('idle');
    }
  };

  return (
    <div className="page">
      <main className="card">
        <header className="card-header">
          <h1>Greeter</h1>
          <p className="subtitle">A smart contract you can talk to</p>
        </header>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <section className="greeting-display">
          <p className="label">Current greeting</p>
          <p className="greeting-value">
            {status === 'loading' ? '...' : `"${greeting}"`}
          </p>
        </section>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            saveGreeting();
          }}
        >
          <input
            className="input"
            type="text"
            placeholder="Type a new greeting..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status === 'saving'}
            aria-label="New greeting"
          />
          <button
            className="save-button"
            type="submit"
            disabled={status === 'saving' || !input.trim()}
          >
            {status === 'saving' ? 'Saving...' : 'Save'}
          </button>
        </form>

        <footer className="meta">
          <p>
            <span className="meta-label">Contract:</span>{' '}
            <code>{GREETER_ADDRESS.slice(0, 10)}...{GREETER_ADDRESS.slice(-4)}</code>
          </p>
          <p>
            <span className="meta-label">Network:</span> Hardhat localhost
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
