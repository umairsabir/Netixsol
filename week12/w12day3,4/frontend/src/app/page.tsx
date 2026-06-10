'use client'

import { useState, useEffect } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useSwitchChain,
} from 'wagmi'
import { parseEther, formatEther } from 'viem'
import {
  TOKEN_A_ADDRESS,
  TOKEN_B_ADDRESS,
  DEX_ADDRESS,
  TOKEN_A_ABI,
  TOKEN_B_ABI,
  DEX_ABI
} from '@/lib/contracts'

export default function Home() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity' | 'faucet'>('swap')
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB')
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [priceImpact, setPriceImpact] = useState(0)

  // Liquidity inputs
  const [liqAmountA, setLiqAmountA] = useState('')
  const [liqAmountB, setLiqAmountB] = useState('')

  // Faucet input
  const [faucetAmount, setFaucetAmount] = useState('100')

  // Action tracking
  const [lastAction, setLastAction] = useState<string | null>(null)

  // Transaction messages
  const [txMsg, setTxMsg] = useState<{ type: 'pending' | 'success' | 'error'; text: string } | null>(null)

  const publicClient = usePublicClient({ chainId: 11155111 })

  // Read Pool Reserves
  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: DEX_ADDRESS,
    abi: DEX_ABI,
    functionName: 'getReserves',
    chainId: 11155111,
  })

  // Read Balances
  const { data: balA, refetch: refetchBalA } = useReadContract({
    address: TOKEN_A_ADDRESS,
    abi: TOKEN_A_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    chainId: 11155111,
  })

  const { data: balB, refetch: refetchBalB } = useReadContract({
    address: TOKEN_B_ADDRESS,
    abi: TOKEN_B_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    chainId: 11155111,
  })

  // Read Allowances
  const { data: allowA, refetch: refetchAllowA } = useReadContract({
    address: TOKEN_A_ADDRESS,
    abi: TOKEN_A_ABI,
    functionName: 'allowance',
    args: address ? [address, DEX_ADDRESS] : undefined,
    query: { enabled: !!address },
    chainId: 11155111,
  })

  const { data: allowB, refetch: refetchAllowB } = useReadContract({
    address: TOKEN_B_ADDRESS,
    abi: TOKEN_B_ABI,
    functionName: 'allowance',
    args: address ? [address, DEX_ADDRESS] : undefined,
    query: { enabled: !!address },
    chainId: 11155111,
  })

  // Refetch helper
  const refetchAll = () => {
    refetchReserves()
    refetchBalA()
    refetchBalB()
    refetchAllowA()
    refetchAllowB()
  }

  // Write contract hook
  const { writeContract, data: txHash } = useWriteContract()

  // Wait for transactions
  const { isLoading: txLoading, isSuccess: txSuccess, error: txError } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: 11155111,
  })

  useEffect(() => {
    if (txLoading) {
      setTxMsg({ type: 'pending', text: 'Transaction is processing on Sepolia...' })
    } else if (txSuccess) {
      setTxMsg({ type: 'success', text: 'Transaction confirmed successfully!' })
      refetchAll()
      // Clear inputs selectively based on action type
      if (lastAction === 'swap') {
        setAmountIn('')
      } else if (lastAction === 'addLiquidity') {
        setLiqAmountA('')
        setLiqAmountB('')
      }
      setLastAction(null)
    } else if (txError) {
      setTxMsg({ type: 'error', text: txError.message || 'Transaction failed.' })
      setLastAction(null)
    }
  }, [txLoading, txSuccess, txError])

  // Preview swap
  useEffect(() => {
    if (!amountIn || isNaN(Number(amountIn)) || Number(amountIn) <= 0 || !reserves || !publicClient) {
      setAmountOut('')
      setPriceImpact(0)
      return
    }

    const fetchPreview = async () => {
      try {
        const parsedIn = parseEther(amountIn)
        const isAtoB = swapDirection === 'AtoB'
        const rA = reserves[0]
        const rB = reserves[1]

        if (rA === BigInt(0) || rB === BigInt(0)) {
          setAmountOut('0')
          return
        }

        const outAmount = await publicClient.readContract({
          address: DEX_ADDRESS,
          abi: DEX_ABI,
          functionName: 'getSwapAmount',
          args: [parsedIn, isAtoB],
        })

        setAmountOut(formatEther(outAmount))

        // Price Impact Calculation
        const reserveIn = isAtoB ? rA : rB
        const reserveOut = isAtoB ? rB : rA
        const spotPrice = Number(reserveOut) / Number(reserveIn)
        const actualPrice = Number(outAmount) / Number(parsedIn)
        const impact = ((spotPrice - actualPrice) / spotPrice) * 100
        setPriceImpact(Math.max(0, impact))
      } catch (e) {
        console.error(e)
      }
    }

    const timer = setTimeout(fetchPreview, 300)
    return () => clearTimeout(timer)
  }, [amountIn, swapDirection, reserves, publicClient])

  // Swap action
  const handleSwap = () => {
    if (!amountIn || !address) return
    setLastAction('swap')
    const parsedIn = parseEther(amountIn)
    if (swapDirection === 'AtoB') {
      writeContract({
        address: DEX_ADDRESS,
        abi: DEX_ABI,
        functionName: 'swapAforB',
        args: [parsedIn],
        chainId: 11155111,
      })
    } else {
      writeContract({
        address: DEX_ADDRESS,
        abi: DEX_ABI,
        functionName: 'swapBforA',
        args: [parsedIn],
        chainId: 11155111,
      })
    }
  }

  // Faucet mint action
  const handleFaucetMint = (token: 'A' | 'B') => {
    if (!faucetAmount || !address) return
    setLastAction(`faucet${token}`)
    const targetAddress = token === 'A' ? TOKEN_A_ADDRESS : TOKEN_B_ADDRESS
    const targetAbi = token === 'A' ? TOKEN_A_ABI : TOKEN_B_ABI
    writeContract({
      address: targetAddress,
      abi: targetAbi,
      functionName: 'mint',
      args: [address, parseEther(faucetAmount)],
      chainId: 11155111,
    })
  }

  // Approve action
  const handleApprove = (token: 'A' | 'B') => {
    const amount = parseEther('1000000000') // Approve large amount
    const targetAddress = token === 'A' ? TOKEN_A_ADDRESS : TOKEN_B_ADDRESS
    const targetAbi = token === 'A' ? TOKEN_A_ABI : TOKEN_B_ABI
    setLastAction(`approve${token}`)
    writeContract({
      address: targetAddress,
      abi: targetAbi,
      functionName: 'approve',
      args: [DEX_ADDRESS, amount],
      chainId: 11155111,
    })
  }

  // Add Liquidity action
  const handleAddLiquidity = () => {
    if (!liqAmountA || !liqAmountB) return
    setLastAction('addLiquidity')
    writeContract({
      address: DEX_ADDRESS,
      abi: DEX_ABI,
      functionName: 'addLiquidity',
      args: [parseEther(liqAmountA), parseEther(liqAmountB)],
      chainId: 11155111,
    })
  }

  // Check allowances
  const currentAllowance = swapDirection === 'AtoB' ? allowA : allowB
  const isApproved = currentAllowance !== undefined && currentAllowance >= (amountIn ? parseEther(amountIn) : BigInt(1))

  const isLiqApprovedA = allowA !== undefined && allowA >= (liqAmountA ? parseEther(liqAmountA) : BigInt(1))
  const isLiqApprovedB = allowB !== undefined && allowB >= (liqAmountB ? parseEther(liqAmountB) : BigInt(1))

  // Balance validations
  const userSwapBal = swapDirection === 'AtoB' ? balA : balB
  const hasEnoughSwapBal = userSwapBal !== undefined && userSwapBal >= (amountIn ? parseEther(amountIn) : BigInt(0))

  // Format helper
  const formatBal = (val: bigint | undefined) => {
    if (val === undefined) return '0.0'
    const formatted = formatEther(val)
    return parseFloat(formatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }

  const isWrongChain = chain && chain.id !== 11155111

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand">
            <span className="brand-icon">🔀</span>
            <span className="brand-name">Umair DEX</span>
          </div>
          <div>
            {isConnected && address ? (
              <button className="btn-connect connected" onClick={() => disconnect()}>
                <span className="dot"></span>
                {address.slice(0, 6)}...{address.slice(-4)}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="btn-connect"
                  >
                    Connect {connector.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="container">
          <div className="hero-tag">
            <span>✨</span> Powered by Constant Product Swap Protocol
          </div>
          <h1>Decentralized Token Exchange</h1>
          <p>Swap Umair Token (UT365) with Umair Token B (UTB365) seamlessly using our secure liquidity pools.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ marginTop: '20px' }}>
        {isWrongChain && (
          <div className="wrong-network">
            <span>⚠️ Please switch your wallet to Sepolia Test Network.</span>
            <button 
              className="btn-action-small" 
              style={{ marginLeft: 'auto', background: 'var(--accent-purple)', color: 'white', border: 'none' }}
              onClick={() => switchChain({ chainId: 11155111 })}
            >
              Switch to Sepolia
            </button>
          </div>
        )}

        {txMsg && (
          <div className={`tx-status ${txMsg.type}`}>
            {txMsg.type === 'pending' && <span className="spinner"></span>}
            <span>{txMsg.text}</span>
            <button 
              style={{ background: 'transparent', color: 'currentColor', marginLeft: 'auto', fontWeight: 'bold' }} 
              onClick={() => setTxMsg(null)}
            >
              ✕
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          {/* Action Card */}
          <section className="card-glass">
            <div className="tabs-navigation">
              <button 
                className={`tab-btn ${activeTab === 'swap' ? 'active' : ''}`}
                onClick={() => setActiveTab('swap')}
              >
                Swap
              </button>
              <button 
                className={`tab-btn ${activeTab === 'liquidity' ? 'active' : ''}`}
                onClick={() => setActiveTab('liquidity')}
              >
                Pool
              </button>
              <button 
                className={`tab-btn ${activeTab === 'faucet' ? 'active' : ''}`}
                onClick={() => setActiveTab('faucet')}
              >
                Faucet
              </button>
            </div>

            {/* Swap Tab */}
            {activeTab === 'swap' && (
              <div className="swap-container">
                {/* Input box A */}
                <div className="input-box">
                  <div className="input-header">
                    <span>From</span>
                    <span>Balance: {swapDirection === 'AtoB' ? formatBal(balA) : formatBal(balB)}</span>
                  </div>
                  <div className="input-row">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={amountIn}
                      onChange={(e) => setAmountIn(e.target.value)}
                    />
                    <div className="token-badge">
                      <span className={`token-icon ${swapDirection === 'AtoB' ? 'a' : 'b'}`}>
                        {swapDirection === 'AtoB' ? 'A' : 'B'}
                      </span>
                      {swapDirection === 'AtoB' ? 'UT365' : 'UTB365'}
                    </div>
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="swap-divider">
                  <button 
                    className="btn-arrow-swap"
                    onClick={() => {
                      setSwapDirection(swapDirection === 'AtoB' ? 'BtoA' : 'AtoB')
                      setAmountIn(amountOut)
                      setAmountOut('')
                    }}
                  >
                    ↓
                  </button>
                </div>

                {/* Input box B */}
                <div className="input-box" style={{ marginTop: '8px' }}>
                  <div className="input-header">
                    <span>To (Estimated)</span>
                    <span>Balance: {swapDirection === 'AtoB' ? formatBal(balB) : formatBal(balA)}</span>
                  </div>
                  <div className="input-row">
                    <input
                      type="text"
                      placeholder="0.0"
                      value={amountOut}
                      readOnly
                    />
                    <div className="token-badge">
                      <span className={`token-icon ${swapDirection === 'AtoB' ? 'b' : 'a'}`}>
                        {swapDirection === 'AtoB' ? 'B' : 'A'}
                      </span>
                      {swapDirection === 'AtoB' ? 'UTB365' : 'UT365'}
                    </div>
                  </div>
                </div>

                {/* Exchange Rates & Impact */}
                {amountIn && amountOut && (
                  <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '12px' }}>
                    <div className="info-row">
                      <span className="info-label">Price Impact</span>
                      <span className={`info-value ${priceImpact > 15 ? 'red' : priceImpact > 5 ? 'warning' : 'green'}`}>
                        {priceImpact.toFixed(2)}%
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Minimum Received</span>
                      <span className="info-value">
                        {(Number(amountOut) * 0.995).toFixed(4)} {swapDirection === 'AtoB' ? 'UTB365' : 'UT365'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Primary Button */}
                <div style={{ marginTop: '20px' }}>
                  {!isConnected ? (
                    <button className="btn-primary" style={{ width: '100%' }} disabled>
                      Connect Wallet to Swap
                    </button>
                  ) : !amountIn || Number(amountIn) <= 0 ? (
                    <button className="btn-primary" style={{ width: '100%' }} disabled>
                      Enter Amount
                    </button>
                  ) : !hasEnoughSwapBal ? (
                    <button className="btn-primary" style={{ width: '100%' }} disabled>
                      Insufficient Balance
                    </button>
                  ) : !isApproved ? (
                    <button 
                      className="btn-primary" 
                      style={{ width: '100%' }} 
                      onClick={() => handleApprove(swapDirection === 'AtoB' ? 'A' : 'B')}
                    >
                      Approve {swapDirection === 'AtoB' ? 'UT365' : 'UTB365'}
                    </button>
                  ) : (
                    <button className="btn-primary" style={{ width: '100%' }} onClick={handleSwap}>
                      Swap Tokens
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Liquidity Tab */}
            {activeTab === 'liquidity' && (
              <div className="swap-container">
                <div className="input-box">
                  <div className="input-header">
                    <span>Token A (UT365) Amount</span>
                    <span>Balance: {formatBal(balA)}</span>
                  </div>
                  <div className="input-row">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={liqAmountA}
                      onChange={(e) => setLiqAmountA(e.target.value)}
                    />
                    <div className="token-badge">
                      <span className="token-icon a">A</span>
                      UT365
                    </div>
                  </div>
                </div>

                <div className="input-box" style={{ marginTop: '16px' }}>
                  <div className="input-header">
                    <span>Token B (UTB365) Amount</span>
                    <span>Balance: {formatBal(balB)}</span>
                  </div>
                  <div className="input-row">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={liqAmountB}
                      onChange={(e) => setLiqAmountB(e.target.value)}
                    />
                    <div className="token-badge">
                      <span className="token-icon b">B</span>
                      UTB365
                    </div>
                  </div>
                </div>

                {/* Primary Button */}
                <div style={{ marginTop: '20px' }}>
                  {!isConnected ? (
                    <button className="btn-primary" style={{ width: '100%' }} disabled>
                      Connect Wallet
                    </button>
                  ) : !liqAmountA || !liqAmountB || Number(liqAmountA) <= 0 || Number(liqAmountB) <= 0 ? (
                    <button className="btn-primary" style={{ width: '100%' }} disabled>
                      Enter Amounts
                    </button>
                  ) : balA !== undefined && balA < parseEther(liqAmountA) ? (
                    <button className="btn-primary" style={{ width: '100%' }} disabled>
                      Insufficient UT365 Balance
                    </button>
                  ) : balB !== undefined && balB < parseEther(liqAmountB) ? (
                    <button className="btn-primary" style={{ width: '100%' }} disabled>
                      Insufficient UTB365 Balance
                    </button>
                  ) : !isLiqApprovedA ? (
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleApprove('A')}>
                      Approve UT365
                    </button>
                  ) : !isLiqApprovedB ? (
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleApprove('B')}>
                      Approve UTB365
                    </button>
                  ) : (
                    <button className="btn-primary" style={{ width: '100%' }} onClick={handleAddLiquidity}>
                      Add Liquidity
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Faucet Tab */}
            {activeTab === 'faucet' && (
              <div className="swap-container">
                <div className="input-box">
                  <div className="input-header">
                    <span>Faucet Amount to Mint</span>
                  </div>
                  <div className="input-row">
                    <input
                      type="number"
                      placeholder="100"
                      value={faucetAmount}
                      onChange={(e) => setFaucetAmount(e.target.value)}
                    />
                    <div className="token-badge">
                      <span className="token-icon">🪙</span>
                      Tokens
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  {!isConnected ? (
                    <button className="btn-primary" style={{ width: '100%' }} disabled>
                      Connect Wallet to Mint
                    </button>
                  ) : (
                    <>
                      <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleFaucetMint('A')}>
                        Mint UT365 (A)
                      </button>
                      <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleFaucetMint('B')}>
                        Mint UTB365 (B)
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Stats Card */}
          <section className="card-glass">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              📊 Pool Statistics
            </h2>

            <div className="pool-stats-grid">
              <div className="stat-item">
                <div className="stat-label">UT365 Pool Reserve</div>
                <div className="stat-value">
                  {reserves ? parseFloat(formatEther(reserves[0])).toFixed(2) : '0.00'}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">UTB365 Pool Reserve</div>
                <div className="stat-value">
                  {reserves ? parseFloat(formatEther(reserves[1])).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>💡 Current Pricing</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="info-row">
                  <span>1 UT365 equals</span>
                  <span className="info-value">
                    {reserves && reserves[0] > BigInt(0) 
                      ? (Number(reserves[1]) / Number(reserves[0])).toFixed(4)
                      : '0.0000'}{' '}
                    UTB365
                  </span>
                </div>
                <div className="info-row">
                  <span>1 UTB365 equals</span>
                  <span className="info-value">
                    {reserves && reserves[1] > BigInt(0) 
                      ? (Number(reserves[0]) / Number(reserves[1])).toFixed(4)
                      : '0.0000'}{' '}
                    UT365
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>🔗 Contract Addresses</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Umair Token (Token A):</span>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${TOKEN_A_ADDRESS}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#fde68a', textDecoration: 'none' }}
                  >
                    {TOKEN_A_ADDRESS.slice(0, 6)}...{TOKEN_A_ADDRESS.slice(-4)} ↗
                  </a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Umair Token B (UTB365):</span>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${TOKEN_B_ADDRESS}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#fde68a', textDecoration: 'none' }}
                  >
                    {TOKEN_B_ADDRESS.slice(0, 6)}...{TOKEN_B_ADDRESS.slice(-4)} ↗
                  </a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SimpleSwap Pool:</span>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${DEX_ADDRESS}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#fde68a', textDecoration: 'none' }}
                  >
                    {DEX_ADDRESS.slice(0, 6)}...{DEX_ADDRESS.slice(-4)} ↗
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
