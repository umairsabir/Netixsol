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
import { parseUnits, formatUnits, isAddress } from 'viem'
import { sepolia } from 'viem/chains'
import { CONTRACT_ADDRESS, ERC20_ABI } from '@/lib/contract'

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function Home() {
  const { address, isConnected, chain } = useAccount()
  const { connect }    = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txMsg, setTxMsg] = useState<{ type: 'pending'|'success'|'error'; text: string } | null>(null)

  // ── Contract reads ──────────────────────────────────────────────────────
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  })

  const { data: decimals = 18 } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const { data: symbol = 'UR' } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'symbol',
  })

  // ── Contract writes ─────────────────────────────────────────────────────
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (!txSuccess) return
    const timer = setTimeout(() => {
      refetchBalance()
      setTxMsg({ type: 'success', text: 'Transaction confirmed ✓' })
      setRecipient('')
      setAmount('')
      setTimeout(() => setTxMsg(null), 5000)
    }, 2000)
    return () => clearTimeout(timer)
  }, [txSuccess, refetchBalance])

  const isBusy = isWritePending || isConfirming
  const isWrongNetwork = isConnected && chain?.id !== sepolia.id

  const handleTransfer = useCallback(() => {
    if (!recipient || !amount) return
    if (!isAddress(recipient)) {
      setTxMsg({ type: 'error', text: 'Invalid recipient address' })
      return
    }

    try {
      const parsedAmount = parseUnits(amount, Number(decimals))
      setTxMsg({ type: 'pending', text: 'Waiting for wallet confirmation…' })
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, parsedAmount],
        },
        {
          onSuccess: () => setTxMsg({ type: 'pending', text: 'Transaction submitted, waiting for block…' }),
          onError: (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
        }
      )
    } catch (e) {
      setTxMsg({ type: 'error', text: 'Invalid amount' })
    }
  }, [recipient, amount, decimals, writeContract])

  const displayBalance = balanceData !== undefined 
    ? Number(formatUnits(balanceData as bigint, Number(decimals))).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : '0.00'

  return (
    <div className="app-root">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            <div className="navbar-brand">
              <div className="brand-icon">💎</div>
              <span className="brand-name">Umair Token</span>
            </div>

            {isConnected ? (
              <button
                className="btn-connect connected"
                onClick={() => disconnect()}
              >
                <span className="dot" />
                {shortenAddress(address!)}
              </button>
            ) : (
              <button
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
          <section className="hero">
            <div className="hero-tag">✨ ERC-20 Token Dashboard</div>
            <h1>Manage your {symbol as string}</h1>
            <p>View your balance and seamlessly transfer tokens to anyone on the Sepolia network.</p>
          </section>

          {!isConnected && (
            <div className="not-connected card-glass">
              <div className="nc-icon">🔐</div>
              <div className="nc-title">Wallet Not Connected</div>
              <p className="nc-sub">Connect your MetaMask to manage your Umair tokens.</p>
              <button
                className="btn-primary"
                onClick={() => connect({ connector: injected() })}
              >
                Connect MetaMask
              </button>
            </div>
          )}

          {isConnected && (
            <div className="dashboard-grid">
              {/* ── Wrong Network Banner ── */}
              {isWrongNetwork && (
                <div className="wrong-network">
                  <div className="wn-text">⚠️ You are on the wrong network.</div>
                  <button
                    className="btn-secondary"
                    onClick={() => switchChain({ chainId: sepolia.id })}
                  >
                    Switch to Sepolia
                  </button>
                </div>
              )}

              {/* ── Balance Card ── */}
              <div className="card-glass balance-card">
                <h2>Your Balance</h2>
                <div className="balance-display">
                  <span className="balance-amount">{displayBalance}</span>
                  <span className="balance-symbol">{symbol as string}</span>
                </div>

                <div className="address-section" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Your Wallet Address (Share to receive tokens)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <code style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', flex: 1, wordBreak: 'break-all' }}>{address}</code>
                      <button className="btn-secondary" onClick={() => {
                        navigator.clipboard.writeText(address!);
                        setTxMsg({ type: 'success', text: 'Wallet address copied to clipboard!' });
                        setTimeout(() => setTxMsg(null), 3000);
                      }}>Copy</button>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Token Contract Address</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <code style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', flex: 1, wordBreak: 'break-all' }}>{CONTRACT_ADDRESS}</code>
                      <button className="btn-secondary" onClick={() => {
                        navigator.clipboard.writeText(CONTRACT_ADDRESS);
                        setTxMsg({ type: 'success', text: 'Contract address copied to clipboard!' });
                        setTimeout(() => setTxMsg(null), 3000);
                      }}>Copy</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Transfer Card ── */}
              <div className="card-glass transfer-card">
                <h2>Transfer Tokens</h2>
                
                {txMsg && (
                  <div className={`tx-status ${txMsg.type}`}>
                    {txMsg.type === 'pending' && <span className="spinner" />}
                    {txMsg.type === 'success' && '✅ '}
                    {txMsg.type === 'error'   && '❌ '}
                    <span>{txMsg.text}</span>
                  </div>
                )}

                <div className="input-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    disabled={isBusy}
                  />
                </div>

                <div className="input-group">
                  <label>Amount ({symbol as string})</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    disabled={isBusy}
                  />
                </div>

                <button
                  className="btn-primary transfer-btn"
                  onClick={handleTransfer}
                  disabled={!recipient || !amount || isBusy || isWrongNetwork}
                >
                  {isBusy ? (
                    <><span className="spinner" /> Processing...</>
                  ) : (
                    'Send Tokens'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
