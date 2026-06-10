# ⛓️ ChainTodo — Decentralized Todo List

A full-stack Web3 application that lets every user manage their own tasks permanently on the **Kasplex Testnet** blockchain.

---

## 🧱 Smart Contract

**File:** `contracts/TodoList.sol`  
**Solidity:** `^0.8.20`  
**License:** MIT

### Features Implemented

| Feature | Status |
|---|---|
| Add task (content, priority, category) | ✅ Core |
| Toggle complete / incomplete | ✅ Core |
| View all tasks | ✅ Core |
| View individual task by ID | ✅ Core |
| Soft-delete tasks | ✅ Bonus |
| Edit task description | ✅ Bonus |
| Priority levels (Low / Medium / High) | ✅ Bonus |
| Filter by completion status | ✅ Bonus |
| Category / tags | ✅ Bonus |
| Events for all actions | ✅ |
| Per-user isolated storage | ✅ |

### Task Structure (Solidity)

```solidity
struct Task {
    uint256  id;         // Auto-incremented unique ID (per user)
    string   content;    // Task description
    bool     completed;  // Completion flag
    bool     deleted;    // Soft-delete flag
    Priority priority;   // LOW(0) | MEDIUM(1) | HIGH(2)
    string   category;   // Free-text tag (e.g. "Work")
    uint256  createdAt;  // Block timestamp on creation
    uint256  updatedAt;  // Block timestamp on last update
}
```

### Public Functions

| Function | Type | Description |
|---|---|---|
| `createTask(content, priority, category)` | write | Creates a new task |
| `toggleTask(taskId)` | write | Toggles completion status |
| `editTask(taskId, newContent)` | write | Updates task description |
| `updatePriority(taskId, newPriority)` | write | Changes priority level |
| `deleteTask(taskId)` | write | Soft-deletes the task |
| `getAllTasks()` | view | Returns all non-deleted tasks |
| `getTask(taskId)` | view | Returns a single task |
| `getCompletedTasks()` | view | Returns only completed tasks |
| `getPendingTasks()` | view | Returns only incomplete tasks |
| `getTasksByCategory(category)` | view | Filter tasks by category |
| `getTaskCount()` | view | Total tasks created (including deleted) |

---

## 🚀 Deploy on Remix

1. Open [remix.ethereum.org](https://remix.ethereum.org)
2. Create `contracts/TodoList.sol` and paste the contract code
3. Compile with Solidity `0.8.20` and optimizer enabled (200 runs)
4. In **Deploy & Run Transactions**:
   - Environment: **Injected Provider - MetaMask**
   - Make sure MetaMask is on **Kasplex Testnet**
5. Click **Deploy** and confirm in MetaMask
6. Copy the deployed contract address

---

## 🔧 Frontend Setup

### 1. Update the contract address

Edit `src/lib/contract.ts`:

```ts
export const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS_HERE' as `0x${string}`
```

### 2. Add Kasplex Testnet to MetaMask

| Field | Value |
|---|---|
| Network Name | Kasplex Testnet |
| RPC URL | https://rpc.kasplextest.xyz |
| Chain ID | 1212120 |
| Currency Symbol | KAS |
| Block Explorer | https://explorer.kasplextest.xyz |

### 3. Install & Run

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000`

---

## 🎨 Frontend Stack

- **Framework:** Next.js 15 (App Router)
- **Blockchain:** Wagmi v2 + Viem
- **Wallet:** MetaMask (injected connector)
- **Styling:** Vanilla CSS (dark theme, glassmorphism)

### UI Features

- 🦊 MetaMask connect / disconnect
- ➕ Add tasks with priority and category
- ✅ Toggle tasks complete / incomplete
- ✏️ Inline edit task descriptions
- 🗑️ Delete tasks
- 🔍 Filter: All / Pending / Completed
- 📊 Live stats (total, done, pending)
- ⚠️ Wrong network detection + auto-switch
- 🔄 Transaction status feedback (pending → confirmed)

---

## 📋 Assumptions

- Each user's tasks are isolated by their wallet address — users cannot see or modify each other's tasks.
- Task IDs are per-user and start from 1.
- Deleted tasks are soft-deleted (not removed from chain storage); their IDs are permanently retired.
- The Kasplex Testnet RPC (`https://rpc.kasplextest.xyz`) is assumed to be publicly accessible — update if needed.

---

## 📁 Project Structure

```
.
├── contracts/
│   └── TodoList.sol          # Solidity smart contract
├── src/
│   ├── app/
│   │   ├── globals.css       # Premium dark theme
│   │   ├── layout.tsx        # Root layout with wagmi providers
│   │   ├── page.tsx          # Main Todo UI
│   │   └── providers.tsx     # Wagmi + React Query providers
│   ├── lib/
│   │   └── contract.ts       # ABI + contract address
│   └── wagmi.ts              # Chain config (Kasplex Testnet)
└── README.md
```
