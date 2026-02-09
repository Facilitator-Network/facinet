import { DocsPager } from "@/components/docs/docs-pager"
import { CodeWindow } from "@/components/ui/code-window"

export default function SDKUsagePage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-4xl font-bold mb-6 text-gradient">SDK Usage</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Integrate Facinet into your application with our type-safe SDK.
      </p>

      <h2 className="text-2xl font-bold mb-6">Configuration</h2>
      <p className="text-muted-foreground mb-4">Initialize the client with your private key and RPC URL.</p>

      <div className="mb-12">
        <CodeWindow title="app.ts">
{`import { FacinetClient } from 'facinet';

const client = new FacinetClient({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc'
});`}
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">Routing a Task</h2>
      <p className="text-muted-foreground mb-4">Find an agent and send a request.</p>

      <div className="mb-12">
        <CodeWindow title="task.ts">
{`// 1. Define the task payload
const task = {
  type: 'image-generation',
  model: 'stable-diffusion-xl',
  prompt: 'A futuristic city with flying cars'
};

// 2. Send to network (auto-routes to best facilitator)
const response = await client.submitTask(task);

// 3. Handle result
console.log('Result CID:', response.cid);
console.log('Receipt:', response.receipt);`}
        </CodeWindow>
      </div>

      <h2 className="text-2xl font-bold mb-6">Listening for Events</h2>
      <p className="text-muted-foreground mb-4">Subscribe to network events.</p>

      <div className="mb-12">
        <CodeWindow title="listener.ts">
{`client.on('TaskCompleted', (taskId, result) => {
  console.log(\`Task \${taskId} finished!\`, result);
});`}
        </CodeWindow>
      </div>

      <DocsPager 
        prev={{ title: "CLI Usage", href: "/docs/client/cli" }}
      />
    </div>
  )
}
