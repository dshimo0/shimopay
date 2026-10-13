import type { LucideIcon } from "lucide-react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bike,
  Check,
  Clock3,
  CreditCard,
  DollarSign,
  FileText,
  Gift,
  GitBranch,
  Globe,
  Grid2X2,
  Home,
  Key,
  Lock,
  LogOut,
  MapPin,
  Moon,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Signal,
  Smartphone,
  Star,
  Store,
  Tag,
  TrendingUp,
  Upload,
  User,
  Users,
  Utensils,
  Wallet,
  WifiOff,
  X,
  Car,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type ShimoSymbolName =
  | "add"
  | "back"
  | "bell"
  | "bike"
  | "bag"
  | "card"
  | "cash"
  | "chart"
  | "check"
  | "clock"
  | "close"
  | "device"
  | "document"
  | "food"
  | "gift"
  | "global"
  | "home"
  | "key"
  | "lock"
  | "logout"
  | "map"
  | "merchant"
  | "moon"
  | "offline"
  | "package"
  | "pay"
  | "phone"
  | "profile"
  | "receive"
  | "receipt"
  | "report"
  | "ride"
  | "search"
  | "security"
  | "send"
  | "services"
  | "settings"
  | "signal"
  | "split"
  | "star"
  | "store"
  | "sync"
  | "tag"
  | "trend"
  | "upload"
  | "users"
  | "wallet";

type SymbolTone =
  | "solid"
  | "soft"
  | "line"
  | "plain"
  | "muted"
  | "light"
  | "dark"
  | "green"
  | "amber"
  | "blue"
  | "rose";

interface ShimoSymbolProps {
  name: ShimoSymbolName;
  tone?: SymbolTone;
  className?: string;
}

const toneClass: Record<SymbolTone, string> = {
  solid: "bg-[#1e40ff] text-white shadow-sm shadow-[#1e40ff]/15",
  soft: "bg-[#e6efff] text-[#1e40ff]",
  line: "border border-[#d6e1f5] bg-white text-[#1733c9]",
  plain: "bg-transparent text-[#1e40ff]",
  muted: "bg-[#f4f6fc] text-[#526382]",
  light: "bg-white/80 text-[#1e40ff]",
  dark: "bg-[#0f172a] text-white",
  green: "bg-[#e6efff] text-[#1e40ff]",
  amber: "bg-[#ffe4d4] text-[#a74012]",
  blue: "bg-[#e6efff] text-[#1e40ff]",
  rose: "bg-[#ffebe9] text-[#b42318]",
};

const iconMap: Record<ShimoSymbolName, LucideIcon> = {
  add: Plus,
  back: ArrowLeft,
  bell: Bell,
  bike: Bike,
  bag: ShoppingBag,
  card: CreditCard,
  cash: DollarSign,
  chart: BarChart3,
  check: Check,
  clock: Clock3,
  close: X,
  device: Smartphone,
  document: FileText,
  food: Utensils,
  gift: Gift,
  global: Globe,
  home: Home,
  key: Key,
  lock: Lock,
  logout: LogOut,
  map: MapPin,
  merchant: Store,
  moon: Moon,
  offline: WifiOff,
  package: Package,
  pay: ArrowUpRight,
  phone: Smartphone,
  profile: User,
  receive: ArrowDownLeft,
  receipt: Receipt,
  report: FileText,
  ride: Car,
  search: Search,
  security: ShieldCheck,
  send: Send,
  services: Grid2X2,
  settings: Settings,
  signal: Signal,
  split: GitBranch,
  star: Star,
  store: Store,
  sync: RefreshCw,
  tag: Tag,
  trend: TrendingUp,
  upload: Upload,
  users: Users,
  wallet: Wallet,
};

export function ShimoSymbol({ name, tone = "soft", className }: ShimoSymbolProps) {
  const Icon = iconMap[name];

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]",
        toneClass[tone],
        className,
      )}
    >
      <Icon className="h-[54%] w-[54%]" strokeWidth={2.2} />
    </span>
  );
}

export function ShimoMark({ className }: { className?: string }) {
  return <img src="/brand/mark.svg" alt="" aria-hidden="true" width="40" height="40" className={cn("shimo-mark h-10 w-10 shrink-0 object-contain", className)} />;
}
