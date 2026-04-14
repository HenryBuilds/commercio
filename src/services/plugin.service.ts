import { PluginHookName, HookHandler, PluginRegistration, HookContext } from "../modules/plugin/plugin.model";

export interface PluginState {
  plugin: PluginRegistration;
  enabled: boolean;
}

export class PluginService {
  private plugins: Map<string, PluginState> = new Map();
  private hooks: Map<PluginHookName, Array<{ pluginName: string; handler: HookHandler; priority: number }>> = new Map();

  register(plugin: PluginRegistration): void {
    if (!plugin.name) throw new Error("Plugin name is required");
    if (!plugin.version) throw new Error("Plugin version is required");
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    this.plugins.set(plugin.name, { plugin, enabled: true });

    for (const [hookName, handler] of Object.entries(plugin.hooks)) {
      if (!handler) continue;
      const hookList = this.hooks.get(hookName as PluginHookName) ?? [];
      hookList.push({ pluginName: plugin.name, handler, priority: 0 });
      this.hooks.set(hookName as PluginHookName, hookList);
    }
  }

  registerWithPriority(plugin: PluginRegistration, priority: number = 0): void {
    if (!plugin.name) throw new Error("Plugin name is required");
    if (!plugin.version) throw new Error("Plugin version is required");
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    this.plugins.set(plugin.name, { plugin, enabled: true });

    for (const [hookName, handler] of Object.entries(plugin.hooks)) {
      if (!handler) continue;
      const hookList = this.hooks.get(hookName as PluginHookName) ?? [];
      hookList.push({ pluginName: plugin.name, handler, priority });
      // Sort by priority descending (highest runs first)
      hookList.sort((a, b) => b.priority - a.priority);
      this.hooks.set(hookName as PluginHookName, hookList);
    }
  }

  unregister(pluginName: string): void {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }

    this.plugins.delete(pluginName);

    for (const [hookName, handlers] of this.hooks.entries()) {
      const filtered = handlers.filter((h) => h.pluginName !== pluginName);
      if (filtered.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filtered);
      }
    }
  }

  enablePlugin(pluginName: string): void {
    const state = this.plugins.get(pluginName);
    if (!state) throw new Error(`Plugin "${pluginName}" is not registered`);
    state.enabled = true;
  }

  disablePlugin(pluginName: string): void {
    const state = this.plugins.get(pluginName);
    if (!state) throw new Error(`Plugin "${pluginName}" is not registered`);
    state.enabled = false;
  }

  isEnabled(pluginName: string): boolean {
    const state = this.plugins.get(pluginName);
    if (!state) throw new Error(`Plugin "${pluginName}" is not registered`);
    return state.enabled;
  }

  getRegisteredPlugins(): PluginRegistration[] {
    return Array.from(this.plugins.values()).map((s) => s.plugin);
  }

  getEnabledPlugins(): PluginRegistration[] {
    return Array.from(this.plugins.values())
      .filter((s) => s.enabled)
      .map((s) => s.plugin);
  }

  isRegistered(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  async executeHook<T>(hookName: PluginHookName, context: HookContext<T>): Promise<HookContext<T>> {
    const handlers = this.hooks.get(hookName) ?? [];
    let currentContext = context;

    for (const { pluginName, handler } of handlers) {
      // Skip disabled plugins
      const state = this.plugins.get(pluginName);
      if (!state?.enabled) continue;

      try {
        const result = await handler(currentContext);
        if (result !== undefined && result !== null) {
          currentContext = result as HookContext<T>;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Plugin "${pluginName}" hook "${hookName}" failed: ${message}`);
      }
    }

    return currentContext;
  }

  async executeHookSafe<T>(hookName: PluginHookName, context: HookContext<T>): Promise<{ context: HookContext<T>; errors: Array<{ pluginName: string; error: Error }> }> {
    const handlers = this.hooks.get(hookName) ?? [];
    let currentContext = context;
    const errors: Array<{ pluginName: string; error: Error }> = [];

    for (const { pluginName, handler } of handlers) {
      const state = this.plugins.get(pluginName);
      if (!state?.enabled) continue;

      try {
        const result = await handler(currentContext);
        if (result !== undefined && result !== null) {
          currentContext = result as HookContext<T>;
        }
      } catch (error) {
        errors.push({
          pluginName,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    return { context: currentContext, errors };
  }

  getHookHandlerCount(hookName: PluginHookName): number {
    return (this.hooks.get(hookName) ?? []).length;
  }

  getPluginHooks(pluginName: string): PluginHookName[] {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }
    const hookNames: PluginHookName[] = [];
    for (const [hookName, handlers] of this.hooks.entries()) {
      if (handlers.some((h) => h.pluginName === pluginName)) {
        hookNames.push(hookName);
      }
    }
    return hookNames;
  }
}
