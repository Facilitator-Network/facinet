export const PROBLEM_SOLUTION_DATA = {
  problem: {
    title: "The Problem",
    items: [
      "Autonomous agents lack a decentralized infrastructure for coordination",
      "Current solutions rely on centralized intermediaries and trusted third parties",
      "No standardized protocol for agent-to-agent value exchange",
      "Security vulnerabilities in direct peer-to-peer agent interactions",
    ],
  },
  solution: {
    title: "The Solution",
    items: [
      "Distributed network of facilitators enabling trustless coordination",
      "Built on EIP-8004 standard for agent interoperability",
      "Cryptographic guarantees for secure value exchange",
      "Stake-based reputation system ensuring network reliability",
    ],
  },
}

export const HOW_IT_WORKS_DATA = {
  title: "How Facilitators Work",
  subtitle: "A simple four-step process to participate in the decentralized agent economy",
  steps: [
    {
      icon: "Network",
      title: "Register as Facilitator",
      description: "Stake tokens and deploy a facilitator node to join the network",
      color: "text-neon-blue",
    },
    {
      icon: "Shield",
      title: "Verify & Coordinate",
      description: "Facilitate agent interactions with cryptographic guarantees",
      color: "text-neon-purple",
    },
    {
      icon: "Zap",
      title: "Execute Transactions",
      description: "Enable secure value exchange between autonomous agents",
      color: "text-neon-pink",
    },
    {
      icon: "Coins",
      title: "Earn Rewards",
      description: "Receive rewards for maintaining network uptime and security",
      color: "text-neon-blue",
    },
  ],
}

export const AGENT_ECONOMY_DATA = {
  title: "Built for the Agent Economy",
  description: "Facinet provides the infrastructure layer for the next generation of autonomous economic agents",
  features: [
    {
      icon: "Bot",
      title: "EIP-8004 Compliance",
      description: "Full support for the Ethereum Agent standard enabling seamless interoperability",
    },
    {
      icon: "GitBranch",
      title: "Flexible Routing",
      description: "Dynamic routing algorithms to optimize agent-facilitator connections",
    },
    {
      icon: "Globe",
      title: "Global Network",
      description: "Geographically distributed facilitators ensuring low latency worldwide",
    },
    {
      icon: "Lock",
      title: "Zero-Knowledge Proofs",
      description: "Privacy-preserving verification for sensitive agent interactions",
    },
  ],
  cta: {
    title: "What are Agents?",
    description:
      "Agents are autonomous programs that can interact with smart contracts, manage assets, and coordinate with other agents. EIP-8004 defines a standard interface that enables these agents to discover facilitators, negotiate terms, and execute transactions in a trustless manner.",
  },
}

export const ARCHITECTURE_DATA = {
  title: "Architecture Overview",
  description: "Understanding how agents, facilitators, and the network interact",
  diagram: {
    agents: {
      label: "Agents",
      subLabel: "Autonomous Programs",
    },
    facilitators: {
      label: "Facilitators",
      subLabel: "Network Coordinators",
    },
    network: {
      label: "Network",
      subLabel: "Distributed Consensus",
    },
  },
  layers: [
    {
      title: "Agent Layer",
      description: "Autonomous programs implementing EIP-8004 standard interface",
      color: "text-neon-blue",
    },
    {
      title: "Facilitator Layer",
      description: "Staked nodes providing coordination and verification services",
      color: "text-neon-purple",
    },
    {
      title: "Network Layer",
      description: "Decentralized consensus ensuring security and reliability",
      color: "text-neon-pink",
    },
  ],
}

export const PROBLEM_DATA = {
  title: "Problems with Current Facilitators",
  description: "Most current solutions (X402 & Similar Systems) suffer from centralization and a lack of proper economic incentives. By decentralizing the facilitator role, Facinet eliminates single points of failure while introducing accountability and economic security.",
  items: [
    {
      title: "Centralization",
      description: "Most facilitators are run by single entities, creating single points of failure.",
      icon: "Landmark",
    },
    {
      title: "Censorship Risk",
      description: "Facilitators can block wallets or delay settlements with no fallback for users.",
      icon: "Ban",
    },
    {
      title: "No Permissionless Participation",
      description: "No open network where anyone can join; usually restricted to the operator.",
      icon: "Lock",
    },
    {
      title: "No Economic Security",
      description: "Facilitators don't stake tokens, relying on reputation rather than guarantees.",
      icon: "ShieldOff",
    },
    {
      title: "No Transparent Incentive",
      description: "Fees and rewards are often opaque and controlled by the operator.",
      icon: "EyeOff",
    },
    {
      title: "No Failover",
      description: "If a facilitator fails, the system doesn't auto-rotate, causing downtime.",
      icon: "ServerCrash",
    },
    {
      title: "No Consensus",
      description: "Single-node verification creates trust assumptions and fraud risks.",
      icon: "AlertTriangle",
    },
    {
      title: "No On-Chain Accountability",
      description: "Actions happen off-chain with no cryptographic proof of misbehavior.",
      icon: "Scroll",
    },
    {
      title: "Limited Scalability",
      description: "Centralized servers become bottlenecks and can't scale horizontally.",
      icon: "BarChart",
    },
    {
      title: "Protocol Lock-in",
      description: "Apps become tightly coupled to a specific facilitator's API and policy.",
      icon: "Link",
    },
  ],
}

export const FACINET_INFO_DATA = {
  title: "What is Facinet?",
  description:
    "Facinet is the first decentralized network built exclusively for the Agent Economy. It implements the X402 standard to connect millions of autonomous agents through a secure, high-speed facilitator layer.",
  stats: [
    { label: "Throughput", value: "100k TPS" },
    { label: "Finality", value: "<500ms" },
    { label: "Active Nodes", value: "1,200+" },
  ],
}

export const COMPARISON_DATA = {
  title: "Why Facinet?",
  description: "Comparing traditional infrastructure with the Agent-First approach",
  headers: ["Feature", "Traditional Cloud", "Facinet"],
  rows: [
    { feature: "Discovery", traditional: "Manual / APIs", facinet: "Autonomous (X402)" },
    { feature: "Settlement", traditional: "Payment Gateways", facinet: "Atomic & Trustless" },
    { feature: "Security", traditional: "Firewalls / IAM", facinet: "Cryptographic Proofs" },
    { feature: "Interoperability", traditional: "Siloed", facinet: "Universal" },
  ],
}
