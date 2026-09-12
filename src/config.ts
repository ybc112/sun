/**
 * 全局配置：链上地址与后端地址（硬编码，不依赖环境变量）。
 * 后端地址留空 = 同源（前端与后端部署在同一域名/反向代理下时自动连通）。
 */
export const config = {
  chainId: 56,
  nativeSymbol: "BNB",
  /** BANANA 专用 KimiMintLaunchFactory（2026-09-12 部署，全新空合约，后缀 0x7777） */
  factoryAddress: "0x636E56b3c3DB1d2FeEff2526E00B877274d968Af",
  rpcUrl: "https://bsc.publicnode.com",
  /** 后端地址。留空 = 同源（dev 走 vite proxy /api） */
  backendUrl: "",
  /** 靓号后缀，后端以链上 requiredTokenSuffix 为准，这里仅作默认展示 */
  vanitySuffix: "7777",
  /** 本地挖盐最大迭代（默认走后端矿机） */
  vanityMaxIterations: 600000,
  /** 链上精确的 KimiMintToken creation bytecode（可选，来自服务器 pristine 文件） */
  tokenCreationHex: "",
  /** 默认分红代币（USDT on BSC） */
  defaultRewardToken: "0x55d398326f99059fF775485246999027B3197955",
};

export const EXPLORER_BASE = config.chainId === 97 ? "https://testnet.bscscan.com" : "https://bscscan.com";

export const fmtAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";