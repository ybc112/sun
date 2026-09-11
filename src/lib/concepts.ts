import { id } from "ethers";

/** 多概念预设：映射到链上 templateId = keccak256(key) */
export interface Concept {
  key: string;
  label: string;
  emoji: string;
  tagline: string;
  desc: string;
  accent: string;
}

export const CONCEPTS: Concept[] = [
  {
    key: "meme-party",
    label: "MEME·狂欢",
    emoji: "🍌",
    tagline: "把梗变成代币",
    desc: "社区梗文化浓度拉满，发射即热搜。适合一切“根本不需要理由”的好东西。",
    accent: "#ffe135",
  },
  {
    key: "ai-narrative",
    label: "AI·叙事",
    emoji: "🤖",
    tagline: "给 AI 一颗香蕉",
    desc: "AI 训练、Agent 经济、数据代币化的未来叙事，全部塞进一根香蕉。",
    accent: "#7cf7ff",
  },
  {
    key: "rwa-real",
    label: "RWA·实体资产",
    emoji: "🥇",
    tagline: "最贵的实物资产",
    desc: "对标“史上最贵香蕉”，实物资产上链，香蕉都能 45M 美元，你还在等什么。",
    accent: "#ffb347",
  },
  {
    key: "game-level",
    label: "GAME·闯关",
    emoji: "🎮",
    tagline: "玩游戏领空投",
    desc: "关卡制机制：通过关卡解锁奖励，让持有者打架也打架得开心。",
    accent: "#a78bfa",
  },
  {
    key: "defi-dividend",
    label: "DEFI·分红",
    emoji: "💎",
    tagline: "持币自动分红",
    desc: "链上自动分红金库，买卖税按比例回流持有者，越买越香。",
    accent: "#34d399",
  },
  {
    key: "nft-bound",
    label: "NFT·绑定",
    emoji: "🎟️",
    tagline: "代币与藏品绑定",
    desc: "代币 + NFT Collection 一起发，买入送卡牌/门票，收藏与投机两开花。",
    accent: "#f472b6",
  },
  {
    key: "burn-deflation",
    label: "BURN·通缩",
    emoji: "🔥",
    tagline: "越烧越值钱",
    desc: "转账与交易燃烧机制，供给端持续抽水，通缩叙事永不过时。",
    accent: "#fb7185",
  },
  {
    key: "celebrity-aura",
    label: "CELEB·名人效应",
    emoji: "👑",
    tagline: "大佬都爱的香蕉",
    desc: "蹭“史上最贵香蕉”的顶级热度，名字本身就是流量入口。",
    accent: "#eab308",
  },
];

export function conceptOf(templateId: string): Concept | null {
  return CONCEPTS.find((c) => id(c.key) === templateId) || null;
}

export function conceptDisplay(templateId: string): { label: string; emoji: string; accent: string } {
  const c = conceptOf(templateId);
  if (c) return { label: c.label, emoji: c.emoji, accent: c.accent };
  return { label: `${templateId.slice(0, 8)}…`, emoji: "🍌", accent: "#ffe135" };
}

/** 多机制清单（用来给前端 UI 组件复用，如机制选择器/首页展示） */
export const MECHANISMS = [
  { key: "auto-lp", emoji: "⚖️", title: "自动做市", desc: "每笔 Mint 同步注入流动性，发售即开盘" },
  { key: "vanity", emoji: "👑", title: "靓号铸造", desc: "合约地址结尾定制 0x7777，链上一眼认出" },
  { key: "whitelist", emoji: "🎟️", title: "白名单席位", desc: "预售白名单机制，公平起步" },
  { key: "refund", emoji: "🛡️", title: "24h 退款险", desc: "未售罄期限内可全额退款，保护参与者" },
  { key: "dividend", emoji: "💎", title: "自动分红", desc: "税后红利按持有量自动分配" },
  { key: "burn", emoji: "🔥", title: "通缩燃烧", desc: "交易与转账燃烧机制，持续通缩" },
  { key: "lock-lp", emoji: "🔒", title: "锁池黑洞", desc: "售罄后 LP 永久锁死黑洞，无法 rug" },
  { key: "auto-verify", emoji: "✅", title: "自动开源验证", desc: "后端自动向 BscScan 提交源码验证" },
];