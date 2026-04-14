import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function PluginsPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Plugin System</h1>
        <p className="text-xl text-muted-foreground">
          Extend Commercio with custom hooks without forking the core. Register
          plugins that run before or after key operations to add validation,
          logging, integrations, or any custom logic.
        </p>
      </div>

      {/* Plugin Model */}
      <Card>
        <CardHeader>
          <CardTitle>Plugin Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Plugin {
  id: string;                    // Unique UUID identifier
  name: string;                  // Plugin display name
  hook: PluginHook;              // Which hook this plugin attaches to
  priority: number;              // Execution order (lower = first, default: 10)
  handler: (ctx: object) => Promise<object>; // The plugin function
  isActive: boolean;             // Active status (default: true)
}

// Available hooks
type PluginHook =
  | "beforeOrderCreate"
  | "afterOrderCreate"
  | "beforeOrderStatusChange"
  | "afterOrderStatusChange"
  | "beforeProductCreate"
  | "afterProductCreate"
  | "beforePaymentProcess"
  | "afterPaymentProcess"
  | "beforeCartEvaluate"
  | "afterCartEvaluate"
  | "beforeShipmentCreate"
  | "afterShipmentCreate";`}
          />
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Register a plugin:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { pluginService } = createServices();

// Add a validation plugin that runs before order creation
const plugin = await pluginService.register({
  name: "Order Fraud Check",
  hook: "beforeOrderCreate",
  priority: 1,  // Run first
  handler: async (ctx) => {
    if (ctx.order.totalAmount > 100000) {
      ctx.requiresReview = true;
    }
    return ctx;
  },
});

console.log(plugin.id);   // UUID
console.log(plugin.hook); // "beforeOrderCreate"`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Register a post-action plugin:</p>
            <CodeBlock
              code={`// Send a Slack notification after every order
await pluginService.register({
  name: "Slack Notifier",
  hook: "afterOrderCreate",
  priority: 10,
  handler: async (ctx) => {
    await fetch("https://hooks.slack.com/...", {
      method: "POST",
      body: JSON.stringify({
        text: \`New order \${ctx.order.id} for $\${ctx.order.totalAmount / 100}\`,
      }),
    });
    return ctx;
  },
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Execute hooks:</p>
            <CodeBlock
              code={`// Execute all plugins for a hook (done internally by services)
// You can also trigger manually:
const result = await pluginService.execute("beforeOrderCreate", {
  order: { totalAmount: 15000, customerId: "cust-1" },
});

console.log(result.requiresReview); // true if fraud check flagged it

// Plugins run in priority order (lowest first)
// Each plugin receives the context returned by the previous one`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Manage plugins:</p>
            <CodeBlock
              code={`// List all plugins for a hook
const orderPlugins = await pluginService.getByHook("beforeOrderCreate");

orderPlugins.forEach(p => {
  console.log(\`[\${p.priority}] \${p.name} (active: \${p.isActive})\`);
});

// Deactivate a plugin without removing it
await pluginService.deactivate(plugin.id);

// Reactivate
await pluginService.activate(plugin.id);`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
