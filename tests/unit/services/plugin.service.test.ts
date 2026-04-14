import { describe, it, expect, beforeEach, vi } from "vitest";
import { PluginService } from "../../../src/services/plugin.service";
import type { PluginRegistration, HookContext } from "../../../src/modules/plugin/plugin.model";

describe("PluginService", () => {
  let service: PluginService;

  beforeEach(() => {
    service = new PluginService();
  });

  describe("register", () => {
    it("should register a plugin", () => {
      const plugin: PluginRegistration = {
        name: "test-plugin",
        version: "1.0.0",
        hooks: {
          afterOrderCreate: vi.fn(),
        },
      };

      service.register(plugin);

      expect(service.isRegistered("test-plugin")).toBe(true);
      expect(service.getRegisteredPlugins()).toHaveLength(1);
    });

    it("should throw if plugin already registered", () => {
      const plugin: PluginRegistration = {
        name: "test-plugin",
        version: "1.0.0",
        hooks: {},
      };

      service.register(plugin);

      expect(() => service.register(plugin)).toThrow("already registered");
    });
  });

  describe("unregister", () => {
    it("should unregister a plugin", () => {
      const plugin: PluginRegistration = {
        name: "test-plugin",
        version: "1.0.0",
        hooks: { afterOrderCreate: vi.fn() },
      };

      service.register(plugin);
      service.unregister("test-plugin");

      expect(service.isRegistered("test-plugin")).toBe(false);
      expect(service.getHookHandlerCount("afterOrderCreate")).toBe(0);
    });

    it("should throw if plugin not registered", () => {
      expect(() => service.unregister("unknown")).toThrow("not registered");
    });
  });

  describe("executeHook", () => {
    it("should execute hook handlers in order", async () => {
      const results: string[] = [];

      const plugin1: PluginRegistration = {
        name: "plugin-1",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: async (ctx: any) => {
            results.push("plugin-1");
            return ctx;
          },
        },
      };

      const plugin2: PluginRegistration = {
        name: "plugin-2",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: async (ctx: any) => {
            results.push("plugin-2");
            return ctx;
          },
        },
      };

      service.register(plugin1);
      service.register(plugin2);

      const context: HookContext = { data: { orderId: "123" } };
      await service.executeHook("beforeOrderCreate", context);

      expect(results).toEqual(["plugin-1", "plugin-2"]);
    });

    it("should pass modified context through chain", async () => {
      const plugin: PluginRegistration = {
        name: "modifier-plugin",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: async (ctx: any) => {
            return { ...ctx, data: { ...ctx.data, modified: true } };
          },
        },
      };

      service.register(plugin);

      const context: HookContext = { data: { orderId: "123" } };
      const result = await service.executeHook("beforeOrderCreate", context);

      expect((result.data as any).modified).toBe(true);
    });

    it("should handle no registered handlers", async () => {
      const context: HookContext = { data: { test: true } };
      const result = await service.executeHook("afterOrderCreate", context);

      expect(result).toBe(context);
    });

    it("should throw on plugin error", async () => {
      const plugin: PluginRegistration = {
        name: "failing-plugin",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: async () => {
            throw new Error("Something went wrong");
          },
        },
      };

      service.register(plugin);

      const context: HookContext = { data: {} };
      await expect(service.executeHook("beforeOrderCreate", context)).rejects.toThrow("failing-plugin");
    });
  });

  describe("getHookHandlerCount", () => {
    it("should return correct handler count", () => {
      const plugin: PluginRegistration = {
        name: "test-plugin",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: vi.fn(),
          afterOrderCreate: vi.fn(),
        },
      };

      service.register(plugin);

      expect(service.getHookHandlerCount("beforeOrderCreate")).toBe(1);
      expect(service.getHookHandlerCount("afterOrderCreate")).toBe(1);
      expect(service.getHookHandlerCount("beforePaymentCreate")).toBe(0);
    });
  });

  describe("enablePlugin / disablePlugin / isEnabled", () => {
    it("should enable a disabled plugin", () => {
      const plugin: PluginRegistration = {
        name: "test-plugin",
        version: "1.0.0",
        hooks: {},
      };

      service.register(plugin);
      service.disablePlugin("test-plugin");
      expect(service.isEnabled("test-plugin")).toBe(false);

      service.enablePlugin("test-plugin");
      expect(service.isEnabled("test-plugin")).toBe(true);
    });

    it("should disable an enabled plugin", () => {
      const plugin: PluginRegistration = {
        name: "test-plugin",
        version: "1.0.0",
        hooks: {},
      };

      service.register(plugin);
      expect(service.isEnabled("test-plugin")).toBe(true);

      service.disablePlugin("test-plugin");
      expect(service.isEnabled("test-plugin")).toBe(false);
    });

    it("should throw on enable/disable/isEnabled for unregistered plugin", () => {
      expect(() => service.enablePlugin("unknown")).toThrow("not registered");
      expect(() => service.disablePlugin("unknown")).toThrow("not registered");
      expect(() => service.isEnabled("unknown")).toThrow("not registered");
    });
  });

  describe("getEnabledPlugins", () => {
    it("should return only enabled plugins", () => {
      const plugin1: PluginRegistration = { name: "plugin-1", version: "1.0.0", hooks: {} };
      const plugin2: PluginRegistration = { name: "plugin-2", version: "1.0.0", hooks: {} };
      const plugin3: PluginRegistration = { name: "plugin-3", version: "1.0.0", hooks: {} };

      service.register(plugin1);
      service.register(plugin2);
      service.register(plugin3);
      service.disablePlugin("plugin-2");

      const enabled = service.getEnabledPlugins();

      expect(enabled).toHaveLength(2);
      expect(enabled.map((p) => p.name)).toEqual(["plugin-1", "plugin-3"]);
    });
  });

  describe("registerWithPriority", () => {
    it("should execute higher priority plugins first", async () => {
      const results: string[] = [];

      const lowPriority: PluginRegistration = {
        name: "low-priority",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: async (ctx: any) => {
            results.push("low");
            return ctx;
          },
        },
      };

      const highPriority: PluginRegistration = {
        name: "high-priority",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: async (ctx: any) => {
            results.push("high");
            return ctx;
          },
        },
      };

      service.registerWithPriority(lowPriority, 1);
      service.registerWithPriority(highPriority, 10);

      const context: HookContext = { data: {} };
      await service.executeHook("beforeOrderCreate", context);

      expect(results).toEqual(["high", "low"]);
    });
  });

  describe("executeHookSafe", () => {
    it("should capture errors without throwing", async () => {
      const plugin1: PluginRegistration = {
        name: "good-plugin",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: async (ctx: any) => {
            return { ...ctx, data: { ...ctx.data, good: true } };
          },
        },
      };

      const plugin2: PluginRegistration = {
        name: "bad-plugin",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: async () => {
            throw new Error("Plugin crashed");
          },
        },
      };

      service.register(plugin1);
      service.register(plugin2);

      const context: HookContext = { data: {} };
      const result = await service.executeHookSafe("beforeOrderCreate", context);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].pluginName).toBe("bad-plugin");
      expect(result.errors[0].error.message).toBe("Plugin crashed");
      expect((result.context.data as any).good).toBe(true);
    });
  });

  describe("getPluginHooks", () => {
    it("should return hook names for a plugin", () => {
      const plugin: PluginRegistration = {
        name: "multi-hook-plugin",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: vi.fn(),
          afterOrderCreate: vi.fn(),
        },
      };

      service.register(plugin);

      const hooks = service.getPluginHooks("multi-hook-plugin");

      expect(hooks).toContain("beforeOrderCreate");
      expect(hooks).toContain("afterOrderCreate");
      expect(hooks).toHaveLength(2);
    });

    it("should throw for unregistered plugin", () => {
      expect(() => service.getPluginHooks("unknown")).toThrow("not registered");
    });
  });

  describe("disabled plugin hooks", () => {
    it("should skip disabled plugin hooks during execution", async () => {
      const results: string[] = [];

      const plugin: PluginRegistration = {
        name: "skip-me",
        version: "1.0.0",
        hooks: {
          beforeOrderCreate: async (ctx: any) => {
            results.push("should-not-run");
            return ctx;
          },
        },
      };

      service.register(plugin);
      service.disablePlugin("skip-me");

      const context: HookContext = { data: {} };
      await service.executeHook("beforeOrderCreate", context);

      expect(results).toHaveLength(0);
    });
  });
});
