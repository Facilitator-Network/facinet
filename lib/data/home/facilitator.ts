export const FACILITATOR_DEFINITION_DATA = {
  title: "What is a Facilitator?",
  description: "A facilitator is an optional but recommended service that simplifies blockchain payments. It acts as a trusted helper between clients and servers by checking whether the payment request is valid and then settling the transaction on-chain. This removes the need for servers to maintain blockchain infrastructure or deal with verification logic, making the entire payment process easier, faster and more reliable.",
  responsibilities: {
    title: "Facilitator Responsibilities",
    items: [
      {
        title: "Verify Payments",
        description: "Validates client payloads against payment requirements in real-time.",
        icon: "ShieldCheck",
      },
      {
        title: "Settle Transactions",
        description: "Submits validated payments to the blockchain for final settlement.",
        icon: "Landmark",
      },
      {
        title: "Provide Responses",
        description: "Returns instant verification results so servers can fulfill requests.",
        icon: "MessageSquareText",
      },
    ]
  },
  benefits: {
    title: "Why Use a Facilitator?",
    items: [
      {
        title: "Reduced Operational Complexity",
        description: "Servers do not need to interact directly with blockchain nodes.",
      },
      {
        title: "Protocol Consistency",
        description: "Standardized verification and settlement flows across services.",
      },
      {
        title: "Faster Integration",
        description: "Services can start accepting payments with minimal blockchain-specific development.",
      },
    ]
  }
}
