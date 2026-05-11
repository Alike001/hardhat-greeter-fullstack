# hardhat-greeter-fullstack

A full-stack **decentralized app** — a Solidity smart contract on a local Ethereum blockchain, a React frontend that reads and writes to it, all wired together with Docker Compose. **One command brings up the whole stack.**

```bash
git clone https://github.com/Alike001/hardhat-greeter-fullstack.git
cd hardhat-greeter-fullstack
docker compose up --build
```

Then open [localhost:8080](http://localhost:8080).

You need [Docker](https://docs.docker.com/get-docker/) installed. That's it — no Node.js, no Solidity compiler, no manual setup.

---

## What this is

A minimal but real **dApp** (decentralized app). The smart contract stores a greeting on-chain. The frontend reads it, lets you change it, and writes the new value back as a real blockchain transaction.

Same shape as a typical web app — UI talks to a backend, backend talks to a database — but the "backend" is a smart contract running on Ethereum and the "database" is the blockchain itself.

## Stack

| Layer | Technology |
| ----- | ---------- |
| Smart contract | Solidity 0.8.28 |
| Contract framework | Hardhat 3 (Ignition, viem, ESM) |
| Local blockchain | Hardhat Node (in-process Ethereum simulator) |
| Frontend | React 19 + Vite + TypeScript |
| Web3 client | viem |
| Orchestration | Docker + Docker Compose (3 services, healthchecks, one-shot deploy) |

## How it works

```
┌───────────────┐      reads/writes      ┌─────────────────┐
│  React UI     │ ─────── viem ───────►  │  Hardhat Node   │
│  (nginx :8080)│ ◄────  responses ───── │  (chain :8545)  │
└───────────────┘                        └─────────────────┘
                                                  ▲
                                                  │ deploys to
                                                  │
                                         ┌─────────────────┐
                                         │  Deploy step    │
                                         │  (one-shot)     │
                                         └─────────────────┘
```

Three Docker Compose services with sequencing:

1. **`chain`** — long-running Hardhat node, exposes JSON-RPC on `:8545`. Has a healthcheck so other services can wait until it's truly accepting connections.
2. **`deploy`** — one-shot container. Waits until `chain` is healthy, then runs `hardhat ignition deploy` to put `Greeter.sol` on-chain. Exits with code 0 when done.
3. **`frontend`** — React app served by nginx on `:8080`. Waits until `deploy` has *completed successfully* before starting, so the UI never loads before the contract exists.

## Project structure

```
hardhat-greeter-fullstack/
├── contracts-backend/
│   ├── contracts/
│   │   └── Greeter.sol         # The smart contract
│   ├── ignition/modules/
│   │   └── Greeter.ts          # Ignition deploy module
│   ├── hardhat.config.ts       # Networks: hardhat, sepolia, docker
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Reads/writes greeting via viem
│   │   └── lib/greeter.ts      # ABI + contract address + RPC config
│   ├── Dockerfile              # Multi-stage: Node build → nginx serve
│   └── .dockerignore
└── docker-compose.yml          # Orchestrates the three services
```

## The contract

```solidity
contract Greeter {
    string public greeting;
    event GreetingChanged(string newGreeting);

    constructor(string memory _initial) {
        greeting = _initial;
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
        emit GreetingChanged(_greeting);
    }
}
```

Deployed with an initial greeting of `"Hello, world!"`. Anyone with an account on the local chain can call `setGreeting` to change it — the new value lives on-chain.

## Running it without Docker

If you want to develop locally, three terminals:

```bash
# Terminal 1 — start the chain
cd contracts-backend
npx hardhat node

# Terminal 2 — deploy the contract
cd contracts-backend
npx hardhat ignition deploy ignition/modules/Greeter.ts --network localhost

# Terminal 3 — run the frontend
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## A note on the chain

The local Hardhat node is **ephemeral** — every time the chain container restarts, the blockchain resets. Greetings you write get wiped. This is the right behavior for local development. Production deploys (Sepolia, mainnet) persist permanently.
