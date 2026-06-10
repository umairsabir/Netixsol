'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { CONTRACT_ADDRESS, TODO_ABI, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/contract'
import { sepoliaTestnet } from '@/wagmi'

// ─── Types ─────────────────────────────────────────────────────────────────

type Filter = 'all' | 'pending' | 'completed'
type Priority = 0 | 1 | 2

interface Task {
  id:        bigint
  content:   string
  completed: boolean
  deleted:   boolean
  priority:  number
  category:  string
  createdAt: bigint
  updatedAt: bigint
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(ts: bigint): string {
  return new Date(Number(ts) * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function priorityClass(p: number): string {
  return ['low', 'medium', 'high'][p] ?? 'low'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
  isPending,
}: {
  task: Task
  onToggle: (id: bigint) => void
  onDelete: (id: bigint) => void
  onEdit:   (id: bigint, content: string) => void
  isPending: boolean
}) {
  const [editing, setEditing]   = useState(false)
  const [editVal, setEditVal]   = useState(task.content)

  const handleSave = () => {
    if (editVal.trim() && editVal !== task.content) {
      onEdit(task.id, editVal.trim())
    }
    setEditing(false)
  }

  return (
    <div className={`task-item${task.completed ? ' completed' : ''}`}>
      {/* Checkbox */}
      <button
        id={`toggle-task-${task.id}`}
        className="checkbox-btn"
        onClick={() => onToggle(task.id)}
        disabled={isPending}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && '✓'}
      </button>

      {/* Body */}
      <div className="task-body">
        {editing ? (
          <>
            <input
              id={`edit-input-${task.id}`}
              className="edit-input"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') setEditing(false)
              }}
              autoFocus
            />
            <div className="edit-actions">
              <button id={`save-edit-${task.id}`} className="btn-save" onClick={handleSave}>Save</button>
              <button id={`cancel-edit-${task.id}`} className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <div className="task-content">{task.content}</div>
        )}

        <div className="task-meta">
          {/* Priority badge */}
          <span className={`priority-badge ${priorityClass(task.priority)}`}>
            {task.priority === 2 ? '🔴' : task.priority === 1 ? '🟡' : '🟢'}
            {' '}{PRIORITY_LABELS[task.priority]}
          </span>

          {/* Category */}
          {task.category && (
            <span className="category-tag">🏷️ {task.category}</span>
          )}

          {/* Timestamp */}
          <span className="task-time">{formatDate(task.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="task-actions">
        {!task.completed && (
          <button
            id={`edit-task-${task.id}`}
            className="action-btn"
            onClick={() => setEditing(true)}
            title="Edit task"
          >
            ✏️
          </button>
        )}
        <button
          id={`delete-task-${task.id}`}
          className="action-btn delete"
          onClick={() => onDelete(task.id)}
          disabled={isPending}
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { address, isConnected, chain } = useAccount()
  const { connect }    = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const [content,  setContent]  = useState('')
  const [priority, setPriority] = useState<Priority>(1)
  const [category, setCategory] = useState('')
  const [filter,   setFilter]   = useState<Filter>('all')
  const [txMsg,    setTxMsg]     = useState<{ type: 'pending'|'success'|'error'; text: string } | null>(null)

  // ── Contract reads ──────────────────────────────────────────────────────
  // The updated contract accepts `owner` as an explicit argument (no msg.sender).
  // This works on any RPC regardless of whether `from` is propagated in eth_call.
  const { data: allTasks = [], refetch } = useReadContract({
    address:      CONTRACT_ADDRESS,
    abi:          TODO_ABI,
    functionName: 'getAllTasks',
    args:         [address!],                  // ← pass wallet address as argument
    query:        { enabled: isConnected && !!address },
  }) as { data: Task[]; refetch: () => void }

  // ── Contract writes ─────────────────────────────────────────────────────
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // ✅ Refetch task list once the transaction is confirmed.
  // Must be inside useEffect — calling refetch() in the render body is a no-op.
  // The 3s delay lets the RPC node index the new chain state before we query.
  useEffect(() => {
    if (!txSuccess) return
    const timer = setTimeout(() => {
      refetch()
      setTxMsg({ type: 'success', text: 'Transaction confirmed ✓' })
      setTimeout(() => setTxMsg(null), 3000)
    }, 3000)
    return () => clearTimeout(timer)
  }, [txSuccess, refetch])

  const isBusy = isWritePending || isConfirming

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAdd = useCallback(() => {
    if (!content.trim()) return
    setTxMsg({ type: 'pending', text: 'Waiting for wallet confirmation…' })
    writeContract(
      {
        address:      CONTRACT_ADDRESS,
        abi:          TODO_ABI,
        functionName: 'createTask',
        args:         [content.trim(), priority, category.trim()],
      },
      {
        onSuccess: () => {
          setContent(''); setCategory(''); setPriority(1)
          setTxMsg({ type: 'pending', text: 'Transaction submitted, waiting for block…' })
        },
        onError: (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
      },
    )
  }, [content, priority, category, writeContract])

  const handleToggle = useCallback((id: bigint) => {
    setTxMsg({ type: 'pending', text: 'Updating task…' })
    writeContract(
      { address: CONTRACT_ADDRESS, abi: TODO_ABI, functionName: 'toggleTask', args: [id] },
      {
        onSuccess: () => setTxMsg({ type: 'pending', text: 'Transaction submitted…' }),
        onError:   (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
      },
    )
  }, [writeContract])

  const handleDelete = useCallback((id: bigint) => {
    setTxMsg({ type: 'pending', text: 'Deleting task…' })
    writeContract(
      { address: CONTRACT_ADDRESS, abi: TODO_ABI, functionName: 'deleteTask', args: [id] },
      {
        onSuccess: () => setTxMsg({ type: 'pending', text: 'Transaction submitted…' }),
        onError:   (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
      },
    )
  }, [writeContract])

  const handleEdit = useCallback((id: bigint, newContent: string) => {
    setTxMsg({ type: 'pending', text: 'Saving changes…' })
    writeContract(
      { address: CONTRACT_ADDRESS, abi: TODO_ABI, functionName: 'editTask', args: [id, newContent] },
      {
        onSuccess: () => setTxMsg({ type: 'pending', text: 'Transaction submitted…' }),
        onError:   (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
      },
    )
  }, [writeContract])

  // ── Derived values ───────────────────────────────────────────────────────

  const tasks = (allTasks as Task[]).filter(t => !t.deleted)

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.completed
    if (filter === 'pending')   return !t.completed
    return true
  })

  const completedCount = tasks.filter(t =>  t.completed).length
  const pendingCount   = tasks.filter(t => !t.completed).length

  const isWrongNetwork = isConnected && chain?.id !== sepoliaTestnet.id

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="app-root">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            <div className="navbar-brand">
              <div className="brand-icon">⛓️</div>
              <span className="brand-name">ChainTode</span>
            </div>

            {isConnected ? (
              <button
                id="disconnect-wallet-btn"
                className="btn-connect connected"
                onClick={() => disconnect()}
              >
                <span className="dot" />
                {shortenAddress(address!)}
              </button>
            ) : (
              <button
                id="connect-wallet-btn"
                className="btn-connect"
                onClick={() => connect({ connector: injected() })}
              >
                🦊 Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main>
        <div className="container">
          {/* ── Hero ── */}
          <section className="hero">
            <div className="hero-tag">⛓️ On-Chain &nbsp;·&nbsp; Kasplex Testnet</div>
            <h1>Your Tasks,<br />On the Blockchain</h1>
            <p>Manage tasks immutably with a Solidity smart contract. No central server, no middleman.</p>

            {isConnected && (
              <div className="stats-row">
                <div className="stat">
                  <div className="stat-value">{tasks.length}</div>
                  <div className="stat-label">Total</div>
                </div>
                <div className="stats-divider" />
                <div className="stat">
                  <div className="stat-value" style={{ color: 'var(--green)' }}>{completedCount}</div>
                  <div className="stat-label">Done</div>
                </div>
                <div className="stats-divider" />
                <div className="stat">
                  <div className="stat-value" style={{ color: 'var(--yellow)' }}>{pendingCount}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            )}
          </section>

          {/* ── Not Connected ── */}
          {!isConnected && (
            <div className="not-connected">
              <div className="nc-icon">🔐</div>
              <div className="nc-title">Connect Your Wallet</div>
              <p className="nc-sub">Connect MetaMask to view and manage your on-chain tasks.</p>
              <button
                id="connect-wallet-hero-btn"
                className="btn-connect"
                style={{ margin: '0 auto' }}
                onClick={() => connect({ connector: injected() })}
              >
                🦊 Connect MetaMask
              </button>
            </div>
          )}

          {isConnected && (
            <>
              {/* ── Wrong Network Banner ── */}
              {isWrongNetwork && (
                <div className="wrong-network">
                  ⚠️ You&apos;re on the wrong network.
                  <button
                    id="switch-network-btn"
                    className="btn-save"
                    style={{ marginLeft: 'auto', padding: '5px 14px', fontSize: '12px' }}
                    onClick={() => switchChain({ chainId: sepoliaTestnet.id })}
                  >
                    Switch to Kasplex Testnet
                  </button>
                </div>
              )}

              {/* ── Tx Status ── */}
              {txMsg && (
                <div className={`tx-status ${txMsg.type}`}>
                  {txMsg.type === 'pending' && <span className="spinner" />}
                  {txMsg.type === 'success' && '✅'}
                  {txMsg.type === 'error'   && '❌'}
                  <span>{txMsg.text}</span>
                  <button
                    onClick={() => setTxMsg(null)}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ── Add Task Card ── */}
              <div className="add-task-card">
                <div className="add-task-title">➕ New Task</div>

                <div className="input-row">
                  <input
                    id="task-content-input"
                    className="task-input"
                    placeholder="What needs to be done?"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                    disabled={isBusy}
                  />
                  <button
                    id="add-task-btn"
                    className="btn-add"
                    onClick={handleAdd}
                    disabled={!content.trim() || isBusy}
                  >
                    {isBusy ? <span className="spinner" /> : '+ Add'}
                  </button>
                </div>

                <div className="meta-row">
                  <select
                    id="priority-select"
                    className="select-input"
                    value={priority}
                    onChange={e => setPriority(Number(e.target.value) as Priority)}
                    disabled={isBusy}
                  >
                    <option value={0}>🟢 Low Priority</option>
                    <option value={1}>🟡 Medium Priority</option>
                    <option value={2}>🔴 High Priority</option>
                  </select>

                  <input
                    id="category-input"
                    className="category-input"
                    placeholder="Category (e.g. Work, Personal)"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    disabled={isBusy}
                  />
                </div>
              </div>

              {/* ── Filter Tabs ── */}
              <div className="filter-tabs">
                {(['all', 'pending', 'completed'] as Filter[]).map(f => (
                  <button
                    id={`filter-${f}-btn`}
                    key={f}
                    className={`tab${filter === f ? ' active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all'       && `All (${tasks.length})`}
                    {f === 'pending'   && `⏳ Pending (${pendingCount})`}
                    {f === 'completed' && `✅ Completed (${completedCount})`}
                  </button>
                ))}
              </div>

              {/* ── Task List ── */}
              <div className="task-list">
                {filteredTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      {filter === 'completed' ? '🏆' : filter === 'pending' ? '🎉' : '📝'}
                    </div>
                    <div className="empty-title">
                      {filter === 'completed' ? 'No completed tasks yet'
                        : filter === 'pending'   ? 'All caught up!'
                        : 'No tasks yet'}
                    </div>
                    <p className="empty-sub">
                      {filter === 'all' ? 'Add your first task above to get started.' : ''}
                    </p>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskCard
                      key={task.id.toString()}
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      isPending={isBusy}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <p>
            Built with ⛓️ Solidity · Wagmi · Viem &nbsp;|&nbsp;
            Built by Umair &nbsp;|&nbsp;
            Deployed on{' '}
            <a
              href="https://explorer.kasplextest.xyz"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kasplex Testnet
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
