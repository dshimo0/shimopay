import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ShimoBottomNav, ShimoScreen, ShimoSectionHeader, ShimoTopBar } from "@/components/shimo/ShimoShell";
import { ShimoMark, ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";
import { useMock } from "@/contexts/MockContext";
import {
  deleteLocalData,
  exportLocalData,
  getConsent,
  type ConsentRecord,
} from "@/lib/privacy";

type ProfileView = "main" | "payment" | "security" | "privacy";

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useMock();
  const [currentView, setCurrentView] = useState<ProfileView>("main");
  const [isOnline, setIsOnline] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [streetModeLimit, setStreetModeLimit] = useState([150]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const levelTarget = user.points >= 1000 ? 3000 : 1000;
  const progress = Math.min(100, (user.points / levelTarget) * 100);
  const cashbackTotal = user.points * 0.05;

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (currentView === "payment") {
    return <PaymentMethodsView balance={user.balance} onBack={() => setCurrentView("main")} />;
  }

  if (currentView === "security") {
    return <SecurityView limit={streetModeLimit} setLimit={setStreetModeLimit} onBack={() => setCurrentView("main")} />;
  }

  if (currentView === "privacy") {
    return <PrivacyView onBack={() => setCurrentView("main")} onDataDeleted={handleLogout} />;
  }

  return (
    <ShimoScreen withBottomNav>
      <header className="px-5 pb-5 pt-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShimoMark />
            <div>
              <p className="text-xs font-medium text-slate-500">Perfil</p>
              <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
            </div>
          </div>
          <button
            className={`flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold shadow-sm ${
              isOnline ? "bg-blue-100 text-blue-900" : "bg-amber-100 text-amber-900"
            }`}
            onClick={() => setIsOnline((value) => !value)}
          >
            <ShimoSymbol name="signal" className="h-4 w-4 rounded-none bg-transparent" />
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>

        <section className="relative overflow-hidden rounded-[30px] bg-primary p-5 text-white shadow-xl shadow-slate-900/10">
          <div className="absolute right-[-58px] top-[-48px] h-40 w-40 rounded-full border border-white/10" />
          <div className="relative flex items-start gap-4">
            <ShimoSymbol name="profile" className="h-14 w-14 rounded-[22px] bg-white/10 text-blue-200" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-semibold tracking-tight">{user.name}</h2>
              <p className="mt-1 truncate text-sm text-white/55">{user.email || "email@exemplo.com"}</p>
            </div>
          </div>

          <div className="relative mt-6 rounded-2xl bg-white/[0.07] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Nível {user.level}</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold">{user.points} pts</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/55">Faltam {Math.max(0, levelTarget - user.points)} pontos para o próximo nível.</p>
          </div>
        </section>
      </header>

      <main className="space-y-6 px-5">
        <section className="grid grid-cols-2 gap-3">
          <MetricCard symbol="gift" title="Cashback" value={formatBRL(cashbackTotal)} tone="green" />
          <MetricCard symbol="star" title="Reputação" value="4.9" tone="amber" />
        </section>

        <section>
          <ShimoSectionHeader title="Conta" />
          <div className="space-y-2 rounded-3xl bg-white p-2 shadow-sm">
            <MenuRow symbol="wallet" title="Métodos de pagamento" desc="Saldo, PIX, cartões e viagem" onClick={() => setCurrentView("payment")} />
            <MenuRow symbol="security" title="Segurança e dispositivos" desc="Modo Rua, PIN e aparelhos" onClick={() => setCurrentView("security")} />
            <MenuRow symbol="lock" title="Privacidade e dados" desc="LGPD: exportar ou apagar meus dados" onClick={() => setCurrentView("privacy")} />
            <MenuRow symbol="gift" title="Indicar amigos" desc="Convite com crédito promocional" right="R$ 20" />
          </div>
        </section>

        <section>
          <ShimoSectionHeader title="Preferências" />
          <div className="rounded-3xl bg-white p-2 shadow-sm">
            <div className="flex items-center justify-between rounded-2xl px-3 py-3">
              <div className="flex items-center gap-3">
                <ShimoSymbol name="moon" tone="muted" />
                <span className="text-sm font-semibold">Modo escuro</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-rose-600" onClick={handleLogout}>
              <ShimoSymbol name="logout" tone="rose" />
              <span className="text-sm font-semibold">Sair da conta</span>
            </button>
          </div>
        </section>

        <p className="text-center text-xs font-medium text-slate-400">ShimoPay alpha preview</p>
      </main>

      <ShimoBottomNav active="profile" />
    </ShimoScreen>
  );
};

const PaymentMethodsView = ({ balance, onBack }: { balance: number; onBack: () => void }) => {
  const paymentMethods: Array<{ id: string; name: string; detail: string; symbol: ShimoSymbolName; default?: boolean }> = [
    { id: "wallet", name: "Saldo ShimoPay", detail: formatBRL(balance), symbol: "wallet", default: true },
    { id: "pix", name: "PIX principal", detail: "Banco conectado", symbol: "cash" },
    { id: "card", name: "Cartão final 8899", detail: "Crédito", symbol: "card" },
    { id: "global", name: "Saldo de viagem", detail: "USDC/USDT para visitante", symbol: "global" },
    { id: "points", name: "Benefícios", detail: "Pontos e cashback", symbol: "gift" },
  ];

  return (
    <ShimoScreen withBottomNav>
      <ShimoTopBar title="Métodos" eyebrow="Carteira" backTo="/customer/profile" action={null} />
      <main className="space-y-5 px-5">
        <section className="rounded-[30px] bg-primary p-5 text-white shadow-xl shadow-slate-900/10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200/75">Preferido</p>
          <div className="mt-4 flex items-center gap-3">
            <ShimoSymbol name="wallet" className="h-14 w-14 rounded-[22px] bg-white/10 text-white" />
            <div>
              <h2 className="text-lg font-semibold">Saldo ShimoPay</h2>
              <p className="text-sm text-white/55">{formatBRL(balance)} disponível</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <ShimoSymbol name={method.symbol} tone={method.default ? "green" : "muted"} />
                <div>
                  <p className="text-sm font-semibold">{method.name}</p>
                  <p className="text-xs text-slate-500">{method.detail}</p>
                </div>
              </div>
              {method.default ? <span className="text-xs font-semibold text-blue-700">Padrão</span> : <Button variant="ghost" size="sm">Definir</Button>}
            </div>
          ))}
        </section>

        <Button variant="outline" className="h-12 w-full rounded-2xl border-dashed bg-white">
          Adicionar método
        </Button>
        <Button variant="ghost" className="h-12 w-full rounded-2xl" onClick={onBack}>
          Voltar
        </Button>
      </main>
      <ShimoBottomNav active="profile" />
    </ShimoScreen>
  );
};

const SecurityView = ({
  limit,
  setLimit,
  onBack,
}: {
  limit: number[];
  setLimit: (value: number[]) => void;
  onBack: () => void;
}) => {
  const devices = [
    { id: 1, name: "iPhone 13", location: "São Paulo, BR", status: "Ativo agora", current: true },
    { id: 2, name: "MacBook Pro", location: "São Paulo, BR", status: "Ontem, 22:30" },
    { id: 3, name: "iPad Air", location: "São Paulo, BR", status: "3 dias atrás" },
  ];

  return (
    <ShimoScreen withBottomNav>
      <ShimoTopBar title="Segurança" eyebrow="Modo Rua" backTo="/customer/profile" />
      <main className="space-y-6 px-5">
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <ShimoSymbol name="security" tone="amber" />
            <div>
              <h2 className="text-base font-semibold tracking-tight">Limite fora de casa</h2>
              <p className="text-sm text-slate-600">Reduz risco para PIX e transferências na rua.</p>
            </div>
          </div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Limite</span>
            <span className="text-lg font-semibold text-slate-950">{formatBRL(limit[0])}</span>
          </div>
          <Slider value={limit} max={1000} step={50} onValueChange={setLimit} />
        </section>

        <section>
          <ShimoSectionHeader title="Dispositivos" />
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <ShimoSymbol name="device" tone={device.current ? "green" : "muted"} />
                  <div>
                    <p className="text-sm font-semibold">{device.name}</p>
                    <p className="text-xs text-slate-500">
                      {device.location} · {device.status}
                    </p>
                  </div>
                </div>
                {device.current ? <span className="text-xs font-semibold text-blue-700">Este</span> : <ShimoSymbol name="logout" tone="rose" className="h-8 w-8 rounded-xl" />}
              </div>
            ))}
          </div>
        </section>

        <Button variant="outline" className="h-12 w-full rounded-2xl border-rose-100 bg-white text-rose-600">
          Encerrar todas as sessões
        </Button>
        <Button variant="ghost" className="h-12 w-full rounded-2xl" onClick={onBack}>
          Voltar
        </Button>
      </main>
      <ShimoBottomNav active="profile" />
    </ShimoScreen>
  );
};

const PrivacyView = ({ onBack, onDataDeleted }: { onBack: () => void; onDataDeleted: () => void }) => {
  const [consent, setConsentState] = useState<ConsentRecord | null>(() => getConsent());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleExport = () => {
    const json = exportLocalData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shimopay-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    deleteLocalData();
    setConfirmOpen(false);
    onDataDeleted();
  };

  return (
    <ShimoScreen withBottomNav>
      <ShimoTopBar title="Privacidade" eyebrow="LGPD" backTo="/customer/profile" />
      <main className="space-y-6 px-5">
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <ShimoSymbol name="lock" tone="green" />
            <div>
              <h2 className="text-base font-semibold tracking-tight">Seus dados</h2>
              <p className="text-sm text-slate-600">
                Nesta fase tudo fica apenas no seu navegador. Nada é enviado a servidores.
              </p>
            </div>
          </div>
          <dl className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Consentimento</dt>
              <dd className="font-semibold">{consent?.accepted ? "Aceito" : consent ? "Recusado/revogado" : "Não registrado"}</dd>
            </div>
            {consent && (
              <>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Registrado em</dt>
                  <dd className="font-semibold">{new Date(consent.at).toLocaleString("pt-BR")}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Versão da política</dt>
                  <dd className="font-semibold">{consent.version}</dd>
                </div>
              </>
            )}
          </dl>
        </section>

        <section>
          <ShimoSectionHeader title="Seus direitos (art. 18)" />
          <div className="space-y-3">
            <button
              className="flex w-full items-center justify-between rounded-3xl bg-white p-4 text-left shadow-sm"
              onClick={handleExport}
            >
              <span className="flex items-center gap-3">
                <ShimoSymbol name="upload" tone="blue" />
                <span>
                  <p className="text-sm font-semibold">Exportar meus dados</p>
                  <p className="text-xs text-slate-500">Baixa um arquivo JSON com tudo que o app guarda</p>
                </span>
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Portátil</span>
            </button>

            <button
              className="flex w-full items-center justify-between rounded-3xl bg-white p-4 text-left shadow-sm"
              onClick={() => setConfirmOpen(true)}
            >
              <span className="flex items-center gap-3">
                <ShimoSymbol name="close" tone="rose" />
                <span>
                  <p className="text-sm font-semibold">Apagar meus dados</p>
                  <p className="text-xs text-slate-500">Remove definitivamente cadastro, saldo demo e histórico local</p>
                </span>
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">Irreversível</span>
            </button>

            <Link to="/privacidade" className="flex w-full items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
              <span className="flex items-center gap-3">
                <ShimoSymbol name="document" tone="muted" />
                <span>
                  <p className="text-sm font-semibold">Política de privacidade</p>
                  <p className="text-xs text-slate-500">Rascunho pendente de revisão jurídica</p>
                </span>
              </span>
            </Link>
            <Link to="/termos" className="flex w-full items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
              <span className="flex items-center gap-3">
                <ShimoSymbol name="document" tone="muted" />
                <span>
                  <p className="text-sm font-semibold">Termos de uso</p>
                  <p className="text-xs text-slate-500">Produto alpha: fluxos simulados</p>
                </span>
              </span>
            </Link>
          </div>
        </section>

        <Button variant="ghost" className="h-12 w-full rounded-2xl" onClick={onBack}>
          Voltar
        </Button>
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar todos os seus dados?</AlertDialogTitle>
            <AlertDialogDescription>
              Cadastro, saldo demonstrativo, transações e lojas locais serão removidos do navegador.
              Essa ação não pode ser desfeita e encerra sua sessão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              onClick={handleDelete}
            >
              Apagar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShimoBottomNav active="profile" />
    </ShimoScreen>
  );
};

const MetricCard = ({
  symbol,
  title,
  value,
  tone,
}: {
  symbol: ShimoSymbolName;
  title: string;
  value: string;
  tone: "green" | "amber";
}) => (
  <div className="rounded-3xl bg-white p-4 shadow-sm">
    <ShimoSymbol name={symbol} tone={tone} className="mb-4" />
    <p className="text-xs font-medium text-slate-500">{title}</p>
    <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
  </div>
);

const MenuRow = ({
  symbol,
  title,
  desc,
  right,
  onClick,
}: {
  symbol: ShimoSymbolName;
  title: string;
  desc: string;
  right?: string;
  onClick?: () => void;
}) => (
  <button className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-slate-50" onClick={onClick}>
    <div className="flex min-w-0 items-center gap-3">
      <ShimoSymbol name={symbol} tone="muted" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-slate-500">{desc}</p>
      </div>
    </div>
    {right ? <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{right}</span> : <ShimoSymbol name="pay" className="h-7 w-7 rounded-xl bg-transparent text-slate-400" />}
  </button>
);

export default Profile;
