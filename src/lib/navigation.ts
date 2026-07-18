import {
  LayoutDashboard,
  Coffee,
  ShoppingCart,
  ClipboardList,
  Boxes,
  Heart,
  UserCog,
  BarChart3,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Point of Sale", href: "/pos", icon: ShoppingCart },
      { label: "Orders", href: "/orders", icon: ClipboardList },
      { label: "Products", href: "/products", icon: Coffee },
      { label: "Inventory", href: "/inventory", icon: Boxes },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Loyal Customers", href: "/customers", icon: Heart },
      { label: "Employees", href: "/employees", icon: UserCog },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];
