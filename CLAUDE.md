# CLAUDE.md - Sphere SDK Connect Example

Demonstration project showing how to integrate the **Sphere Connect** protocol into browser and Node.js applications. The Connect module enables dApps to interact with Sphere wallets through a transport-agnostic, permission-based RPC interface.

## Project Structure

```
sphere-sdk-connect-example/
├── browser/                    # React dApp example (Vite + Tailwind)
│   ├── src/
│   │   ├── App.tsx            # Main layout, renders connected/disconnected state
│   │   ├── main.tsx           # React entry point
│   │   ├── hooks/
│   │   │   └── useWalletConnect.ts   # Core hook: popup/iframe connect logic
│   │   └── components/
│   │       ├── ConnectButton.tsx     # "Connect Wallet" button with loading state
│   │       ├── WalletInfo.tsx        # Displays identity (nametag, addresses, pubkey)
│   │       ├── BalanceDisplay.tsx    # Asset/balance queries (auto-refresh 15s)
│   │       ├── ActionPanel.tsx       # Tabbed UI: Send / DM / Resolve
│   │       └── EventLog.tsx          # Real-time wallet event display
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── nodejs/                    # Node.js CLI example
    ├── src/
    │   ├── index.ts               # Interactive CLI client
    │   └── mock-wallet-server.ts  # Mock wallet for testing (no real Sphere needed)
    ├── package.json
    └── tsconfig.json
```

## Quick Start

### Browser dApp

```bash
cd browser
npm install
npm run dev        # Vite dev server on http://localhost:5174
```

Requires a wallet app running at `http://localhost:5173` (the Sphere wallet).

### Node.js CLI

```bash
cd nodejs
npm install

# Terminal 1: Start mock wallet server
npm run server     # WebSocket server on ws://localhost:8765

# Terminal 2: Run CLI client
npm run client     # Connects to ws://localhost:8765
```

CLI commands: `balance`, `assets`, `tokens`, `history`, `identity`, `l1`, `resolve @tag`, `send @to amt [coin]`, `dm @to message`, `disconnect`, `help`.

## Dependencies

Both subprojects use a **local** sphere-sdk link:
```json
"@unicitylabs/sphere-sdk": "file:../../sphere-sdk"
```

- **Browser:** React 19, Vite 7, Tailwind CSS 4
- **Node.js:** `ws` (WebSocket), `tsx` (TypeScript runner)

## Sphere Connect Protocol Overview

### Architecture

```
┌──────────┐                          ┌──────────────┐
│   dApp   │   ConnectClient          │    Wallet     │   ConnectHost
│          │◄─────────────────────────►│   (Sphere)   │
│          │   Transport layer:       │              │
│          │   - PostMessage (browser) │              │
│          │   - WebSocket (Node.js)  │              │
└──────────┘                          └──────────────┘
```

### Key Imports

```typescript
// Core protocol
import { ConnectClient, ConnectHost, RPC_METHODS, INTENT_ACTIONS, PERMISSION_SCOPES }
  from '@unicitylabs/sphere-sdk/connect';

// Browser transport (iframe/popup communication)
import { PostMessageTransport }
  from '@unicitylabs/sphere-sdk/connect/browser';

// Node.js transport (WebSocket)
import { WebSocketTransport }
  from '@unicitylabs/sphere-sdk/connect/nodejs';

// Types
import type { PublicIdentity, DAppMetadata, PermissionScope, ConnectResult }
  from '@unicitylabs/sphere-sdk/connect';
```

### TypeScript Path Aliases (Browser)

The browser `tsconfig.json` requires explicit path mappings for connect submodule imports:
```json
{
  "paths": {
    "@unicitylabs/sphere-sdk/connect": ["./node_modules/@unicitylabs/sphere-sdk/dist/connect/index.d.ts"],
    "@unicitylabs/sphere-sdk/connect/browser": ["./node_modules/@unicitylabs/sphere-sdk/dist/impl/browser/connect/index.d.ts"]
  }
}
```

### Operations

**Queries** (read-only, no user approval needed after initial connect):
| RPC Method | Description | Required Permission |
|-----------|-------------|---------------------|
| `sphere_getIdentity` | Wallet identity | `identity:read` |
| `sphere_getBalance` | Token balances | `balance:read` |
| `sphere_getAssets` | Asset summaries | `balance:read` |
| `sphere_getFiatBalance` | USD value | `balance:read` |
| `sphere_getTokens` | Token list | `tokens:read` |
| `sphere_getHistory` | Transaction history | `history:read` |
| `sphere_l1GetBalance` | L1 balance | `l1:read` |
| `sphere_l1GetHistory` | L1 tx history | `l1:read` |
| `sphere_resolve` | Resolve nametag/address | `resolve:peer` |
| `sphere_subscribe` | Subscribe to events | `events:subscribe` |
| `sphere_unsubscribe` | Unsubscribe | `events:subscribe` |

**Intents** (require user approval each time):
| Intent Action | Description | Required Permission |
|--------------|-------------|---------------------|
| `send` | L3 token transfer | `transfer:request` |
| `l1_send` | L1 transaction | `l1:transfer` |
| `dm` | Direct message | `dm:request` |
| `payment_request` | Payment request | `payment_request` |
| `sign_message` | Message signing | `sign:request` |

### Connection Flow

1. **dApp** opens wallet popup/iframe or WebSocket connection
2. **Wallet** signals readiness (`HOST_READY_TYPE` message for browser popup)
3. **dApp** creates `ConnectClient` with transport and calls `client.connect()`
4. **Wallet** (`ConnectHost`) calls `onConnectionRequest` callback → shows approval UI
5. User approves → session created with granted permissions
6. **dApp** uses `client.query()` for reads, `client.intent()` for actions
7. **Wallet** broadcasts events to subscribed dApps

### Browser Connection Modes

**Popup mode** (default in this example):
- Opens wallet at `WALLET_URL + '/#/connect?origin=...'`
- Waits for `HOST_READY_TYPE` message before establishing transport
- Popup close is treated as disconnection

**Iframe mode:**
- `PostMessageTransport.forClient()` targets `window.parent` automatically
- Host creates transport via `PostMessageTransport.forHost(iframe, { allowedOrigins })`

### Protocol Constants

```typescript
SPHERE_CONNECT_NAMESPACE = 'sphere-connect'
SPHERE_CONNECT_VERSION = '1.0'
HOST_READY_TYPE = 'sphere-connect:host-ready'
HOST_READY_TIMEOUT = 30_000  // ms
```

### Error Codes

| Code | Name | Description |
|------|------|-------------|
| 4001 | `NOT_CONNECTED` | No active session |
| 4002 | `PERMISSION_DENIED` | Missing permission scope |
| 4003 | `USER_REJECTED` | User denied intent |
| 4004 | `SESSION_EXPIRED` | Session TTL exceeded |
| 4005 | `ORIGIN_BLOCKED` | Origin not allowed |
| 4006 | `RATE_LIMITED` | Too many requests |
| 4100 | `INSUFFICIENT_BALANCE` | Not enough tokens |
| 4101 | `INVALID_RECIPIENT` | Bad recipient address |
| 4102 | `TRANSFER_FAILED` | Transfer error |
| 4200 | `INTENT_CANCELLED` | Intent cancelled |

## Key Implementation Details

### useWalletConnect Hook (`browser/src/hooks/useWalletConnect.ts`)

Central state management for wallet connection:
- Manages `ConnectClient` lifecycle (create → connect → disconnect → cleanup)
- Handles popup window open/close detection
- Implements `HOST_READY` handshake timeout
- Exposes: `client`, `identity`, `isConnected`, `isConnecting`, `error`, `connect()`, `disconnect()`

### Mock Wallet Server (`nodejs/src/mock-wallet-server.ts`)

Testing-only server that emulates wallet behavior:
- Creates `ConnectHost` with mock `SphereInstance`
- Auto-approves all connection requests with full permissions
- Auto-approves all intents with success responses
- Returns mock identity, assets, balance, tokens, history, L1 data

### Event Subscriptions

Subscribable events (via `client.on()`):
- `transfer:incoming` — Received tokens
- `transfer:confirmed` — Outgoing confirmed
- `transfer:failed` — Outgoing failed
- `nametag:registered` — Nametag registered
- `payment_request:incoming` — Payment request received

## Connect Module Source (in sphere-sdk)

```
sphere-sdk/connect/
├── index.ts              # Barrel exports
├── protocol.ts           # Message types, RPC methods, intents, error codes
├── permissions.ts        # Permission scopes, validation, method→scope mapping
├── types.ts              # ConnectTransport, ConnectSession, configs
├── client/
│   └── ConnectClient.ts  # dApp-side client
└── host/
    └── ConnectHost.ts    # Wallet-side host

sphere-sdk/impl/browser/connect/
└── PostMessageTransport.ts   # Browser postMessage transport

sphere-sdk/impl/nodejs/connect/
└── WebSocketTransport.ts     # WebSocket server/client transport
```

## Common Commands

```bash
# Browser
cd browser && npm run dev      # Dev server (:5174)
cd browser && npm run build    # Type-check + Vite build
cd browser && npm run preview  # Preview production build

# Node.js
cd nodejs && npm run server    # Mock wallet (ws://localhost:8765)
cd nodejs && npm run client    # CLI client
```

## Code Style

- TypeScript strict mode
- ESM modules (`"type": "module"`)
- React functional components with hooks
- Tailwind CSS for styling (browser)
- Async/await for all async operations
