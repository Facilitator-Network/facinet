
import { FlowStep, FlowEdge } from "@/components/ui/architecture-flow"

export const WHITEPAPER_CONTENT = {
  intro: {
    title: "A Verifiable Gas Abstraction Layer",
    subtitle: "For X402 and the Agent Economy",
    paragraphs: [
      "Facinet is a decentralized infrastructure layer that provides gas abstraction, verifiability, and execution coordination for X402 payments and the emerging agent economy.",
      "It enables autonomous agents and applications to execute crypto payments across chains without managing gas, wallets, or blockchain-specific complexity, while preserving on-chain truth and economic accountability through a distributed facilitator network."
    ]
  },
  principles: [
    { title: "Source of Truth", desc: "On-chain settlement is the ultimate source of truth." },
    { title: "Untrusted", desc: "Facilitators are replaceable and not trusted." },
    { title: "Security", desc: "Gas abstraction must not weaken security guarantees." },
    { title: "Resilience", desc: "Failures handle automatically with fallback mechanisms." },
    { title: "UX", desc: "Web2 UX should not compromise Web3 guarantees." }
  ],
  actors: [
    { name: "User / Agent", role: "Initiates X402 payment requests" },
    { name: "Vendor", role: "Provides APIs/services, receives payment" },
    { name: "Facilitator", role: "Executes settlement and pays gas" },
    { name: "Facinet Network", role: "Coordinates execution & selection" },
    { name: "Facinet Chain", role: "Logs execution, reputation, slashing" },
    { name: "Settlement Chains", role: "Move funds (AVAX, ETH, BASE)" }
  ]
}

export const ONBOARDING_FLOW: { steps: FlowStep[], edges: FlowEdge[] } = {
  steps: [
    { id: '1', label: 'Deploy Node', subLabel: 'CLI / Cloud', icon: 'Server', type: 'start' },
    { id: '2', label: 'Generate Keys', subLabel: 'Secp256k1', icon: 'Lock' },
    { id: '3', label: 'Stake Token', subLabel: 'FACINET', icon: 'Wallet' },
    { id: '4', label: 'Deposit Ops USDC', subLabel: 'Gas Funding', icon: 'Database' },
    { id: '5', label: 'Select Chains', subLabel: 'AVAX, BASE, ETH', icon: 'Globe' },
    { id: '6', label: 'Identity Minted', subLabel: 'ERC-8004', icon: 'Shield', type: 'end' }
  ],
  edges: [
    { from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4' }, 
    { from: '4', to: '5' }, { from: '5', to: '6' }
  ]
}

export const VENDOR_FLOW: { steps: FlowStep[], edges: FlowEdge[] } = {
  steps: [
    { id: '1', label: 'Install SDK', subLabel: 'npm install @facinet/sdk', icon: 'Database', type: 'start' },
    { id: '2', label: 'Config Wallet', subLabel: 'Receiving Address', icon: 'Wallet' },
    { id: '3', label: 'Set Pricing', subLabel: 'USDC Amounts', icon: 'Zap' },
    { id: '4', label: 'Select Chain', subLabel: 'Settlement Preference', icon: 'Globe', type: 'end' }
  ],
  edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4' }]
}

export const PAYMENT_FLOW: { steps: FlowStep[], edges: FlowEdge[] } = {
  steps: [
    { id: '1', label: 'User Agent', subLabel: 'Initiator', icon: 'User', type: 'start', description: "Initiates request to Vendor Backend." },
    { id: '2', label: 'Payment Intent', subLabel: 'X402 Gener.', icon: 'FileText', description: "Vendor backend creates payment payload." },
    { id: '3', label: 'Sign Approval', subLabel: 'Signature', icon: 'Lock', description: "User signs gasless approval off-chain." },
    { id: '4', label: 'Facilitator', subLabel: 'Execution', icon: 'Server', description: "Node submits tx & pays gas on L1." },
    { id: '5', label: 'Settlement', subLabel: 'Finality', icon: 'Database', description: "Funds move on Chain. Proof logged." },
    { id: '6', label: 'Access Grant', subLabel: 'Complete', icon: 'Check', type: 'end', description: "Vendor unlocks resource for User." }
  ],
  edges: []
}

export const ARCHITECTURE_TABS = [
  { id: 'intro', label: 'Overview' },
  { id: 'actors', label: 'System Actors' },
  { id: 'flows', label: 'Core Flows' },
  { id: 'economics', label: 'Gas & Economics' }
]
