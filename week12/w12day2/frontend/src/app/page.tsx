'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  usePublicClient,
} from 'wagmi'
import { parseEther, formatEther, isAddress } from 'viem'
import { sepolia } from 'viem/chains'
import { CONTRACT_ADDRESS, NFT_ABI } from '@/lib/contract'

// Procedural SVG artwork generator for premium visual representation
function NFTImage({ tokenId, revealed }: { tokenId: number; revealed: boolean }) {
  if (!revealed) {
    return (
      <svg className="nft-image-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="unrevealedGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#070913" stopOpacity="0.8" />
          </radialGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect width="200" height="200" fill="#0c0e25" />
        <circle cx="100" cy="100" r="70" fill="url(#unrevealedGrad)" />
        {/* Mysterious locked chest icon */}
        <g filter="url(#neonGlow)">
          <rect x="70" y="80" width="60" height="50" rx="10" fill="none" stroke="#ec4899" strokeWidth="4" />
          <path d="M80 80V65C80 53.9543 88.9543 45 100 45C111.046 45 120 53.9543 120 65V80" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="105" r="8" fill="#ec4899" />
          <line x1="100" y1="113" x2="100" y2="123" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" />
        </g>
        <text x="100" y="170" fill="#94a3b8" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="2">LOCKED VAULT</text>
      </svg>
    )
  }

  // Generative art parameters based on Token ID
  const hue1 = (tokenId * 67) % 360
  const hue2 = (tokenId * 149 + 180) % 360
  const shapeSides = 3 + (tokenId % 6) // Triangle to Octagon
  const innerCircles = 2 + (tokenId % 4)
  const patternType = tokenId % 3

  // Helper to calculate polygon path
  const points: string[] = []
  const radius = 45
  const cx = 100
  const cy = 95
  for (let i = 0; i < shapeSides; i++) {
    const angle = (i * 2 * Math.PI) / shapeSides - Math.PI / 2
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  const polygonPath = `M ${points.join(' L ')} Z`

  return (
    <svg className="nft-image-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`grad-${tokenId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 60%)`} />
          <stop offset="100%" stopColor={`hsl(${hue2}, 85%, 45%)`} />
        </linearGradient>
        <filter id={`glow-${tokenId}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <clipPath id={`clip-${tokenId}`}>
          <rect x="10" y="10" width="180" height="180" rx="16" />
        </clipPath>
      </defs>
      
      {/* Background */}
      <rect width="200" height="200" fill="#090a16" />
      <g clipPath={`url(#clip-${tokenId})`}>
        {/* Subtle grid pattern */}
        <path d="M 0,20 L 200,20 M 0,40 L 200,40 M 0,60 L 200,60 M 0,80 L 200,80 M 0,100 L 200,100 M 0,120 L 200,120 M 0,140 L 200,140 M 0,160 L 200,160 M 0,180 L 200,180" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <path d="M 20,0 L 20,200 M 40,0 L 40,200 M 60,0 L 60,200 M 80,0 L 80,200 M 100,0 L 100,200 M 120,0 L 120,200 M 140,0 L 140,200 M 160,0 L 160,200 M 180,0 L 180,200" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        
        {/* Glowing cosmic ring */}
        <circle cx="100" cy="95" r="60" stroke={`url(#grad-${tokenId})`} strokeWidth="1.5" strokeDasharray={patternType === 0 ? "5,5" : "none"} opacity="0.3" />
        
        {/* Core generative polygon */}
        <path d={polygonPath} fill={`url(#grad-${tokenId})`} filter={`url(#glow-${tokenId})`} opacity="0.85" />
        
        {/* Overlapping concentric design elements */}
        {Array.from({ length: innerCircles }).map((_, index) => (
          <circle
            key={index}
            cx="100"
            cy="95"
            r={10 + index * 12}
            stroke="#ffffff"
            strokeWidth="1"
            opacity={0.15 - index * 0.03}
          />
        ))}

        {/* Outer Tech Accents */}
        <path d="M 30,30 L 45,30 M 30,30 L 30,45" stroke={`url(#grad-${tokenId})`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 170,30 L 155,30 M 170,30 L 170,45" stroke={`url(#grad-${tokenId})`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 30,160 L 45,160 M 30,160 L 30,145" stroke={`url(#grad-${tokenId})`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 170,160 L 155,160 M 170,160 L 170,145" stroke={`url(#grad-${tokenId})`} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Decorative frame */}
      <rect x="10" y="10" width="180" height="180" rx="16" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
    </svg>
  )
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function Home() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const publicClient = usePublicClient()

  // Component states
  const [mintQty, setMintQty] = useState(1)
  const [txMsg, setTxMsg] = useState<{ type: 'pending' | 'success' | 'error'; text: string } | null>(null)
  const [ownedTokens, setOwnedTokens] = useState<number[]>([])
  const [metadataMap, setMetadataMap] = useState<Record<number, any>>({})

  // Admin settings states
  const [whitelistTarget, setWhitelistTarget] = useState('')
  const [newPriceInput, setNewPriceInput] = useState('')
  const [newBaseUriInput, setNewBaseUriInput] = useState('')

  // ── Read Contract states ──────────────────────────────────────────────────
  const { data: nameData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'name',
  })

  const { data: symbolData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    // Symbol
    functionName: 'symbol',
  })

  const { data: priceData, refetch: refetchPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'mintPrice',
  })

  const { data: maxSupplyData, refetch: refetchMaxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'tokenIdCounter',
  }) // Tracks next token to be minted. Thus, current minted supply = tokenIdCounter - 1.

  const { data: revealedData, refetch: refetchRevealed } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'revealed',
  })

  const { data: onlyWhitelistData, refetch: refetchOnlyWhitelist } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    // Whitelist only flag
    functionName: 'onlyWhitelist',
  })

  const { data: ownerData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'owner',
  })

  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  })

  const { data: isWhitelistedData, refetch: refetchUserWhitelist } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'whitelist',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  })

  // Contract balance for owner panel
  const [contractBalance, setContractBalance] = useState('0.00')

  const fetchContractBalance = useCallback(async () => {
    if (!publicClient) return
    try {
      const bal = await publicClient.getBalance({ address: CONTRACT_ADDRESS })
      setContractBalance(formatEther(bal))
    } catch (e) {
      console.error(e)
    }
  }, [publicClient])

  useEffect(() => {
    if (isConnected) {
      fetchContractBalance()
    }
  }, [isConnected, fetchContractBalance, priceData])

  // ── Write Contract states ──────────────────────────────────────────────────
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Dynamic helper computed properties
  const isWrongNetwork = isConnected && chain?.id !== sepolia.id
  const currentMinted = maxSupplyData !== undefined ? Number(maxSupplyData) - 1 : 0
  const nftName = (nameData as string) || 'Umair Token'
  const nftSymbol = (symbolData as string) || 'UTNFT'
  const mintPriceEth = priceData ? formatEther(priceData as bigint) : '0.05'
  const isOwner = ownerData && address ? ownerData.toLowerCase() === address.toLowerCase() : false
  const isBusy = isWritePending || isConfirming

  // Dynamic procedural catalog meta depending on ID
  const nftMetaList = useMemo(() => {
    const names = [
      "Quantum Nexus Matrix",
      "Cybernetic Void Core",
      "Aetherial Warp Prism",
      "Chronos Tachyon Shell",
      "Nebula Plasma Relic",
      "Hyperdrive Spark Key"
    ]
    const rarities = ["Mythic", "Legendary", "Epic", "Rare", "Uncommon"]
    const elements = ["Void", "Plasma", "Cosmic", "Quantum", "Aether"]

    return (id: number) => {
      const nameIndex = (id * 7) % names.length
      const rarityIndex = (id * 13) % rarities.length
      const elementIndex = (id * 17) % elements.length
      const power = 75 + (id * 23) % 25

      return {
        name: `${names[nameIndex]} #${id}`,
        description: `This high-fidelity sci-fi relic is forged with raw energies. Token ID #${id} gives complete ownership of this artifact on Sepolia.`,
        rarity: rarities[rarityIndex],
        element: elements[elementIndex],
        power: power
      }
    };
  }, [])

  // Scan user's owned NFTs using client-side calls
  const scanOwnedNFTs = useCallback(async () => {
    if (!address || !publicClient || maxSupplyData === undefined) return
    try {
      const totalCount = Number(maxSupplyData)
      const owned: number[] = []
      const promises = []

      // Scan up to token ID totalCount - 1
      for (let id = 1; id < totalCount; id++) {
        promises.push(
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(id)],
          }).then((ownerAddr) => {
            if ((ownerAddr as string).toLowerCase() === address.toLowerCase()) {
              owned.push(id)
            }
          }).catch(() => null)
        )
      }
      await Promise.all(promises)
      owned.sort((a, b) => a - b)
      setOwnedTokens(owned)
    } catch (e) {
      console.error(e)
    }
  }, [address, publicClient, maxSupplyData])

  useEffect(() => {
    if (isConnected && address && maxSupplyData !== undefined) {
      scanOwnedNFTs()
    }
  }, [isConnected, address, maxSupplyData, scanOwnedNFTs, userBalance])

  // Helper to convert ipfs:// to gateway url
  const resolveIpfs = useCallback((uri: string) => {
    if (!uri) return ''
    if (uri.startsWith('ipfs://')) {
      return `https://aqua-bizarre-iguana-530.mypinata.cloud/ipfs/${uri.substring(7)}`
    }
    return uri
  }, [])

  // Fetch token metadata from IPFS gateway
  useEffect(() => {
    if (ownedTokens.length === 0 || !revealedData) return

    const fetchAllMetadata = async () => {
      const updatedMap = { ...metadataMap }
      let changed = false

      await Promise.all(
        ownedTokens.map(async (id) => {
          if (updatedMap[id]) return // Already fetched
          try {
            const res = await fetch(`https://aqua-bizarre-iguana-530.mypinata.cloud/ipfs/Qma6spzrSDUrspz7Cw8oUY6awh9hBRi9nSF9TWszttrV26/${id}.json`)
            if (res.ok) {
              const data = await res.json()
              updatedMap[id] = data
              changed = true
            }
          } catch (e) {
            console.error(`Failed to fetch metadata for token #${id}`, e)
          }
        })
      )

      if (changed) {
        setMetadataMap(updatedMap)
      }
    }

    fetchAllMetadata()
  }, [ownedTokens, revealedData])

  // Watch transaction completion
  useEffect(() => {
    if (!txSuccess) return
    const timer = setTimeout(() => {
      refetchBalance()
      scanOwnedNFTs()
      fetchContractBalance()
      refetchMaxSupply()
      refetchPrice()
      refetchRevealed()
      refetchOnlyWhitelist()
      refetchUserWhitelist()
      setTxMsg({ type: 'success', text: `Transaction confirmed successfully! ✓` })
      setTimeout(() => setTxMsg(null), 5000)
    }, 2000)
    return () => clearTimeout(timer)
  }, [
    txSuccess,
    refetchBalance,
    scanOwnedNFTs,
    fetchContractBalance,
    refetchMaxSupply,
    refetchPrice,
    refetchRevealed,
    refetchOnlyWhitelist,
    refetchUserWhitelist
  ])

  // ── Functions ─────────────────────────────────────────────────────────────
  
  // Mint NFT
  const handleMint = useCallback(() => {
    if (!priceData) return
    try {
      const priceVal = (priceData as bigint) * BigInt(mintQty)
      setTxMsg({ type: 'pending', text: 'Waiting for wallet confirmation…' })
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'mint',
          args: [BigInt(mintQty)],
          value: priceVal,
        },
        {
          onSuccess: () => setTxMsg({ type: 'pending', text: 'Mint submitted, waiting for block…' }),
          onError: (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
        }
      )
    } catch (e) {
      setTxMsg({ type: 'error', text: 'Mint failed. Try again.' })
    }
  }, [mintQty, priceData, writeContract])

  // Admin: Toggle whitelist only mode
  const handleToggleWhitelist = useCallback(() => {
    const currentVal = !!onlyWhitelistData
    setTxMsg({ type: 'pending', text: 'Toggling whitelist state…' })
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'setOnlyWhitelist',
        args: [!currentVal],
      },
      {
        onSuccess: () => {
          setTxMsg({ type: 'pending', text: 'Updating whitelist settings, waiting for block…' })
          setTimeout(() => refetchOnlyWhitelist(), 5000)
        },
        onError: (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
      }
    )
  }, [onlyWhitelistData, writeContract, refetchOnlyWhitelist])

  // Admin: Toggle reveal status
  const handleToggleReveal = useCallback(() => {
    const currentVal = !!revealedData
    setTxMsg({ type: 'pending', text: 'Toggling reveal state…' })
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'setRevealed',
        args: [!currentVal],
      },
      {
        onSuccess: () => {
          setTxMsg({ type: 'pending', text: 'Revealing collection, waiting for block…' })
          setTimeout(() => refetchRevealed(), 5000)
        },
        onError: (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
      }
    )
  }, [revealedData, writeContract, refetchRevealed])

  // Admin: Add user to whitelist
  const handleAddWhitelist = useCallback(() => {
    if (!whitelistTarget || !isAddress(whitelistTarget)) {
      setTxMsg({ type: 'error', text: 'Please enter a valid Ethereum address.' })
      return
    }
    setTxMsg({ type: 'pending', text: 'Whitelisting address…' })
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'setWhitelist',
        args: [whitelistTarget as `0x${string}`, true],
      },
      {
        onSuccess: () => {
          setTxMsg({ type: 'success', text: `Whitelisted ${shortenAddress(whitelistTarget)} ✓` })
          setWhitelistTarget('')
          refetchUserWhitelist()
          setTimeout(() => setTxMsg(null), 4000)
        },
        onError: (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
      }
    )
  }, [whitelistTarget, writeContract, refetchUserWhitelist])

  // Admin: Set mint price
  const handleSetPrice = useCallback(() => {
    if (!newPriceInput || isNaN(Number(newPriceInput))) {
      setTxMsg({ type: 'error', text: 'Please enter a valid price in ETH.' })
      return
    }
    try {
      const priceWei = parseEther(newPriceInput)
      setTxMsg({ type: 'pending', text: 'Setting mint price…' })
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'setMintPrice',
          args: [priceWei],
        },
        {
          onSuccess: () => {
            setTxMsg({ type: 'success', text: `Updated mint price to ${newPriceInput} ETH ✓` })
            setNewPriceInput('')
            refetchPrice()
            setTimeout(() => setTxMsg(null), 4000)
          },
          onError: (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
        }
      )
    } catch (e) {
      setTxMsg({ type: 'error', text: 'Invalid pricing input.' })
    }
  }, [newPriceInput, writeContract, refetchPrice])

  // Admin: Set Base URI
  const handleSetBaseUri = useCallback(() => {
    if (!newBaseUriInput) return
    setTxMsg({ type: 'pending', text: 'Setting Base URI…' })
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'setBaseURI',
        args: [newBaseUriInput],
      },
      {
        onSuccess: () => {
          setTxMsg({ type: 'success', text: 'Updated base URI successfully ✓' })
          setNewBaseUriInput('')
          setTimeout(() => setTxMsg(null), 4000)
        },
        onError: (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
      }
    )
  }, [newBaseUriInput, writeContract])

  // Admin: Withdraw funds
  const handleWithdraw = useCallback(() => {
    setTxMsg({ type: 'pending', text: 'Withdrawing contract funds…' })
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'withdraw',
      },
      {
        onSuccess: () => {
          setTxMsg({ type: 'success', text: 'Contract funds successfully withdrawn ✓' })
          fetchContractBalance()
          setTimeout(() => setTxMsg(null), 5000)
        },
        onError: (e) => setTxMsg({ type: 'error', text: e.message.split('\n')[0] }),
      }
    )
  }, [writeContract, fetchContractBalance])

  return (
    <div className="app-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            <div className="navbar-brand">
              <span className="brand-icon">🎨</span>
              <span className="brand-name">{nftSymbol} Collection</span>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    className="btn-connect"
                    onClick={() => connect({ connector })}
                  >
                    🚀 {connector.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Dashboard ── */}
      <main style={{ flex: 1, padding: '40px 0' }}>
        <div className="container">
          
          {/* ── Hero Banner ── */}
          <section className="hero">
            <div className="hero-tag">
              <span>🪐</span>
              <span>ERC-721 Generative Space Relics</span>
            </div>
            <h1>{nftName}</h1>
            <p>
              An exclusive collection of 500 unique procedurally generated cosmic relics. Mint your unique token, support royalties, and check reveal properties below.
            </p>
          </section>

          {/* ── Wrong Network Alert ── */}
          {isWrongNetwork && (
            <div className="wrong-network">
              <span>⚠️ You are connected to the wrong network. Dashboard functions only on Sepolia.</span>
              <button
                className="btn-secondary"
                onClick={() => switchChain({ chainId: sepolia.id })}
              >
                Switch to Sepolia
              </button>
            </div>
          )}

          {!isConnected && (
            <div className="card-glass" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🔐</div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: '10px' }}>Wallet Disconnected</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                Connect your MetaMask wallet to see contract status, mint NFTs, and manage your asset collection.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    className="btn-primary"
                    onClick={() => connect({ connector })}
                  >
                    Connect {connector.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isConnected && (
            <div className="dashboard-grid">
              
              {/* ── Mint Controller Panel (Left Column) ── */}
              <div className="card-glass mint-card">
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Minting Portal</h2>
                
                <div className="mint-status-badges">
                  {onlyWhitelistData ? (
                    <span className="badge alert">🔒 Whitelist Only</span>
                  ) : (
                    <span className="badge active">🔓 Public Mint</span>
                  )}
                  {revealedData ? (
                    <span className="badge active">👁️ Revealed</span>
                  ) : (
                    <span className="badge alert">❓ Hidden Collection</span>
                  )}
                  {onlyWhitelistData && isWhitelistedData && (
                    <span className="badge active">✓ Whitelisted</span>
                  )}
                  {onlyWhitelistData && !isWhitelistedData && !isOwner && (
                    <span className="badge alert">✕ Not Whitelisted</span>
                  )}
                </div>

                {txMsg && (
                  <div className={`tx-status ${txMsg.type}`}>
                    {txMsg.type === 'pending' && <span className="spinner" />}
                    {txMsg.type === 'success' && '✅ '}
                    {txMsg.type === 'error' && '❌ '}
                    <span>{txMsg.text}</span>
                  </div>
                )}

                <div className="supply-header">
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>MINT PROGRESS</span>
                  <div>
                    <span className="supply-value">{currentMinted}</span>
                    <span className="supply-max"> / 500</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden', margin: '-5px 0 10px' }}>
                  <div style={{
                    background: 'var(--accent-gradient)',
                    width: `${Math.max(1, (currentMinted / 500) * 100)}%`,
                    height: '100%',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>

                <div className="price-display">
                  <span className="price-label">MINT PRICE:</span>
                  <span className="price-value">{mintPriceEth} ETH</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>QUANTITY (1 - 5 MAX):</label>
                  <div className="qty-selector">
                    <button
                      className="qty-btn"
                      onClick={() => setMintQty(Math.max(1, mintQty - 1))}
                      disabled={mintQty <= 1 || isBusy}
                    >
                      -
                    </button>
                    <span className="qty-value">{mintQty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => setMintQty(Math.min(5, mintQty + 1))}
                      disabled={mintQty >= 5 || isBusy}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleMint}
                  disabled={isWrongNetwork || isBusy || (onlyWhitelistData && !isWhitelistedData && !isOwner)}
                  style={{ width: '100%', padding: '16px 20px', marginTop: '10px' }}
                >
                  {isBusy ? (
                    <><span className="spinner" /> Processing...</>
                  ) : onlyWhitelistData && !isWhitelistedData && !isOwner ? (
                    'Not Whitelisted'
                  ) : (
                    `Mint ${mintQty} NFT${mintQty > 1 ? 's' : ''} (${(Number(mintPriceEth) * mintQty).toFixed(2)} ETH)`
                  )}
                </button>

                <div style={{ marginTop: '15px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Contract Address:</span>
                    <code style={{ color: '#a78bfa' }}>{shortenAddress(CONTRACT_ADDRESS)}</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Default Royalties:</span>
                    <span>5% Creator Fees</span>
                  </div>
                </div>
              </div>

              {/* ── My NFT Gallery Collection (Right Column) ── */}
              <div className="gallery-section">
                <h2>
                  My Artifacts Collection
                  <span className="gallery-count">{ownedTokens.length} owned</span>
                </h2>

                <div className="gallery-grid">
                  {ownedTokens.length > 0 ? (
                    ownedTokens.map((tokenId) => {
                      const meta = nftMetaList(tokenId)
                      return (
                        <div key={tokenId} className="nft-card">
                          <div className="nft-image-container">
                            {revealedData && metadataMap[tokenId] ? (
                              <img
                                src={resolveIpfs(metadataMap[tokenId].image)}
                                className="nft-image"
                                alt={metadataMap[tokenId].name || `Token #${tokenId}`}
                              />
                            ) : (
                              <NFTImage tokenId={tokenId} revealed={!!revealedData} />
                            )}
                          </div>
                          <div className="nft-details">
                            <div className="nft-id">Token ID #{tokenId}</div>
                            <div className="nft-name">
                              {revealedData ? (metadataMap[tokenId]?.name || meta.name) : `Locked Core #${tokenId}`}
                            </div>
                            <div className="nft-description">
                              {revealedData ? (metadataMap[tokenId]?.description || meta.description) : 'This cosmic artifact is waiting to be scanned/revealed by the archive command.'}
                            </div>
                            {revealedData && (
                              <div className="nft-traits">
                                {metadataMap[tokenId]?.attributes ? (
                                  metadataMap[tokenId].attributes.map((attr: any, idx: number) => (
                                    <div key={idx} className="nft-trait">
                                      <span className="nft-trait-type">{attr.trait_type}</span>
                                      <span className="nft-trait-value">{attr.value}</span>
                                    </div>
                                  ))
                                ) : (
                                  <>
                                    <div className="nft-trait">
                                      <span className="nft-trait-type">Rarity</span>
                                      <span className="nft-trait-value">{meta.rarity}</span>
                                    </div>
                                    <div className="nft-trait">
                                      <span className="nft-trait-type">Power</span>
                                      <span className="nft-trait-value">{meta.power}%</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="gallery-empty">
                      <div className="gallery-empty-icon">🛸</div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Artifacts Found</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                        Mint your first Space Relic NFT using the portal on the left to see it in your inventory gallery.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Owner / Admin Control Panel (Only if Wallet is Owner) ── */}
              {isOwner && (
                <div className="admin-section">
                  <h2>👑 Creator Admin Panel</h2>
                  
                  <div className="admin-grid">
                    {/* Whitelist Toggle & Add */}
                    <div className="admin-card">
                      <h3>Whitelist Controls</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Manage whitelist mode and whitelisted addresses.
                      </p>
                      
                      <div className="admin-status-info">
                        <span>Mode:</span>
                        <span style={{ fontWeight: 700, color: onlyWhitelistData ? '#fbbf24' : '#34d399' }}>
                          {onlyWhitelistData ? 'Whitelist Only' : 'Open Public'}
                        </span>
                      </div>

                      <button
                        className="btn-secondary"
                        onClick={handleToggleWhitelist}
                        disabled={isBusy}
                      >
                        {onlyWhitelistData ? 'Disable Whitelist Only' : 'Enable Whitelist Only'}
                      </button>

                      <div className="input-row" style={{ marginTop: '5px' }}>
                        <input
                          type="text"
                          placeholder="0x... recipient address"
                          value={whitelistTarget}
                          onChange={(e) => setWhitelistTarget(e.target.value)}
                          disabled={isBusy}
                        />
                        <button
                          className="btn-secondary"
                          onClick={handleAddWhitelist}
                          disabled={isBusy || !whitelistTarget}
                        >
                          Whitelist
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Reveal Configuration */}
                    <div className="admin-card">
                      <h3>Reveal & metadata URIs</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Reveal hidden assets and update base URIs.
                      </p>

                      <div className="admin-status-info">
                        <span>Art Status:</span>
                        <span style={{ fontWeight: 700, color: revealedData ? '#34d399' : '#fbbf24' }}>
                          {revealedData ? 'REVEALED' : 'HIDDEN'}
                        </span>
                      </div>

                      <button
                        className="btn-secondary"
                        onClick={handleToggleReveal}
                        disabled={isBusy}
                      >
                        {revealedData ? 'Hide Metadata' : 'Reveal Collection'}
                      </button>

                      <div className="input-row" style={{ marginTop: '5px' }}>
                        <input
                          type="text"
                          placeholder="ipfs://QmBaseHash/"
                          value={newBaseUriInput}
                          onChange={(e) => setNewBaseUriInput(e.target.value)}
                          disabled={isBusy}
                        />
                        <button
                          className="btn-secondary"
                          onClick={handleSetBaseUri}
                          disabled={isBusy || !newBaseUriInput}
                        >
                          Set baseURI
                        </button>
                      </div>
                    </div>

                    {/* Financial Withdraw & Price Adjustment */}
                    <div className="admin-card">
                      <h3>Vault & Pricing</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Withdraw funds to your wallet and adjust pricing.
                      </p>

                      <div className="admin-status-info">
                        <span>Vault Balance:</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>{contractBalance} ETH</span>
                      </div>

                      <button
                        className="btn-primary"
                        onClick={handleWithdraw}
                        disabled={isBusy || Number(contractBalance) <= 0}
                        style={{ padding: '8px 16px', fontSize: '0.9rem', boxShadow: 'none' }}
                      >
                        Withdraw Funds
                      </button>

                      <div className="input-row" style={{ marginTop: '5px' }}>
                        <input
                          type="text"
                          placeholder="0.05 (ETH)"
                          value={newPriceInput}
                          onChange={(e) => setNewPriceInput(e.target.value)}
                          disabled={isBusy}
                        />
                        <button
                          className="btn-secondary"
                          onClick={handleSetPrice}
                          disabled={isBusy || !newPriceInput}
                        >
                          Set Price
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '24px 0', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <div className="container">
          <p>© 2026 Umair Token NFT Collection DApp. Built with React, Wagmi, Ethers & OpenZeppelin.</p>
        </div>
      </footer>
    </div>
  )
}
