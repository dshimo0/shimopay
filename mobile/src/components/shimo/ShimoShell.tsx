import { Link, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ShimoMark, ShimoSymbol, type ShimoSymbolName } from "./ShimoSymbols";

export const shimoSurface = "bg-background text-slate-950";
export const shimoPanel = "rounded-3xl border border-slate-900/5 bg-white shadow-sm";
export const shimoDarkPanel = "rounded-[30px] bg-primary text-white shadow-xl shadow-slate-900/10";

interface ShimoScreenProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
}

export const ShimoScreen = ({ children, className, withBottomNav = false }: ShimoScreenProps) => (
  <div className={cn("min-h-screen", shimoSurface, withBottomNav && "pb-24", className)}>
    <p className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-xs leading-5 text-amber-950">Alpha demo · Saldos e registros locais, sem liquidação integrada.</p>
    {children}
  </div>
);

interface ShimoTopBarProps {
  title: string;
  eyebrow?: string;
  backTo?: string;
  action?: React.ReactNode;
  className?: string;
}

export const ShimoTopBar = ({ title, eyebrow, backTo, action, className }: ShimoTopBarProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn("sticky top-0 z-20 bg-background/95 px-5 pb-4 pt-6 backdrop-blur", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {backTo ? (
            <Link to={backTo} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Voltar">
                <ShimoSymbol name="back" className="h-5 w-5 rounded-none bg-transparent text-slate-800" />
              </Link>
          ) : (
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
            >
              <ShimoSymbol name="back" className="h-5 w-5 rounded-none bg-transparent text-slate-800" />
            </button>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="text-xs font-medium text-slate-500">{eyebrow}</p>}
            <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          </div>
        </div>
        {action}
      </div>
    </header>
  );
};

export const ShimoSectionHeader = ({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("mb-3 flex items-center justify-between", className)}>
    <h2 className="text-base font-semibold tracking-tight">{title}</h2>
    {action}
  </div>
);

export const ShimoStatusPill = ({
  active,
  activeLabel = "Online",
  inactiveLabel = "Offline",
  onClick,
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  onClick?: () => void;
}) => (
  <button
    className={cn(
      "flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold shadow-sm",
      active ? "bg-blue-100 text-blue-900" : "bg-amber-100 text-amber-900",
    )}
    onClick={onClick}
    type="button"
  >
    <ShimoSymbol name="signal" className="h-4 w-4 rounded-none bg-transparent" />
    {active ? activeLabel : inactiveLabel}
  </button>
);

export const ShimoGlyphAvatar = ({
  symbol,
  label,
  tone = "muted",
  className,
}: {
  symbol: ShimoSymbolName;
  label?: string;
  tone?: "dark" | "light" | "green" | "amber" | "blue" | "rose" | "muted";
  className?: string;
}) => (
  <div className={cn("flex items-center gap-3", className)}>
    <ShimoSymbol name={symbol} tone={tone} />
    {label && <span className="text-sm font-semibold text-slate-800">{label}</span>}
  </div>
);

const customerNav: Array<{ symbol: ShimoSymbolName; label: string; href: string }> = [
  { symbol: "home", label: "Início", href: "/customer/home" },
  { symbol: "wallet", label: "Carteira", href: "/customer/wallet" },
  { symbol: "services", label: "Miniapps", href: "/customer/stores" },
  { symbol: "profile", label: "Perfil", href: "/customer/profile" },
];

export const ShimoBottomNav = (_props: { active?: string }) => (
  <nav className="app-bottom-nav" aria-label="Navegação do aplicativo">
    {customerNav.map(item => <NavLink key={item.href} to={item.href}><ShimoSymbol name={item.symbol} tone="plain" className="h-7 w-7 bg-transparent text-current" /><span>{item.label}</span></NavLink>)}
  </nav>
);

export const ShimoQrMark = ({ className }: { className?: string }) => (
  <div className={cn("grid h-32 w-32 grid-cols-7 gap-1 rounded-[28px] bg-white p-3 shadow-sm", className)} aria-hidden="true">
    {Array.from({ length: 49 }).map((_, index) => {
      const darkBlocks = [0, 1, 2, 7, 14, 15, 16, 4, 5, 6, 11, 18, 19, 20, 28, 29, 35, 42, 43, 44, 31, 38, 45, 34, 40, 41, 48];
      return <span key={index} className={cn("rounded-sm", darkBlocks.includes(index) ? "bg-primary" : "bg-slate-100")} />;
    })}
  </div>
);

export const ShimoBrandHeader = ({ subtitle }: { subtitle?: string }) => (
  <div className="flex items-center gap-3">
    <ShimoMark />
    <div>
      <p className="text-lg font-semibold tracking-tight">ShimoPay</p>
      {subtitle && <p className="text-xs font-medium text-slate-500">{subtitle}</p>}
    </div>
  </div>
);
