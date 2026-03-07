import { Terminal, Server, Network, Sparkles, Code2, Cpu, Shield, Zap, Package } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20">

      {/* Hero Section */}
      <div className="space-y-6 pt-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Facinet SDK
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
          Add gasless USDC payments to any app in minutes. Paywall APIs, process payments,
          and let facilitators handle the gas.
        </p>
        <div className="flex items-center gap-3">
          <code className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-primary">
            npm install facinet-sdk
          </code>
          <span className="text-xs text-white/40 font-mono">v1.0.0</span>
        </div>
      </div>

      {/* Quick Start */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> Quick Start
        </h2>

        <div className="space-y-4">
          {/* Install */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 text-xs font-mono text-white/40 uppercase tracking-widest">
              Install
            </div>
            <pre className="p-4 text-sm font-mono text-white/80 overflow-x-auto">
{`npm install facinet-sdk`}
            </pre>
          </div>

          {/* Basic Payment */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 text-xs font-mono text-white/40 uppercase tracking-widest">
              Make a Gasless Payment
            </div>
            <pre className="p-4 text-sm font-mono text-white/80 overflow-x-auto">
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

      {/* Paywall Middleware */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Paywall Middleware
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed px-1">
          Charge USDC for API access with one line of code. Returns HTTP 402 Payment Required
          when no payment is provided, automatically verifies payments when included.
        </p>

        <div className="space-y-4">
          {/* Express */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 text-xs font-mono text-white/40 uppercase tracking-widest">
              Express.js — One Line Paywall
            </div>
            <pre className="p-4 text-sm font-mono text-white/80 overflow-x-auto">
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

          {/* Next.js */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 text-xs font-mono text-white/40 uppercase tracking-widest">
              Next.js API Route
            </div>
            <pre className="p-4 text-sm font-mono text-white/80 overflow-x-auto">
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

      {/* How 402 Works */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" /> How x402 Protocol Works
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
            <div className="text-3xl font-bold text-primary font-mono">01</div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide">Client Requests API</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Client calls your paywalled endpoint. No payment header? Server returns <code className="text-primary">HTTP 402</code> with payment requirements (amount, recipient, network).
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
            <div className="text-3xl font-bold text-primary font-mono">02</div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide">User Signs Authorization</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Client signs an ERC-3009 authorization off-chain (no gas). This gives permission to transfer USDC — user never sends a transaction themselves.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
            <div className="text-3xl font-bold text-primary font-mono">03</div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide">Facilitator Settles</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              A Facinet facilitator executes the USDC transfer on-chain, paying gas. Client retries the API with payment proof. Server verifies and responds.
            </p>
          </div>
        </div>
      </div>

      {/* SDK Methods */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> SDK Reference
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
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <code className="text-xs font-mono text-primary whitespace-nowrap mt-0.5">{item.method}</code>
              <span className="text-xs text-white/50">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CLI */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" /> CLI Commands
        </h2>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <pre className="p-4 text-sm font-mono text-white/80 overflow-x-auto">
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

      {/* Supported Networks */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Supported Networks
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
                ? 'border-primary/30 bg-primary/5'
                : 'border-white/5 bg-white/[0.02]'
            }`}>
              <div className="text-xs font-bold text-white font-mono">{net.name}</div>
              <div className="text-[10px] text-white/30 font-mono mt-1">Chain {net.chainId}</div>
              {net.primary && (
                <div className="text-[9px] text-primary font-mono mt-1 uppercase tracking-widest">Settlement Chain</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Facilitator Info */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" /> Run a Facilitator
        </h2>
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
          <p className="text-sm text-white/60 leading-relaxed">
            Facilitators are the backbone of Facinet. They execute on-chain transactions and pay gas fees
            on behalf of users, earning fees for every payment they process.
          </p>
          <div className="space-y-2 text-xs text-white/50">
            <div className="flex items-center gap-2"><span className="text-primary">→</span> Register with 1 USDC on Avalanche Fuji</div>
            <div className="flex items-center gap-2"><span className="text-primary">→</span> Fund wallet with at least 1 AVAX for gas</div>
            <div className="flex items-center gap-2"><span className="text-primary">→</span> Earn fees on every payment you process</div>
            <div className="flex items-center gap-2"><span className="text-primary">→</span> On-chain identity via ERC-8004 NFT</div>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" /> Core Standards
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
            <h3 className="font-bold text-white text-sm font-mono">x402 Protocol</h3>
            <p className="text-xs text-white/50 leading-relaxed">HTTP 402 Payment Required standard. APIs return payment requirements, clients pay, facilitators settle on-chain.</p>
          </div>
          <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
            <h3 className="font-bold text-white text-sm font-mono">ERC-3009</h3>
            <p className="text-xs text-white/50 leading-relaxed">Gasless USDC transfers via off-chain signatures. Users sign authorizations, facilitators execute TransferWithAuthorization.</p>
          </div>
          <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
            <h3 className="font-bold text-white text-sm font-mono">ERC-8004</h3>
            <p className="text-xs text-white/50 leading-relaxed">On-chain facilitator identity as ERC-721 NFTs. Decentralized reputation with feedback scores 0-100.</p>
          </div>
          <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
            <h3 className="font-bold text-white text-sm font-mono">AES-256-GCM</h3>
            <p className="text-xs text-white/50 leading-relaxed">Dual-layer encryption for facilitator keys. User password + system master key, PBKDF2 with 100k iterations.</p>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight px-1 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" /> API Endpoints
        </h2>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden divide-y divide-white/5">
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
                endpoint.method === 'GET' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
              }`}>{endpoint.method}</span>
              <code className="text-xs font-mono text-white/80">{endpoint.path}</code>
              <span className="text-xs text-white/40 ml-auto hidden md:block">{endpoint.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
