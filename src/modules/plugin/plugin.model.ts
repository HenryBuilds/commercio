export type PluginHookName =
  | "beforeOrderCreate"
  | "afterOrderCreate"
  | "beforeOrderConfirm"
  | "afterOrderConfirm"
  | "beforeOrderCancel"
  | "afterOrderCancel"
  | "beforePaymentCreate"
  | "afterPaymentCreate"
  | "beforeProductCreate"
  | "afterProductCreate"
  | "beforeCustomerCreate"
  | "afterCustomerCreate"
  | "beforeInvoiceCreate"
  | "afterInvoiceCreate"
  | "beforeStockChange"
  | "afterStockChange";

export type HookHandler<T = unknown> = (context: T) => Promise<T | void>;

export interface PluginRegistration {
  name: string;
  version: string;
  hooks: Partial<Record<PluginHookName, HookHandler>>;
}

export interface HookContext<T = unknown> {
  data: T;
  metadata?: Record<string, unknown>;
}
