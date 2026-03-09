import { Terminal, Server, Network, Sparkles, Code2, Cpu, Shield, Zap, Package } from "lucide-react"
import { ApiKeySection } from "@/components/docs/api-key-section"

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20">

      {/* Hero Section */}
      <div className="space-y-6 pt-8">
        <h1 className="text-5xl md:text-6xl font-extrabold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
          Facinet SDK
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl font-body font-light leading-relaxed">
          Add gasless USDC payments to any app in minutes. Paywall APIs, process payments,
          and let facilitators handle the gas.
        </p>
        <div className="flex items-center gap-3">
          <code className="px-4 py-2 rounded-lg bg-[var(--glass-subtle-bg)] border border-[var(--bg-border)] text-sm font-mono text-[var(--accent)]">
            npm install facinet-sdk
          </code>
          <span className="text-xs text-[var(--text-tertiary)] font-mono">v0.2.3</span>
        </div>
      </div>

      {/* Quick Start */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display tracking-tight px-1 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[var(--accent)]" /> Quick Start
        </h2>

        <div className="space-y-4">
          {/* Install */}
          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden bg-[var(--glass-bg)] border border-[var(--bg-border)] shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl group-hover:border-[var(--text-tertiary)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 px-4 py-3 bg-[var(--glass-subtle-bg)] border-b border-[var(--bg-border)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--text-tertiary)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--bg-border)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                </div>
                <div className="text-xs text-[var(--text-tertiary)] font-mono select-none uppercase tracking-widest">Install</div>
              </div>
              <pre className="p-4 md:p-6 text-sm font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed">
{`npm install facinet-sdk`}
              </pre>
            </div>
          </div>

          {/* Basic Payment */}
          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden bg-[var(--glass-bg)] border border-[var(--bg-border)] shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl group-hover:border-[var(--text-tertiary)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 px-4 py-3 bg-[var(--glass-subtle-bg)] border-b border-[var(--bg-border)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--text-tertiary)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--bg-border)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                </div>
                <div className="text-xs text-[var(--text-tertiary)] font-mono select-none uppercase tracking-widest">Basic Payment</div>
              </div>
              <pre className="p-4 md:p-6 text-sm font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed">
{`import { Facinet } from 'facinet-sdk'

const facinet = new Facinet({ network: 'avalanche-fuji' })

// Pay USDC — facilitator pays gas
const result = await facinet.pay({
  amount: '1.00',
  recipient: '0xRecipient...',
})

console.log('TX:', result.txHash)`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Paywall Middleware */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display tracking-tight px-1 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[var(--accent)]" /> Paywall Middleware
        </h2>
        <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed px-1">
          Charge USDC for API access with one line of code. Returns HTTP 402 Payment Required
          when no payment is provided, automatically verifies payments when included.
        </p>

        <div className="space-y-4">
          {/* Express */}
          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden bg-[var(--glass-bg)] border border-[var(--bg-border)] shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl group-hover:border-[var(--text-tertiary)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 px-4 py-3 bg-[var(--glass-subtle-bg)] border-b border-[var(--bg-border)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--text-tertiary)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--bg-border)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                </div>
                <div className="text-xs text-[var(--text-tertiary)] font-mono select-none uppercase tracking-widest">Express.js</div>
              </div>
              <pre className="p-4 md:p-6 text-sm font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed">
{`import { paywall } from 'facinet-sdk'

// Charge 0.10 USDC per request
app.get('/api/premium', paywall({
  amount: '0.10',
  recipient: '0xYourWallet...',
}), (req, res) => {
  // req.x402 contains payment proof
  res.json({ data: 'premium content' })
})`}
              </pre>
            </div>
          </div>

          {/* Next.js */}
          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden bg-[var(--glass-bg)] border border-[var(--bg-border)] shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl group-hover:border-[var(--text-tertiary)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 px-4 py-3 bg-[var(--glass-subtle-bg)] border-b border-[var(--bg-border)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--text-tertiary)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--bg-border)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
                </div>
                <div className="text-xs text-[var(--text-tertiary)] font-mono select-none uppercase tracking-widest">Next.js</div>
              </div>
              <pre className="p-4 md:p-6 text-sm font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed">
{`import { paywallNextjs } from 'facinet-sdk'

export const GET = paywallNextjs({
  amount: '0.10',
  recipient: '0xYourWallet...',
})(async (req) => {
  return Response.json({ data: 'premium content' })
})`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Gasless API — Client Component */}
      <ApiKeySection />

      {/* How 402 Works */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display tracking-tight px-1 flex items-center gap-2">
          <Network className="h-5 w-5 text-[var(--accent)]" /> How x402 Protocol Works
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] space-y-3">
            <div className="text-3xl font-bold text-[var(--accent)] font-mono">01</div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wide font-body">Client Requests API</h3>
            <p className="text-xs text-[var(--text-secondary)] font-body leading-relaxed">
              Client calls your paywalled endpoint. No payment header? Server returns <code className="text-[var(--accent)]">HTTP 402</code> with payment requirements (amount, recipient, network).
            </p>
          </div>
          <div className="p-5 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] space-y-3">
            <div className="text-3xl font-bold text-[var(--accent)] font-mono">02</div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wide font-body">User Signs Authorization</h3>
            <p className="text-xs text-[var(--text-secondary)] font-body leading-relaxed">
              Client signs an ERC-3009 authorization off-chain (no gas). This gives permission to transfer USDC — user never sends a transaction themselves.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] space-y-3">
            <div className="text-3xl font-bold text-[var(--accent)] font-mono">03</div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wide font-body">Facilitator Settles</h3>
            <p className="text-xs text-[var(--text-secondary)] font-body leading-relaxed">
              A Facinet facilitator executes the USDC transfer on-chain, paying gas. Client retries the API with payment proof. Server verifies and responds.
            </p>
          </div>
        </div>
      </div>

      {/* SDK Methods */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display tracking-tight px-1 flex items-center gap-2">
          <Package className="h-5 w-5 text-[var(--accent)]" /> SDK Reference
        </h2>

        <div className="space-y-3">
          {[
            { method: 'new Facinet({ network })', desc: 'Initialize SDK for a specific chain' },
            { method: 'facinet.pay({ amount, recipient })', desc: 'Gasless USDC payment via facilitator' },
            { method: 'facinet.executeContract({ contractAddress, functionName, abi, functionArgs })', desc: 'Execute any contract call through facilitator' },
            { method: 'facinet.getFacilitators()', desc: 'List active facilitators on the network' },
            { method: 'facinet.selectRandomFacilitator()', desc: 'Pick a random active facilitator' },
            { method: 'paywall({ amount, recipient })', desc: 'Express middleware — returns 402, verifies payments' },
            { method: 'paywallNextjs({ amount, recipient })', desc: 'Next.js wrapper — same as paywall for API routes' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] hover:bg-[var(--bg-raised)] transition-colors">
              <code className="text-xs font-mono text-[var(--accent)] whitespace-nowrap mt-0.5">{item.method}</code>
              <span className="text-xs text-[var(--text-secondary)] font-body">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CLI */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display tracking-tight px-1 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-[var(--accent)]" /> CLI Commands
        </h2>

        <div className="relative group">
          <div className="relative rounded-xl overflow-hidden bg-[var(--glass-bg)] border border-[var(--bg-border)] shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl group-hover:border-[var(--text-tertiary)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-subtle-bg)] to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 px-4 py-3 bg-[var(--glass-subtle-bg)] border-b border-[var(--bg-border)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[var(--text-tertiary)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--bg-border)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--glass-subtle-bg)]" />
              </div>
              <div className="text-xs text-[var(--text-tertiary)] font-mono select-none uppercase tracking-widest">CLI Commands</div>
            </div>
            <pre className="p-4 md:p-6 text-sm font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed">
{`# Install globally
npm install -g facinet-sdk

# Make a payment
facinet pay --amount 1.00 --to 0xRecipient...

# List facilitators
facinet facilitator list

# Check facilitator status
facinet facilitator status`}
            </pre>
          </div>
        </div>
      </div>

      {/* Supported Networks */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display tracking-tight px-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--accent)]" /> Supported Networks
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Avalanche Fuji', chainId: '43113', primary: true },
            { name: 'Ethereum Sepolia', chainId: '11155111', primary: false },
            { name: 'Base Sepolia', chainId: '84532', primary: false },
            { name: 'Polygon Amoy', chainId: '80002', primary: false },
            { name: 'Arbitrum Sepolia', chainId: '421614', primary: false },
            { name: 'Optimism Sepolia', chainId: '11155420', primary: false },
            { name: 'Monad Testnet', chainId: '10143', primary: false },
          ].map((net) => (
            <div key={net.chainId} className={`p-3 rounded-xl border text-center ${
              net.primary
                ? 'border-[var(--accent)]/30 bg-[var(--accent-muted)]'
                : 'border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02]'
            }`}>
              <div className="text-xs font-bold text-[var(--text-primary)] font-mono">{net.name}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1">Chain {net.chainId}</div>
              {net.primary && (
                <div className="text-[9px] text-[var(--accent)] font-mono mt-1 uppercase tracking-widest">Settlement Chain</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Facilitator Info */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display tracking-tight px-1 flex items-center gap-2">
          <Server className="h-5 w-5 text-[var(--accent)]" /> Run a Facilitator
        </h2>
        <div className="p-6 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] space-y-3">
          <p className="text-sm text-[var(--text-secondary)] font-body leading-relaxed">
            Facilitators are the backbone of Facinet. They execute on-chain transactions and pay gas fees
            on behalf of users, earning fees for every payment they process.
          </p>
          <div className="space-y-2 text-xs text-[var(--text-secondary)] font-body">
            <div className="flex items-center gap-2"><span className="text-[var(--accent)]">&rarr;</span> Register with 1 USDC on Avalanche Fuji</div>
            <div className="flex items-center gap-2"><span className="text-[var(--accent)]">&rarr;</span> Fund wallet with at least 1 AVAX for gas</div>
            <div className="flex items-center gap-2"><span className="text-[var(--accent)]">&rarr;</span> Earn fees on every payment you process</div>
            <div className="flex items-center gap-2"><span className="text-[var(--accent)]">&rarr;</span> On-chain identity via ERC-8004 NFT</div>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display tracking-tight px-1 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-[var(--accent)]" /> Core Standards
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] space-y-2">
            <h3 className="font-bold text-[var(--text-primary)] text-sm font-mono">x402 Protocol</h3>
            <p className="text-xs text-[var(--text-secondary)] font-body leading-relaxed">HTTP 402 Payment Required standard. APIs return payment requirements, clients pay, facilitators settle on-chain.</p>
          </div>
          <div className="p-5 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] space-y-2">
            <h3 className="font-bold text-[var(--text-primary)] text-sm font-mono">ERC-3009</h3>
            <p className="text-xs text-[var(--text-secondary)] font-body leading-relaxed">Gasless USDC transfers via off-chain signatures. Users sign authorizations, facilitators execute TransferWithAuthorization.</p>
          </div>
          <div className="p-5 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] space-y-2">
            <h3 className="font-bold text-[var(--text-primary)] text-sm font-mono">ERC-8004</h3>
            <p className="text-xs text-[var(--text-secondary)] font-body leading-relaxed">On-chain facilitator identity as ERC-721 NFTs. Decentralized reputation with feedback scores 0-100.</p>
          </div>
          <div className="p-5 rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] space-y-2">
            <h3 className="font-bold text-[var(--text-primary)] text-sm font-mono">AES-256-GCM</h3>
            <p className="text-xs text-[var(--text-secondary)] font-body leading-relaxed">Dual-layer encryption for facilitator keys. User password + system master key, PBKDF2 with 100k iterations.</p>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display tracking-tight px-1 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-[var(--accent)]" /> API Endpoints
        </h2>

        <div className="rounded-xl border border-[var(--bg-border)] bg-[var(--glass-bg)]/[0.02] overflow-hidden divide-y divide-[var(--bg-border)]">
          {[
            { method: 'POST', path: '/api/x402/verify', desc: 'Verify a payment authorization' },
            { method: 'POST', path: '/api/x402/settle', desc: 'Settle a verified payment on-chain' },
            { method: 'POST', path: '/api/x402/execute-contract', desc: 'Execute arbitrary contract call' },
            { method: 'GET', path: '/api/facilitator/list', desc: 'List all facilitators' },
            { method: 'POST', path: '/api/facilitator/create', desc: 'Register a new facilitator' },
            { method: 'GET', path: '/api/stats/network', desc: 'Get real-time network statistics' },
            { method: 'GET', path: '/api/explorer/logs', desc: 'Get recent transaction logs' },
            { method: 'GET', path: '/api/demo/weather', desc: 'Demo paywalled endpoint (returns 402)' },
          ].map((endpoint, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                endpoint.method === 'GET' ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
              }`}>{endpoint.method}</span>
              <code className="text-xs font-mono text-[var(--text-primary)]">{endpoint.path}</code>
              <span className="text-xs text-[var(--text-tertiary)] font-body ml-auto hidden md:block">{endpoint.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
