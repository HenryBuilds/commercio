export type NavItem =
  | { title: string; href: string }
  | { separator: true; label: string };

export const navigation: NavItem[] = [
  { title: "Start", href: "/" },
  { title: "Installation", href: "/installation" },
  { title: "Quick Start", href: "/quick-start" },
  { separator: true, label: "Modules" },
  { title: "Categories", href: "/categories" },
  { title: "Products", href: "/products" },
  { title: "Product Variants", href: "/product-variants" },
  { title: "Customers", href: "/customers" },
  { title: "Addresses", href: "/addresses" },
  { title: "Warehouses", href: "/warehouses" },
  { title: "Inventory", href: "/inventory" },
  { title: "Orders", href: "/orders" },
  { title: "Invoices", href: "/invoices" },
  { title: "Payments", href: "/payments" },
  { title: "Shipping", href: "/shipping" },
  { title: "Pricing", href: "/pricing" },
  { title: "Tax", href: "/tax" },
  { title: "Suppliers", href: "/suppliers" },
  { title: "Promotions", href: "/promotions" },
  { separator: true, label: "Advanced" },
  { title: "Audit Log", href: "/audit-log" },
  { title: "Webhooks", href: "/webhooks" },
  { title: "Multi-Currency", href: "/currency" },
  { title: "Reorder Rules", href: "/reorder" },
  { title: "Cart Rules", href: "/cart-rules" },
  { title: "Reporting", href: "/reporting" },
  { title: "RMA / Returns", href: "/rma" },
  { title: "Batch Tracking", href: "/batch-tracking" },
  { title: "Plugin System", href: "/plugins" },
  { title: "Search", href: "/search" },
  { separator: true, label: "Workflows" },
  { title: "Order-to-Cash", href: "/workflows/order-to-cash" },
  { title: "Procurement", href: "/workflows/procurement" },
  { title: "Returns & Refund", href: "/workflows/returns" },
  { title: "International Sales", href: "/workflows/international-sales" },
  { title: "Inventory Mgmt", href: "/workflows/inventory-management" },
  { separator: true, label: "Reference" },
  { title: "API Reference", href: "/api" },
];

/** Only the linkable pages (no separators), for prev/next navigation. */
export const pages = navigation.filter(
  (item): item is { title: string; href: string } => "href" in item
);
