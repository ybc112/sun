/** 全局配置：链上地址与环境变量 */
export const config = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID || 56),
  nativeSymbol: String(import.meta.env.VITE_NATIVE_SYMBOL || "BNB"),
  factoryAddress: String(
    import.meta.env.VITE_MINT_FACTORY_ADDRESS ||
      "0xE1CD783bcE52E8945B0FB539AA106aa35b08879e",
  ),
  rpcUrl: String(
    import.meta.env.VITE_BSC_RPC_URL || "https://bsc.publicnode.com",
  ),
  /** 后端地址。留空 = 同源（dev 走 vite proxy /api） */
  backendUrl: String(import.meta.env.VITE_BACKEND_URL || ""),
  /** 靓号后缀，后端以链上 requiredTokenSuffix 为准，这里仅作默认展示 */
  vanitySuffix: String(import.meta.env.VITE_VANITY_SUFFIX || "7777"),
  /** 本地挖盐最大迭代（默认走后端矿机） */
  vanityMaxIterations: Number(import.meta.env.VITE_VANITY_MAX_ITERATIONS || 600000),
  /** 链上精确的 KimiMintToken creation bytecode（可选，来自服务器 pristine 文件） */
  tokenCreationHex: String(import.meta.env.VITE_TOKEN_CREATION_HEX || ""),
  /** 默认分红代币（USDT on BSC） */
  defaultRewardToken: "0x55d398326f99059fF775485246999027B3197955",
};

export const EXPLORER_BASE = config.chainId === 97 ? "https://testnet.bscscan.com" : "https://bscscan.com";

export const fmtAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";