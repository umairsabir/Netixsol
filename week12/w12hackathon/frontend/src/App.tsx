import { useState, useEffect, useMemo } from "react";
import { 
  WagmiProvider, 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useChainId,
  useSwitchChain,
  useReadContract, 
  useReadContracts,
  useWriteContract,
  useBalance
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { formatEther, parseEther } from "viem";
import { config } from "./lib/wagmi";
import { 
  CONTRACT_ADDRESSES, 
  PlatformTokenABI, 
  TokenAABI, 
  TokenBABI, 
  TokenFaucetABI, 
  MultiTokenDEXABI, 
  NFTCollectionABI, 
  NFTMarketplaceABI 
} from "./lib/contracts";
import { 
  Coins, 
  ArrowRightLeft, 
  Droplet, 
  ShoppingBag, 
  Wallet, 
  User, 
  Plus,
  Minus,
  Sparkles,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const queryClient = new QueryClient();

// Token config for iteration & helper utility
const TOKENS = [
  { symbol: "DNFT", name: "Platform Token", address: CONTRACT_ADDRESSES.PlatformToken, abi: PlatformTokenABI },
  { symbol: "UTNA", name: "Umair Token A", address: CONTRACT_ADDRESSES.TokenA, abi: TokenAABI },
  { symbol: "UTNB", name: "Umair Token B", address: CONTRACT_ADDRESSES.TokenB, abi: TokenBABI }
];

function formatAddress(addr: string) {
  if (!addr) return "";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

// ----------------------------------------------------
// FAUCET TAB
// ----------------------------------------------------
function FaucetTab() {
  const { address } = useAccount();
  const [claimStatus, setClaimStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Reads
  const { data: dnftBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.PlatformToken,
    abi: PlatformTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { data: totalClaimed, refetch: refetchTotalClaimed } = useReadContract({
    address: CONTRACT_ADDRESSES.TokenFaucet,
    abi: TokenFaucetABI,
    functionName: "getTotalClaimed",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { data: timeUntilNextClaim, refetch: refetchTime } = useReadContract({
    address: CONTRACT_ADDRESSES.TokenFaucet,
    abi: TokenFaucetABI,
    functionName: "getTimeUntilNextClaim",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { writeContractAsync } = useWriteContract();

  // Cooldown countdown timer
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  useEffect(() => {
    if (timeUntilNextClaim !== undefined) {
      const timer = setTimeout(() => {
        setCooldownSeconds(Number(timeUntilNextClaim));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [timeUntilNextClaim]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          refetchTime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds, refetchTime]);

  const handleClaim = async () => {
    if (!address) return;
    setLoading(true);
    setClaimStatus(null);
    try {
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.TokenFaucet,
        abi: TokenFaucetABI,
        functionName: "claimTokens",
      });
      setClaimStatus({ type: "success", msg: `Successfully claimed 100 DNFT! Tx: ${tx.substring(0, 10)}...` });
      refetchBalance();
      refetchTotalClaimed();
      refetchTime();
    } catch (err) {
      const error = err as Error;
      setClaimStatus({ type: "error", msg: error.message || "Claim transaction failed." });
    } finally {
      setLoading(false);
    }
  };

  const formatCooldown = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="faucet-header">
        <Sparkles size={48} className="text-cyan" style={{ marginBottom: "16px" }} />
        <h2 className="faucet-title">Token Faucet</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Claim free DNFT platform tokens to participate in swapping, liquidity pools, and the NFT Marketplace.
        </p>
      </div>

      <div className="faucet-stats">
        <div className="stat-box">
          <div className="stat-value">
            {dnftBalance !== undefined ? parseFloat(formatEther(dnftBalance as bigint)).toFixed(2) : "0.00"}
          </div>
          <div className="stat-label">Your DNFT</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">
            {totalClaimed !== undefined ? parseFloat(formatEther(totalClaimed as bigint)).toFixed(2) : "0.00"}
          </div>
          <div className="stat-label">Total Claimed</div>
        </div>
      </div>

      {claimStatus && (
        <div className={claimStatus.type === "success" ? "success-banner" : "error-banner"}>
          {claimStatus.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{claimStatus.msg}</span>
        </div>
      )}

      {cooldownSeconds > 0 ? (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ color: "var(--neon-magenta)", fontWeight: "bold", fontSize: "1.1rem" }}>
            Cooldown Active: {formatCooldown(cooldownSeconds)}
          </p>
        </div>
      ) : null}

      <button
        className="btn-primary"
        onClick={handleClaim}
        disabled={loading || cooldownSeconds > 0 || !address}
      >
        {loading ? <span className="loader"></span> : "Claim 100 DNFT"}
      </button>
    </div>
  );
}

// ----------------------------------------------------
// SWAP TAB
// ----------------------------------------------------
function SwapTab() {
  const { address } = useAccount();
  const [tokenIn, setTokenIn] = useState<string>("DNFT");
  const [tokenOut, setTokenOut] = useState<string>("UTNA");
  const [amountIn, setAmountIn] = useState<string>("");
  const [swapStatus, setSwapStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const tIn = TOKENS.find(t => t.symbol === tokenIn)!;
  const tOut = TOKENS.find(t => t.symbol === tokenOut)!;

  // Reads
  const { data: balanceIn, refetch: refetchBalIn } = useReadContract({
    address: tIn.address,
    abi: tIn.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { data: balanceOut, refetch: refetchBalOut } = useReadContract({
    address: tOut.address,
    abi: tOut.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { data: allowanceIn, refetch: refetchAllow } = useReadContract({
    address: tIn.address,
    abi: tIn.abi,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESSES.MultiTokenDEX] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  // Calculate amount out
  const parsedAmountIn = amountIn ? parseEther(amountIn) : 0n;
  const { data: calculatedAmountOut } = useReadContract({
    address: CONTRACT_ADDRESSES.MultiTokenDEX,
    abi: MultiTokenDEXABI,
    functionName: "getAmountOut",
    args: parsedAmountIn > 0n ? [tIn.address, tOut.address, parsedAmountIn] : undefined,
    chainId: 11155111,
    query: {
      enabled: parsedAmountIn > 0n
    }
  });

  // Pool reserves
  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: CONTRACT_ADDRESSES.MultiTokenDEX,
    abi: MultiTokenDEXABI,
    functionName: "getReserves",
    args: [tIn.address, tOut.address],
    chainId: 11155111,
  });

  const { writeContractAsync } = useWriteContract();

  const handleSwap = async () => {
    if (!address || !amountIn) return;
    setLoading(true);
    setSwapStatus(null);
    try {
      const amtInWei = parseEther(amountIn);
      const minAmtOutWei = calculatedAmountOut ? (calculatedAmountOut as bigint) * 98n / 100n : 0n; // 2% slippage

      // 1. Check & execute approval if needed
      const currentAllow = allowanceIn as bigint || 0n;
      if (currentAllow < amtInWei) {
        setSwapStatus({ type: "success", msg: "Approving token spending..." });
        const approveTx = await writeContractAsync({
          address: tIn.address,
          abi: tIn.abi,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.MultiTokenDEX, amtInWei],
        });
        setSwapStatus({ type: "success", msg: `Approve pending... Tx: ${approveTx.substring(0, 10)}...` });
        // Let's refetch allowance
        await new Promise(r => setTimeout(r, 4000));
        await refetchAllow();
      }

      // 2. Swap
      setSwapStatus({ type: "success", msg: "Submitting swap transaction..." });
      const swapTx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.MultiTokenDEX,
        abi: MultiTokenDEXABI,
        functionName: "swap",
        args: [tIn.address, tOut.address, amtInWei, minAmtOutWei, address],
      });

      setSwapStatus({ type: "success", msg: `Swap completed! Tx: ${swapTx.substring(0, 10)}...` });
      setAmountIn("");
      refetchBalIn();
      refetchBalOut();
      refetchAllow();
      refetchReserves();
    } catch (err) {
      const error = err as Error;
      setSwapStatus({ type: "error", msg: error.message || "Swap failed." });
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
  };

  return (
    <div className="glass-card" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2 style={{ color: "var(--neon-cyan)", marginTop: 0, marginBottom: "24px" }}>Token Swap</h2>

      {swapStatus && (
        <div className={swapStatus.type === "success" ? "success-banner" : "error-banner"}>
          {swapStatus.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{swapStatus.msg}</span>
        </div>
      )}

      {/* Input token */}
      <div className="form-group">
        <div className="swap-token-row">
          <label className="form-label" style={{ margin: 0, alignSelf: "center" }}>From</label>
          <span style={{ marginLeft: "auto", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Balance: {balanceIn !== undefined ? parseFloat(formatEther(balanceIn as bigint)).toFixed(2) : "0.00"}
          </span>
        </div>
        <div className="input-container">
          <input
            type="number"
            className="input-glow"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />
          <select 
            className="token-select" 
            style={{ position: "absolute", right: "6px" }}
            value={tokenIn}
            onChange={(e) => {
              setTokenIn(e.target.value);
              if (e.target.value === tokenOut) {
                setTokenOut(tokenIn);
              }
              setAmountIn("");
            }}
          >
            {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
          </select>
        </div>
      </div>

      <div className="swap-arrow" onClick={switchTokens}>
        <ArrowRightLeft size={24} style={{ transform: "rotate(90deg)" }} />
      </div>

      {/* Output token */}
      <div className="form-group">
        <div className="swap-token-row">
          <label className="form-label" style={{ margin: 0, alignSelf: "center" }}>To</label>
          <span style={{ marginLeft: "auto", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Balance: {balanceOut !== undefined ? parseFloat(formatEther(balanceOut as bigint)).toFixed(2) : "0.00"}
          </span>
        </div>
        <div className="input-container">
          <input
            type="text"
            className="input-glow"
            placeholder="0.0"
            disabled
            value={calculatedAmountOut ? parseFloat(formatEther(calculatedAmountOut as bigint)).toFixed(4) : "0.0"}
          />
          <select 
            className="token-select" 
            style={{ position: "absolute", right: "6px" }}
            value={tokenOut}
            onChange={(e) => {
              setTokenOut(e.target.value);
              if (e.target.value === tokenIn) {
                setTokenIn(tokenOut);
              }
              setAmountIn("");
            }}
          >
            {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
          </select>
        </div>
      </div>

      {/* Rate & Info */}
      {calculatedAmountOut && amountIn && (
        <div style={{ marginTop: "16px", marginBottom: "20px" }}>
          <div className="swap-info-row">
            <span>Exchange Rate:</span>
            <span className="swap-info-val">
              1 {tokenIn} = { (parseFloat(formatEther(calculatedAmountOut as bigint)) / parseFloat(amountIn)).toFixed(4) } {tokenOut}
            </span>
          </div>
          <div className="swap-info-row">
            <span>Pool Reserves:</span>
            <span className="swap-info-val">
              {reserves ? `${parseFloat(formatEther((reserves as [bigint, bigint])[0])).toFixed(2)} ${tokenIn} / ${parseFloat(formatEther((reserves as [bigint, bigint])[1])).toFixed(2)} ${tokenOut}` : "0.00 / 0.00"}
            </span>
          </div>
          <div className="swap-info-row">
            <span>Slippage Tolerance:</span>
            <span className="swap-info-val">2.0%</span>
          </div>
          <div className="swap-info-row">
            <span>Fee (0.3%):</span>
            <span className="swap-info-val">{(parseFloat(amountIn) * 0.003).toFixed(4)} {tokenIn}</span>
          </div>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleSwap}
        disabled={loading || !amountIn || parseFloat(amountIn) <= 0 || !address}
      >
        {loading ? <span className="loader"></span> : "Swap Tokens"}
      </button>
    </div>
  );
}

// ----------------------------------------------------
// LIQUIDITY / POOLS TAB
// ----------------------------------------------------
interface PoolCardProps {
  tokenA: typeof TOKENS[0];
  tokenB: typeof TOKENS[0];
  userAddress: `0x${string}` | undefined;
  refetchBalances: () => void;
}

function PoolCard({ tokenA, tokenB, userAddress, refetchBalances }: PoolCardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [lpToRemove, setLpToRemove] = useState("");
  const [poolStatus, setPoolStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Reserves
  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: CONTRACT_ADDRESSES.MultiTokenDEX,
    abi: MultiTokenDEXABI,
    functionName: "getReserves",
    args: [tokenA.address, tokenB.address],
    chainId: 11155111,
  });

  const resA = reserves ? (reserves as [bigint, bigint])[0] : 0n;
  const resB = reserves ? (reserves as [bigint, bigint])[1] : 0n;

  // LP shares of user
  const { data: lpShares, refetch: refetchShares } = useReadContract({
    address: CONTRACT_ADDRESSES.MultiTokenDEX,
    abi: MultiTokenDEXABI,
    functionName: "getLPShares",
    args: userAddress ? [tokenA.address, tokenB.address, userAddress] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!userAddress,
    },
  });

  // Allowance A
  const { data: allowanceA, refetch: refetchAllowA } = useReadContract({
    address: tokenA.address,
    abi: tokenA.abi,
    functionName: "allowance",
    args: userAddress ? [userAddress, CONTRACT_ADDRESSES.MultiTokenDEX] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!userAddress,
    },
  });

  // Allowance B
  const { data: allowanceB, refetch: refetchAllowB } = useReadContract({
    address: tokenB.address,
    abi: tokenB.abi,
    functionName: "allowance",
    args: userAddress ? [userAddress, CONTRACT_ADDRESSES.MultiTokenDEX] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!userAddress,
    },
  });

  const { writeContractAsync } = useWriteContract();

  // Optimal amount calculation
  const handleAmountAChange = (val: string) => {
    setAmountA(val);
    if (resA === 0n || resB === 0n) {
      // Allow free inputs when reserves are zero (uninitialized pool or failed reads)
      return;
    }
    if (!val || parseFloat(val) <= 0) {
      setAmountB("");
      return;
    }
    const valWei = parseEther(val);
    const optB = (valWei * resB) / resA;
    setAmountB(formatEther(optB));
  };

  const handleAmountBChange = (val: string) => {
    setAmountB(val);
    if (resA === 0n || resB === 0n) {
      // Allow free inputs when reserves are zero (uninitialized pool or failed reads)
      return;
    }
    if (!val || parseFloat(val) <= 0) {
      setAmountA("");
      return;
    }
    const valWei = parseEther(val);
    const optA = (valWei * resA) / resB;
    setAmountA(formatEther(optA));
  };

  const handleAddLiquidity = async () => {
    if (!userAddress || !amountA || !amountB) return;
    setLoading(true);
    setPoolStatus(null);
    try {
      const wA = parseEther(amountA);
      const wB = parseEther(amountB);

      // Check approvals
      const allowA = allowanceA as bigint || 0n;
      const allowB = allowanceB as bigint || 0n;

      if (allowA < wA) {
        setPoolStatus({ type: "success", msg: `Approving ${tokenA.symbol}...` });
        const txAppA = await writeContractAsync({
          address: tokenA.address,
          abi: tokenA.abi,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.MultiTokenDEX, wA * 2n],
        });
        setPoolStatus({ type: "success", msg: `Approved ${tokenA.symbol}. pending tx: ${txAppA.substring(0, 10)}...` });
        await new Promise(r => setTimeout(r, 4000));
        await refetchAllowA();
      }

      if (allowB < wB) {
        setPoolStatus({ type: "success", msg: `Approving ${tokenB.symbol}...` });
        const txAppB = await writeContractAsync({
          address: tokenB.address,
          abi: tokenB.abi,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.MultiTokenDEX, wB * 2n],
        });
        setPoolStatus({ type: "success", msg: `Approved ${tokenB.symbol}. pending tx: ${txAppB.substring(0, 10)}...` });
        await new Promise(r => setTimeout(r, 4000));
        await refetchAllowB();
      }

      setPoolStatus({ type: "success", msg: "Adding Liquidity..." });
      const addTx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.MultiTokenDEX,
        abi: MultiTokenDEXABI,
        functionName: "addLiquidity",
        args: [tokenA.address, tokenB.address, wA, wB],
      });

      setPoolStatus({ type: "success", msg: `Liquidity Added! Tx: ${addTx.substring(0, 10)}...` });
      setAmountA("");
      setAmountB("");
      refetchReserves();
      refetchShares();
      refetchBalances();
      setTimeout(() => setShowAddModal(false), 2000);
    } catch (err) {
      const error = err as Error;
      setPoolStatus({ type: "error", msg: error.message || "Failed to add liquidity." });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!userAddress || !lpToRemove) return;
    setLoading(true);
    setPoolStatus(null);
    try {
      const sharesWei = parseEther(lpToRemove);

      setPoolStatus({ type: "success", msg: "Removing Liquidity..." });
      const removeTx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.MultiTokenDEX,
        abi: MultiTokenDEXABI,
        functionName: "removeLiquidity",
        args: [tokenA.address, tokenB.address, sharesWei],
      });

      setPoolStatus({ type: "success", msg: `Liquidity Removed! Tx: ${removeTx.substring(0, 10)}...` });
      setLpToRemove("");
      refetchReserves();
      refetchShares();
      refetchBalances();
      setTimeout(() => setShowRemoveModal(false), 2000);
    } catch (err) {
      const error = err as Error;
      setPoolStatus({ type: "error", msg: error.message || "Failed to remove liquidity." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card pool-card">
      <div className="pool-pair">
        <span>{tokenA.symbol} - {tokenB.symbol}</span>
        <Droplet className="text-cyan" size={20} />
      </div>

      <div className="pool-detail-row">
        <span className="pool-detail-label">Pool Reserves:</span>
        <span className="pool-detail-value">
          {parseFloat(formatEther(resA)).toFixed(2)} {tokenA.symbol} / {parseFloat(formatEther(resB)).toFixed(2)} {tokenB.symbol}
        </span>
      </div>

      <div className="pool-detail-row">
        <span className="pool-detail-label">Your Share:</span>
        <span className="pool-detail-value" style={{ color: "var(--neon-green)" }}>
          {lpShares !== undefined ? parseFloat(formatEther(lpShares as bigint)).toFixed(4) : "0.0000"} LP
        </span>
      </div>

      <div className="pool-actions">
        <button className="btn-secondary" onClick={() => { setPoolStatus(null); setShowAddModal(true); }}>
          <Plus size={16} style={{ marginRight: "4px" }} /> Add Liquidity
        </button>
        {lpShares && (lpShares as bigint) > 0n ? (
          <button className="btn-secondary" style={{ borderColor: "var(--neon-magenta)", color: "var(--neon-magenta)" }} onClick={() => { setPoolStatus(null); setShowRemoveModal(true); }}>
            <Minus size={16} style={{ marginRight: "4px" }} /> Remove Liquidity
          </button>
        ) : null}
      </div>

      {/* Add Liquidity Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: "var(--neon-cyan)", marginTop: 0 }}>Add Liquidity</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Provide liquidity to the {tokenA.symbol}-{tokenB.symbol} pool to earn trading fees.
            </p>

            {poolStatus && (
              <div className={poolStatus.type === "success" ? "success-banner" : "error-banner"}>
                <span>{poolStatus.msg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{tokenA.symbol} Input</label>
              <div className="input-container">
                <input
                  type="number"
                  className="input-glow"
                  placeholder="0.0"
                  value={amountA}
                  onChange={(e) => handleAmountAChange(e.target.value)}
                />
                <span className="input-suffix">{tokenA.symbol}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{tokenB.symbol} (Optimal)</label>
              <div className="input-container">
                <input
                  type="number"
                  className="input-glow"
                  placeholder="0.0"
                  value={amountB}
                  onChange={(e) => handleAmountBChange(e.target.value)}
                />
                <span className="input-suffix">{tokenB.symbol}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button className="btn-primary" onClick={handleAddLiquidity} disabled={loading || !amountA || !amountB}>
                {loading ? <span className="loader"></span> : "Supply"}
              </button>
              <button className="btn-secondary" style={{ width: "30%" }} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Liquidity Modal */}
      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: "var(--neon-magenta)", marginTop: 0 }}>Remove Liquidity</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Burn your LP shares to withdraw your assets from the pool. Max: {lpShares ? formatEther(lpShares as bigint) : "0.0"} LP
            </p>

            {poolStatus && (
              <div className={poolStatus.type === "success" ? "success-banner" : "error-banner"}>
                <span>{poolStatus.msg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">LP Shares to Burn</label>
              <div className="input-container">
                <input
                  type="number"
                  className="input-glow"
                  placeholder="0.0"
                  value={lpToRemove}
                  onChange={(e) => setLpToRemove(e.target.value)}
                />
                <span className="input-suffix">LP</span>
              </div>
              <button 
                className="btn-secondary" 
                style={{ marginTop: "8px", padding: "4px 8px", fontSize: "0.8rem", width: "auto" }}
                onClick={() => setLpToRemove(lpShares ? formatEther(lpShares as bigint) : "")}
              >
                Max
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button 
                className="btn-primary" 
                style={{ background: "linear-gradient(135deg, var(--neon-magenta), var(--neon-purple))" }} 
                onClick={handleRemoveLiquidity} 
                disabled={loading || !lpToRemove}
              >
                {loading ? <span className="loader"></span> : "Withdraw"}
              </button>
              <button className="btn-secondary" style={{ width: "30%" }} onClick={() => setShowRemoveModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PoolsTab({ refetchBalances }: { refetchBalances: () => void }) {
  const { address } = useAccount();

  return (
    <div>
      <h2 style={{ color: "var(--neon-cyan)", textAlign: "center", marginBottom: "24px" }}>Liquidity Pools</h2>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "700px", margin: "0 auto 32px" }}>
        By adding liquidity to standard constant product pools, you facilitate decentralized trading on the platform and earn a proportional share of the 0.3% protocol fee.
      </p>

      <div className="pools-grid">
        <PoolCard tokenA={TOKENS[0]} tokenB={TOKENS[1]} userAddress={address} refetchBalances={refetchBalances} />
        <PoolCard tokenA={TOKENS[0]} tokenB={TOKENS[2]} userAddress={address} refetchBalances={refetchBalances} />
        <PoolCard tokenA={TOKENS[1]} tokenB={TOKENS[2]} userAddress={address} refetchBalances={refetchBalances} />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MARKETPLACE TAB
// ----------------------------------------------------
const resolveTokenURI = (uri: string) => {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return uri;
};

interface NFTCardProps {
  tokenId: number;
  userAddress: `0x${string}` | undefined;
  refetchBalances: () => void;
}

function NFTCard({ tokenId, userAddress, refetchBalances }: NFTCardProps) {
  const [metadata, setMetadata] = useState<{ name: string; description: string; image: string } | null>(null);
  const [paymentToken, setPaymentToken] = useState<string>("DNFT");
  const [purchaseStatus, setPurchaseStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [resalePrice, setResalePrice] = useState("");
  const [listingStatus, setListingStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedToken = TOKENS.find(t => t.symbol === paymentToken)!;

  // Read tokenURI from contract
  const { data: rawTokenURI } = useReadContract({
    address: CONTRACT_ADDRESSES.NFTCollection,
    abi: NFTCollectionABI,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
    chainId: 11155111,
  });

  // Load metadata with IPFS resolution and local fallback
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const uriToFetch = rawTokenURI ? resolveTokenURI(rawTokenURI as string) : `/metadata/nft_${tokenId}.json`;
        const res = await fetch(uriToFetch);
        if (!res.ok) throw new Error("Metadata fetch failed");
        const data = await res.json();
        if (data && data.image) {
          data.image = resolveTokenURI(data.image);
        }
        setMetadata(data);
      } catch (err) {
        console.error("Error loading NFT metadata, trying local fallback:", err);
        try {
          const fallbackRes = await fetch(`/metadata/nft_${tokenId}.json`);
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            setMetadata(fallbackData);
          } else {
            // Fallback placeholder
            setMetadata({
              name: `Virtual Art #${tokenId}`,
              description: `A premium virtual art piece from our collection. Token ID #${tokenId}.`,
              image: `/images/nft_${tokenId % 10}.png`
            });
          }
        } catch (e) {
          console.error("Fallback metadata fetch also failed:", e);
        }
      }
    };
    fetchMetadata();
  }, [tokenId, rawTokenURI]);

  // Read listing details
  const { data: listingData, refetch: refetchListing } = useReadContract({
    address: CONTRACT_ADDRESSES.NFTMarketplace,
    abi: NFTMarketplaceABI,
    functionName: "listings",
    args: [BigInt(tokenId)],
    chainId: 11155111,
  });

  const seller = listingData ? (listingData as [string, bigint, boolean])[0] : "";
  const priceDNFT = listingData ? (listingData as [string, bigint, boolean])[1] : 0n;
  const isListed = listingData ? (listingData as [string, bigint, boolean])[2] : false;

  // Read ownerOf
  const { data: currentOwner, refetch: refetchOwner } = useReadContract({
    address: CONTRACT_ADDRESSES.NFTCollection,
    abi: NFTCollectionABI,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
    chainId: 11155111,
  });

  // Read approved address for listing
  const { data: approvedAddress, refetch: refetchApproved } = useReadContract({
    address: CONTRACT_ADDRESSES.NFTCollection,
    abi: NFTCollectionABI,
    functionName: "getApproved",
    args: [BigInt(tokenId)],
    chainId: 11155111,
  });

  // Convert price dynamically via DEX view
  const { data: convertedPrice, refetch: refetchConvertedPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.NFTMarketplace,
    abi: NFTMarketplaceABI,
    functionName: "calculatePriceInToken",
    args: [BigInt(tokenId), selectedToken.address],
    chainId: 11155111,
    query: {
      enabled: isListed
    }
  });

  // Allowance check for buying
  const { data: allowance, refetch: refetchAllow } = useReadContract({
    address: selectedToken.address,
    abi: selectedToken.abi,
    functionName: "allowance",
    args: userAddress ? [userAddress, CONTRACT_ADDRESSES.NFTMarketplace] : undefined,
    chainId: 11155111,
    query: {
      enabled: isListed && !!userAddress
    }
  });

  const { writeContractAsync } = useWriteContract();

  const handlePurchase = async () => {
    if (!userAddress) return;
    setLoading(true);
    setPurchaseStatus(null);
    try {
      const requiredAmt = convertedPrice as bigint || priceDNFT;

      // 1. Approve if needed
      const currentAllow = allowance as bigint || 0n;
      if (currentAllow < requiredAmt) {
        setPurchaseStatus({ type: "success", msg: `Approving ${selectedToken.symbol} payment...` });
        const approveTx = await writeContractAsync({
          address: selectedToken.address,
          abi: selectedToken.abi,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.NFTMarketplace, requiredAmt],
        });
        setPurchaseStatus({ type: "success", msg: `Approval pending... Tx: ${approveTx.substring(0, 10)}...` });
        await new Promise(r => setTimeout(r, 4500));
        await refetchAllow();
      }

      // 2. Buy
      setPurchaseStatus({ type: "success", msg: "Completing purchase..." });
      let buyTx;
      if (paymentToken === "DNFT") {
        buyTx = await writeContractAsync({
          address: CONTRACT_ADDRESSES.NFTMarketplace,
          abi: NFTMarketplaceABI,
          functionName: "buyNFTWithPlatformToken",
          args: [BigInt(tokenId)],
        });
      } else {
        buyTx = await writeContractAsync({
          address: CONTRACT_ADDRESSES.NFTMarketplace,
          abi: NFTMarketplaceABI,
          functionName: "buyNFTWithToken",
          args: [BigInt(tokenId), selectedToken.address],
        });
      }

      setPurchaseStatus({ type: "success", msg: `NFT purchased! Tx: ${buyTx.substring(0, 10)}...` });
      refetchListing();
      refetchOwner();
      refetchBalances();
    } catch (err) {
      const error = err as Error;
      setPurchaseStatus({ type: "error", msg: error.message || "Purchase transaction failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleListResale = async () => {
    if (!userAddress || !resalePrice) return;
    setLoading(true);
    setListingStatus(null);
    try {
      const priceWei = parseEther(resalePrice);
      if (priceWei <= 0n) {
        throw new Error("Price must be greater than zero");
      }

      // 1. Check approval
      if (approvedAddress?.toLowerCase() !== CONTRACT_ADDRESSES.NFTMarketplace.toLowerCase()) {
        setListingStatus({ type: "success", msg: "Approving marketplace to escrow NFT..." });
        const approveTx = await writeContractAsync({
          address: CONTRACT_ADDRESSES.NFTCollection,
          abi: NFTCollectionABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.NFTMarketplace, BigInt(tokenId)],
        });
        setListingStatus({ type: "success", msg: `Approval pending... Tx: ${approveTx.substring(0, 10)}...` });
        await new Promise(r => setTimeout(r, 4500));
        await refetchApproved();
      }

      // 2. List NFT
      setListingStatus({ type: "success", msg: "Listing NFT on marketplace..." });
      const listTx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.NFTMarketplace,
        abi: NFTMarketplaceABI,
        functionName: "listNFT",
        args: [BigInt(tokenId), priceWei],
      });

      setListingStatus({ type: "success", msg: `NFT listed! Tx: ${listTx.substring(0, 10)}...` });
      setResalePrice("");
      refetchListing();
      refetchOwner();
      refetchBalances();
    } catch (err) {
      const error = err as Error;
      setListingStatus({ type: "error", msg: error.message || "Listing failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelListing = async () => {
    if (!userAddress) return;
    setLoading(true);
    setPurchaseStatus(null);
    try {
      setPurchaseStatus({ type: "success", msg: "Cancelling listing..." });
      const cancelTx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.NFTMarketplace,
        abi: NFTMarketplaceABI,
        functionName: "cancelListing",
        args: [BigInt(tokenId)],
      });

      setPurchaseStatus({ type: "success", msg: `Listing cancelled! Tx: ${cancelTx.substring(0, 10)}...` });
      refetchListing();
      refetchOwner();
      refetchBalances();
    } catch (err) {
      const error = err as Error;
      setPurchaseStatus({ type: "error", msg: error.message || "Cancellation failed." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isListed) {
      refetchConvertedPrice();
      refetchAllow();
    }
  }, [paymentToken, isListed, refetchConvertedPrice, refetchAllow]);

  if (!metadata) {
    return (
      <div className="nft-card" style={{ minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="loader" style={{ marginBottom: "16px", borderTopColor: "var(--neon-cyan)" }}></div>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Loading NFT #{tokenId} data...</span>
      </div>
    );
  }

  const isSeller = seller?.toLowerCase() === userAddress?.toLowerCase();
  const isOwner = currentOwner?.toLowerCase() === userAddress?.toLowerCase();

  return (
    <div className="nft-card">
      <div className="nft-image-container">
        <img className="nft-image" src={metadata.image} alt={metadata.name} onError={(e) => { (e.target as HTMLImageElement).src = `/images/nft_${tokenId % 10}.png`; }} />
        <span className={`nft-badge ${!isListed ? "sold" : ""}`}>
          {isListed ? "Listed" : "Owned"}
        </span>
      </div>

      <div className="nft-details">
        <h4 className="nft-name">{metadata.name}</h4>
        <p className="nft-desc">{metadata.description}</p>

        {isListed ? (
          <>
            <div className="nft-price-section">
              <span className="nft-price-label">Price</span>
              <span className="nft-price-value">{formatEther(priceDNFT)} DNFT</span>
            </div>

            {seller && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
                <span>Seller:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--neon-cyan)" }}>{formatAddress(seller)}</span>
              </div>
            )}

            {isSeller ? (
              <div className="nft-purchase-area">
                <p style={{ fontSize: "0.85rem", color: "var(--neon-green)", margin: "4px 0", textAlign: "center" }}>
                  You listed this item.
                </p>
                {purchaseStatus && (
                  <div className={purchaseStatus.type === "success" ? "success-banner" : "error-banner"} style={{ padding: "8px", fontSize: "0.8rem", margin: "4px 0" }}>
                    <span>{purchaseStatus.msg}</span>
                  </div>
                )}
                <button
                  className="btn-primary"
                  style={{ padding: "10px", fontSize: "0.9rem", background: "linear-gradient(135deg, var(--neon-magenta), var(--neon-purple))" }}
                  onClick={handleCancelListing}
                  disabled={loading}
                >
                  {loading ? <span className="loader"></span> : "Cancel Listing"}
                </button>
              </div>
            ) : (
              <div className="nft-purchase-area">
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", minWidth: "45px" }}>Pay with:</span>
                  <select 
                    className="purchase-select"
                    value={paymentToken}
                    onChange={(e) => setPaymentToken(e.target.value)}
                  >
                    {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                  </select>
                </div>

                {paymentToken !== "DNFT" && convertedPrice !== undefined && (
                  <div className="pool-detail-row" style={{ marginTop: "4px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Swap Cost:</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--neon-cyan)" }}>
                      ~{parseFloat(formatEther(convertedPrice as bigint)).toFixed(2)} {paymentToken}
                    </span>
                  </div>
                )}

                {purchaseStatus && (
                  <div className={purchaseStatus.type === "success" ? "success-banner" : "error-banner"} style={{ padding: "8px", fontSize: "0.8rem", margin: "4px 0" }}>
                    <span>{purchaseStatus.msg}</span>
                  </div>
                )}

                <button
                  className="btn-primary"
                  style={{ padding: "10px", fontSize: "0.9rem", background: "linear-gradient(135deg, var(--neon-magenta), var(--neon-purple))" }}
                  onClick={handlePurchase}
                  disabled={loading || !userAddress}
                >
                  {loading ? <span className="loader"></span> : "Buy NFT"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "12px" }}>
            {isOwner ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--neon-green)", marginBottom: "4px" }}>
                  ✓ You own this NFT
                </div>
                <div className="input-container" style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="number"
                    placeholder="Price in DNFT"
                    value={resalePrice}
                    onChange={(e) => setResalePrice(e.target.value)}
                    style={{
                      flexGrow: 1,
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "6px",
                      color: "white",
                      padding: "6px 10px",
                      fontSize: "0.85rem"
                    }}
                  />
                  <button
                    className="btn-primary"
                    style={{
                      width: "auto",
                      padding: "6px 12px",
                      fontSize: "0.85rem",
                      background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-blue))"
                    }}
                    onClick={handleListResale}
                    disabled={loading || !resalePrice}
                  >
                    List
                  </button>
                </div>
                {listingStatus && (
                  <div className={listingStatus.type === "success" ? "success-banner" : "error-banner"} style={{ padding: "6px", fontSize: "0.75rem", margin: 0 }}>
                    <span>{listingStatus.msg}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Owned by: <span style={{ fontFamily: "var(--font-mono)", color: "var(--neon-green)" }}>
                  {currentOwner ? formatAddress(currentOwner as string) : "Loading..."}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MarketplaceTab({ refetchBalances }: { refetchBalances: () => void }) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Query marketplace owner
  const { data: marketplaceOwner } = useReadContract({
    address: CONTRACT_ADDRESSES.NFTMarketplace,
    abi: NFTMarketplaceABI,
    functionName: "owner",
    chainId: 11155111,
  });

  const isAdmin = address && marketplaceOwner && address.toLowerCase() === (marketplaceOwner as string).toLowerCase();

  // Query owners for token IDs 0 to 29 dynamically
  const { data: ownersData, refetch: refetchOwners } = useReadContracts({
    contracts: Array.from({ length: 5 }, (_, id) => ({
      address: CONTRACT_ADDRESSES.NFTCollection,
      abi: NFTCollectionABI,
      functionName: "ownerOf",
      args: [BigInt(id)],
    })),
    chainId: 11155111,
  });

  const existingTokenIds = useMemo(() => {
    if (ownersData) {
      const ids: number[] = [];
      ownersData.forEach((res, id) => {
        if (res.status === "success") {
          ids.push(id);
        }
      });
      return ids.length === 0 ? Array.from({ length: 5 }, (_, i) => i) : ids;
    }
    return Array.from({ length: 5 }, (_, i) => i);
  }, [ownersData]);

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [newNftUri, setNewNftUri] = useState("");
  const [newNftPrice, setNewNftPrice] = useState("");
  const [adminStatus, setAdminStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminMintAndList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNftUri || !newNftPrice) return;
    setAdminLoading(true);
    setAdminStatus(null);

    try {
      const priceWei = parseEther(newNftPrice);
      if (priceWei <= 0n) {
        throw new Error("Price must be greater than zero");
      }

      setAdminStatus({ type: "success", msg: "Minting and listing NFT on marketplace..." });
      
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.NFTMarketplace,
        abi: NFTMarketplaceABI,
        functionName: "mintAndListNFT",
        args: [newNftUri, priceWei],
      });

      setAdminStatus({ type: "success", msg: `NFT minted & listed! Tx: ${tx.substring(0, 10)}...` });
      setNewNftUri("");
      setNewNftPrice("");
      refetchBalances();
      await new Promise(r => setTimeout(r, 4500));
      await refetchOwners();
    } catch (err) {
      const error = err as Error;
      setAdminStatus({ type: "error", msg: error.message || "Transaction failed." });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: "var(--neon-magenta)", textAlign: "center", marginBottom: "24px" }}>Digital NFT Art</h2>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "700px", margin: "0 auto 32px" }}>
        Explore our premium virtual art collection. Purchase instantly using your Platform tokens, or let the integrated Multi-Token DEX perform an automated Swap from Token A or Token B on-the-fly.
      </p>

      {isAdmin && (
        <div className={`admin-panel ${isAdminPanelOpen ? "open" : ""}`} style={{ marginBottom: "32px" }}>
          <div className="admin-header" onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}>
            <div className="admin-header-title">
              <Sparkles className="text-cyan" size={20} />
              <span>Admin: Mint and List New NFT</span>
            </div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {isAdminPanelOpen ? "[ Collapse ]" : "[ Expand Admin Panel ]"}
            </span>
          </div>
          {isAdminPanelOpen && (
            <form onSubmit={handleAdminMintAndList} className="admin-body">
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                As contract owner, you can mint a new NFT directly into the Marketplace escrow and list it for sale.
              </p>
              <div className="admin-form">
                <div className="input-box" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Token URI / IPFS CID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /metadata/nft_0.json or ipfs://Qm..."
                    value={newNftUri}
                    onChange={(e) => setNewNftUri(e.target.value)}
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--border-glow)",
                      borderRadius: "6px",
                      color: "white",
                      padding: "8px 12px",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
                <div className="input-box" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Price (DNFT)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 100"
                    value={newNftPrice}
                    onChange={(e) => setNewNftPrice(e.target.value)}
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--border-glow)",
                      borderRadius: "6px",
                      color: "white",
                      padding: "8px 12px",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-blue))",
                    alignSelf: "end"
                  }}
                  disabled={adminLoading}
                >
                  {adminLoading ? <span className="loader"></span> : "Mint & List"}
                </button>
              </div>
              {adminStatus && (
                <div className={adminStatus.type === "success" ? "success-banner" : "error-banner"} style={{ margin: 0 }}>
                  <span>{adminStatus.msg}</span>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      <div className="marketplace-grid">
        {existingTokenIds.map(id => (
          <NFTCard key={id} tokenId={id} userAddress={address} refetchBalances={refetchBalances} />
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// PORTFOLIO TAB
// ----------------------------------------------------
function PortfolioTab() {
  const { address } = useAccount();

  // ETH Balance
  const { data: ethBalance } = useBalance({
    address: address,
    chainId: 11155111,
  });

  // Token Balances
  const { data: dnftBal } = useReadContract({
    address: CONTRACT_ADDRESSES.PlatformToken,
    abi: PlatformTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { data: tknaBal } = useReadContract({
    address: CONTRACT_ADDRESSES.TokenA,
    abi: TokenAABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { data: tknbBal } = useReadContract({
    address: CONTRACT_ADDRESSES.TokenB,
    abi: TokenBABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  // LP shares of user in all 3 pools
  const { data: lpAB } = useReadContract({
    address: CONTRACT_ADDRESSES.MultiTokenDEX,
    abi: MultiTokenDEXABI,
    functionName: "getLPShares",
    args: address ? [CONTRACT_ADDRESSES.PlatformToken, CONTRACT_ADDRESSES.TokenA, address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { data: lpBB } = useReadContract({
    address: CONTRACT_ADDRESSES.MultiTokenDEX,
    abi: MultiTokenDEXABI,
    functionName: "getLPShares",
    args: address ? [CONTRACT_ADDRESSES.PlatformToken, CONTRACT_ADDRESSES.TokenB, address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { data: lpA_B } = useReadContract({
    address: CONTRACT_ADDRESSES.MultiTokenDEX,
    abi: MultiTokenDEXABI,
    functionName: "getLPShares",
    args: address ? [CONTRACT_ADDRESSES.TokenA, CONTRACT_ADDRESSES.TokenB, address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  // Gallery of owned NFTs
  // We can query ownerOf for each of the 30 tokens to find owned ones
  const { data: ownersData } = useReadContracts({
    contracts: Array.from({ length: 5 }, (_, id) => ({
      address: CONTRACT_ADDRESSES.NFTCollection,
      abi: NFTCollectionABI,
      functionName: "ownerOf",
      args: [BigInt(id)],
    })),
    chainId: 11155111,
    query: {
      enabled: !!address,
    }
  });

  const ownedNfts = useMemo(() => {
    if (!address || !ownersData) {
      return [];
    }
    const owned: number[] = [];
    ownersData.forEach((res, id) => {
      if (res.status === "success" && typeof res.result === "string") {
        if (res.result.toLowerCase() === address.toLowerCase()) {
          owned.push(id);
        }
      }
    });
    return owned;
  }, [address, ownersData]);

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: "32px" }}>
        <div className="portfolio-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <User className="text-cyan" size={32} />
            <h3 style={{ margin: 0 }}>Wallet Profile</h3>
          </div>
          {address ? (
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--neon-cyan)", fontSize: "1.1rem" }}>
              {address}
            </span>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>Not Connected</span>
          )}
        </div>

        {/* Token balances */}
        <h4 style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>Asset Balances</h4>
        <div className="token-balances-card">
          <div className="token-balance-box">
            <div className="token-balance-symbol">ETH</div>
            <div className="token-balance-val">
              {ethBalance ? parseFloat(formatEther(ethBalance.value)).toFixed(4) : "0.00"}
            </div>
          </div>
          <div className="token-balance-box">
            <div className="token-balance-symbol">DNFT</div>
            <div className="token-balance-val">
              {dnftBal !== undefined ? parseFloat(formatEther(dnftBal as bigint)).toFixed(2) : "0.00"}
            </div>
          </div>
          <div className="token-balance-box">
            <div className="token-balance-symbol">UTNA</div>
            <div className="token-balance-val">
              {tknaBal !== undefined ? parseFloat(formatEther(tknaBal as bigint)).toFixed(2) : "0.00"}
            </div>
          </div>
          <div className="token-balance-box">
            <div className="token-balance-symbol">UTNB</div>
            <div className="token-balance-val">
              {tknbBal !== undefined ? parseFloat(formatEther(tknbBal as bigint)).toFixed(2) : "0.00"}
            </div>
          </div>
        </div>

        {/* LP reserves */}
        <h4 style={{ color: "var(--text-secondary)", marginTop: "32px", marginBottom: "16px" }}>Liquidity Pool Shares</h4>
        <div className="token-balances-card">
          <div className="token-balance-box">
            <div className="token-balance-symbol">DNFT-UTNA</div>
            <div className="token-balance-val" style={{ color: "var(--neon-green)" }}>
              {lpAB !== undefined ? parseFloat(formatEther(lpAB as bigint)).toFixed(4) : "0.0000"} LP
            </div>
          </div>
          <div className="token-balance-box">
            <div className="token-balance-symbol">DNFT-UTNB</div>
            <div className="token-balance-val" style={{ color: "var(--neon-green)" }}>
              {lpBB !== undefined ? parseFloat(formatEther(lpBB as bigint)).toFixed(4) : "0.0000"} LP
            </div>
          </div>
          <div className="token-balance-box">
            <div className="token-balance-symbol">UTNA-UTNB</div>
            <div className="token-balance-val" style={{ color: "var(--neon-green)" }}>
              {lpA_B !== undefined ? parseFloat(formatEther(lpA_B as bigint)).toFixed(4) : "0.0000"} LP
            </div>
          </div>
        </div>
      </div>

      {/* Owned NFTs */}
      <h3 style={{ color: "var(--neon-magenta)", marginBottom: "24px" }}>My Art Collection ({ownedNfts.length})</h3>
      {ownedNfts.length === 0 ? (
        <div className="glass-card" style={{ padding: "40px", color: "var(--text-secondary)" }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
          <p>No NFTs found in your wallet. Purchase collectibles in the marketplace to start your gallery.</p>
        </div>
      ) : (
        <div className="marketplace-grid">
          {ownedNfts.map(id => (
            <NFTCard key={id} tokenId={id} userAddress={address} refetchBalances={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// ROOT CONNECTOR & MAIN NAVIGATION
// ----------------------------------------------------
function MainDashboard() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const SEPOLIA_CHAIN_ID = 11155111;
  const isWrongNetwork = isConnected && chainId !== SEPOLIA_CHAIN_ID;
  
  const [activeTab, setActiveTab] = useState<"faucet" | "swap" | "pools" | "marketplace" | "portfolio">("faucet");

  // Read balances for refreshing
  const { refetch: refetchDNFT } = useReadContract({
    address: CONTRACT_ADDRESSES.PlatformToken,
    abi: PlatformTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { refetch: refetchA } = useReadContract({
    address: CONTRACT_ADDRESSES.TokenA,
    abi: TokenAABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const { refetch: refetchB } = useReadContract({
    address: CONTRACT_ADDRESSES.TokenB,
    abi: TokenBABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const refetchAllBalances = () => {
    refetchDNFT();
    refetchA();
    refetchB();
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <Coins className="logo-icon" size={32} />
          <h1 className="logo-text">METACHAIN</h1>
        </div>
        
        {isConnected && address ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Network: <b style={{ color: isWrongNetwork ? "var(--neon-magenta)" : "var(--neon-cyan)" }}>
                {isWrongNetwork ? `⚠ Wrong Network (Chain ${chainId})` : "Sepolia Testnet"}
              </b>
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", background: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: "6px" }}>
              {formatAddress(address)}
            </span>
            <button className="btn-disconnect" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            className="btn-connect" 
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect Wallet
          </button>
        )}
      </header>

      {/* Wrong Network Banner */}
      {isWrongNetwork && (
        <div className="wrong-network-banner">
          <div className="wrong-network-inner">
            <AlertTriangle size={28} style={{ flexShrink: 0, color: "var(--neon-magenta)" }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: "var(--neon-magenta)" }}>Wrong Network Detected</p>
              <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                You are on Chain ID <b>{chainId}</b>. This app requires <b>Sepolia Testnet</b> (Chain ID: 11155111).
                Your Sepolia ETH will work once you switch.
              </p>
            </div>
            <button
              className="btn-primary"
              style={{ flexShrink: 0, padding: "10px 24px", background: "linear-gradient(135deg, var(--neon-magenta), var(--neon-purple))" }}
              onClick={() => switchChain({ chainId: 11155111 })}
              disabled={isSwitching}
            >
              {isSwitching ? <span className="loader" /> : "Switch to Sepolia"}
            </button>
          </div>
        </div>
      )}

      {/* Connection warning */}
      {!isConnected && (
        <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
          <Wallet size={48} className="text-cyan" style={{ marginBottom: "16px" }} />
          <h3>Connect to MetaMask</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            To interact with the Faucet, swap tokens on the DEX, add liquidity, or trade NFTs, please connect your Sepolia Web3 wallet.
          </p>
          <button 
            className="btn-connect" 
            style={{ width: "200px" }}
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect MetaMask
          </button>
        </div>
      )}

      {isConnected && !isWrongNetwork && (
        <>
          {/* Navigation */}
          <nav className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === "faucet" ? "active" : ""}`}
              onClick={() => setActiveTab("faucet")}
            >
              Faucet
            </button>
            <button 
              className={`tab-btn ${activeTab === "swap" ? "active" : ""}`}
              onClick={() => setActiveTab("swap")}
            >
              Swap
            </button>
            <button 
              className={`tab-btn ${activeTab === "pools" ? "active" : ""}`}
              onClick={() => setActiveTab("pools")}
            >
              Pools
            </button>
            <button 
              className={`tab-btn ${activeTab === "marketplace" ? "active" : ""}`}
              onClick={() => setActiveTab("marketplace")}
            >
              Marketplace
            </button>
            <button 
              className={`tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
              onClick={() => setActiveTab("portfolio")}
            >
              Portfolio
            </button>
          </nav>

          {/* Main Area */}
          <main style={{ flexGrow: 1 }}>
            {activeTab === "faucet" && <FaucetTab />}
            {activeTab === "swap" && <SwapTab />}
            {activeTab === "pools" && <PoolsTab refetchBalances={refetchAllBalances} />}
            {activeTab === "marketplace" && <MarketplaceTab refetchBalances={refetchAllBalances} />}
            {activeTab === "portfolio" && <PortfolioTab />}
          </main>
        </>
      )}

      {/* Footer */}
      <footer style={{ marginTop: "auto", paddingTop: "40px", paddingBottom: "16px", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <p>MetaChain Decentralized Swap & NFT Marketplace • Running on Sepolia Network (Chain ID: 11155111)</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MainDashboard />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
