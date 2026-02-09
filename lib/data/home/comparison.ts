export const COMPARISON_TABLE_DATA = {
  title: "Current Facilitators vs Facinet",
  description: "Most current solutions (X402 & Similar Systems) suffer from centralization and a lack of proper economic incentives. By decentralizing the facilitator role, Facinet eliminates single points of failure while introducing accountability and economic security.",
  headers: ["Feature", "Current Facilitators", "Facinet"],
  rows: [
    { feature: "Architecture", current: "Centralized service", facinet: "Decentralized facilitator network" },
    { feature: "Participation", current: "Permissioned / company-run", facinet: "Permissionless (anyone can run a node)" },
    { feature: "Staking", current: "❌ None", facinet: "✅ USDC staking required" },
    { feature: "Accountability", current: "❌ None", facinet: "✅ Slashing & incentives" },
    { feature: "Censorship Resistance", current: "❌ Can block users", facinet: "✅ Automatic fallback & rotation" },
    { feature: "Failover", current: "❌ Manual / none", facinet: "✅ Built-in backup facilitators" },
    { feature: "Economic Incentives", current: "Flat fees", facinet: "Gas reimbursement + rewards" },
    { feature: "Verification", current: "Single facilitator", facinet: "Multi-facilitator verification" },
    { feature: "Trust Model", current: "Trust the operator", facinet: "Trust minimized via protocol" },
    { feature: "Scalability", current: "Vertical (more servers)", facinet: "Horizontal (more nodes)" },
    { feature: "Standard Compatibility", current: "Limited", facinet: "Built on X402" },
    { feature: "Network Effects", current: "None", facinet: "Shared global facilitator pool" },
  ]
}
