import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DEXModule", (m) => {
  // Deploy UmairToken contract (Token A) with 1,000,000 supply
  const tokenA = m.contract("UmairToken", [1000000n * 10n**18n]);

  // Deploy Token B - Umair Token B (UTB365)
  const tokenB = m.contract("TokenB");

  // Deploy SimpleSwap contract with both token addresses
  const simpleSwap = m.contract("SimpleSwap", [tokenA, tokenB]);

  return { tokenA, tokenB, simpleSwap };
});
