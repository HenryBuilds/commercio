import { describe, it, expect, beforeEach } from "vitest";
import { PluginService } from "../../src/services/plugin.service";
import type { PluginRegistration, HookContext } from "../../src/modules/plugin/plugin.model";

describe("E2E: Plugin / Hook System Workflow", () => {
  let pluginService: PluginService;

  beforeEach(() => {
    pluginService = new PluginService();
  });

  it("should register plugins and execute hooks", async () => {
    const executionLog: string[] = [];

    const loggingPlugin: PluginRegistration = {
      name: "logging-plugin",
      version: "1.0.0",
      hooks: {
        beforeOrderCreate: async (ctx: any) => {
          executionLog.push(`beforeOrderCreate: ${JSON.stringify(ctx.data)}`);
          return ctx;
        },
        afterOrderCreate: async (ctx: any) => {
          executionLog.push(`afterOrderCreate: ${JSON.stringify(ctx.data)}`);
          return ctx;
        },
      },
    };

    const validationPlugin: PluginRegistration = {
      name: "validation-plugin",
      version: "1.0.0",
      hooks: {
        beforeOrderCreate: async (ctx: any) => {
          if (ctx.data.items?.length === 0) {
            throw new Error("Order must have items");
          }
          return ctx;
        },
      },
    };

    pluginService.register(loggingPlugin);
    pluginService.register(validationPlugin);

    expect(pluginService.getRegisteredPlugins()).toHaveLength(2);
    expect(pluginService.getHookHandlerCount("beforeOrderCreate")).toBe(2);

    const context: HookContext = {
      data: { customerId: "c1", items: [{ productId: "p1", quantity: 1 }] },
    };

    const result = await pluginService.executeHook("beforeOrderCreate", context);
    expect(executionLog).toContain(`beforeOrderCreate: ${JSON.stringify(context.data)}`);
    expect(result.data).toBeDefined();
  });

  it("should allow plugins to modify context data", async () => {
    const enrichmentPlugin: PluginRegistration = {
      name: "enrichment-plugin",
      version: "1.0.0",
      hooks: {
        beforeOrderCreate: async (ctx: any) => {
          return {
            ...ctx,
            data: {
              ...ctx.data,
              enrichedAt: "2025-06-01",
              source: "plugin",
            },
          };
        },
      },
    };

    pluginService.register(enrichmentPlugin);

    const context: HookContext = { data: { orderId: "123" } };
    const result = await pluginService.executeHook("beforeOrderCreate", context);

    expect((result.data as any).enrichedAt).toBe("2025-06-01");
    expect((result.data as any).source).toBe("plugin");
  });

  it("should unregister plugins cleanly", async () => {
    const plugin: PluginRegistration = {
      name: "temp-plugin",
      version: "1.0.0",
      hooks: {
        afterPaymentCreate: async (ctx: any) => ctx,
      },
    };

    pluginService.register(plugin);
    expect(pluginService.getHookHandlerCount("afterPaymentCreate")).toBe(1);

    pluginService.unregister("temp-plugin");
    expect(pluginService.getHookHandlerCount("afterPaymentCreate")).toBe(0);
    expect(pluginService.isRegistered("temp-plugin")).toBe(false);
  });

  it("should handle multiple plugins on same hook in order", async () => {
    const order: string[] = [];

    for (let i = 1; i <= 3; i++) {
      pluginService.register({
        name: `plugin-${i}`,
        version: "1.0.0",
        hooks: {
          beforeStockChange: async (ctx: any) => {
            order.push(`plugin-${i}`);
            return ctx;
          },
        },
      });
    }

    await pluginService.executeHook("beforeStockChange", { data: {} });
    expect(order).toEqual(["plugin-1", "plugin-2", "plugin-3"]);
  });
});
