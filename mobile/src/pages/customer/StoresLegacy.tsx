import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { BikeSampaApp } from "@/components/miniapps/BikeSampaApp";
import { GoalsApp } from "@/components/miniapps/GoalsApp";
import { McDonaldsApp } from "@/components/miniapps/McDonaldsApp";
import { SplitBillApp } from "@/components/miniapps/SplitBillApp";
import { UberApp } from "@/components/miniapps/UberApp";
import { ShimoBottomNav, ShimoScreen, ShimoStatusPill } from "@/components/shimo/ShimoShell";
import { ShimoMark, ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";

interface ThirdPartyMiniApp {
  id: string;
  name: string;
  partner: string;
  symbol: ShimoSymbolName;
  category: string;
  cashback: number;
  description: string;
  featured?: boolean;
  tone: "green" | "blue" | "amber" | "rose" | "muted";
}

const apps: ThirdPartyMiniApp[] = [
  { id: "split_bill", name: "Rachar Conta", partner: "Shimo Utils", symbol: "split", category: "utilities", cashback: 0, description: "Divida mesa, bar e viagem em segundos.", featured: true, tone: "green" },
  { id: "goals", name: "Minhas Metas", partner: "Shimo Bank", symbol: "trend", category: "utilities", cashback: 1, description: "Separe saldo para objetivos.", featured: true, tone: "amber" },
  { id: "mcdonalds", name: "Méqui Delivery", partner: "McDonald's", symbol: "food", category: "food", cashback: 3, description: "Peça e pague dentro do ShimoPay.", featured: true, tone: "rose" },
  { id: "ifood", name: "Delivery Express", partner: "Parceiros locais", symbol: "food", category: "food", cashback: 2, description: "Restaurantes próximos.", tone: "rose" },
  { id: "uber", name: "Corridas", partner: "Mobilidade urbana", symbol: "ride", category: "transport", cashback: 1, description: "Chame carro sem sair do app.", featured: true, tone: "blue" },
  { id: "bike_sampa", name: "Bike Sampa", partner: "Prefeitura SP", symbol: "bike", category: "transport", cashback: 0, description: "Desbloqueio com QR.", tone: "amber" },
  { id: "bilhete_unico", name: "Bilhete Único", partner: "SPTrans", symbol: "card", category: "transport", cashback: 0, description: "Recarga de transporte.", tone: "blue" },
  { id: "market", name: "Mercado Rápido", partner: "Varejo local", symbol: "bag", category: "shopping", cashback: 4, description: "Compras de bairro.", featured: true, tone: "green" },
  { id: "cinema", name: "Cinema", partner: "Entretenimento", symbol: "star", category: "entertainment", cashback: 6, description: "Ingressos e combos.", tone: "amber" },
  { id: "clinic", name: "Consulta", partner: "Saúde", symbol: "security", category: "services", cashback: 5, description: "Agendamento e pagamento.", tone: "blue" },
  { id: "detran", name: "DETRAN SP", partner: "Governo SP", symbol: "document", category: "government", cashback: 0, description: "Taxas e licenciamento.", tone: "muted" },
  { id: "invest", name: "Investimentos", partner: "Shimo Invest", symbol: "chart", category: "finance", cashback: 0, description: "Saldos e rendimento.", tone: "green" },
];

const categories: Array<{ id: string; name: string; symbol: ShimoSymbolName }> = [
  { id: "all", name: "Todos", symbol: "services" },
  { id: "utilities", name: "Utilidades", symbol: "split" },
  { id: "food", name: "Comida", symbol: "food" },
  { id: "transport", name: "Transporte", symbol: "ride" },
  { id: "shopping", name: "Compras", symbol: "bag" },
  { id: "entertainment", name: "Lazer", symbol: "star" },
  { id: "services", name: "Serviços", symbol: "settings" },
  { id: "government", name: "Governo", symbol: "document" },
  { id: "finance", name: "Finanças", symbol: "chart" },
];

const Stores = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<ThirdPartyMiniApp | null>(null);

  const filteredApps = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
      const matchesSearch = !q || [app.name, app.partner, app.description].some((value) => value.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  const featuredApps = apps.filter((app) => app.featured);

  return (
    <ShimoScreen withBottomNav>
      <header className="px-5 pb-5 pt-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/customer/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Voltar">
                <ShimoSymbol name="back" className="h-5 w-5 rounded-none bg-transparent text-slate-800" />
              </Link>
            <div>
              <p className="text-xs font-medium text-slate-500">Apps e serviços</p>
              <h1 className="text-xl font-semibold tracking-tight">Serviços</h1>
            </div>
          </div>
          <ShimoStatusPill active={isOnline} onClick={() => setIsOnline((value) => !value)} />
        </div>

        <section className="relative overflow-hidden rounded-[30px] bg-primary p-5 text-white shadow-xl shadow-slate-900/10">
          <div className="absolute right-[-54px] top-[-46px] h-36 w-36 rounded-full border border-white/10" />
          <div className="relative flex items-start gap-4">
            <ShimoMark className="bg-white/10" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200/75">Serviços</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Escolha o que precisa</h2>
              <p className="mt-2 text-sm leading-5 text-white/60">Explore comida, mobilidade e serviços conectados à carteira. Miniapps demonstrativos: nenhuma compra ou solicitação externa é realizada.</p>
            </div>
          </div>

          <div className="relative mt-5 flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-slate-950">
            <ShimoSymbol name="search" className="h-7 w-7 rounded-xl bg-slate-100 text-slate-600" />
            <input
              type="text"
              aria-label="Buscar miniapps" placeholder="Buscar serviço, parceiro ou uso"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </section>
      </header>

      <main className="space-y-6 px-5">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">Visão de superapp · As marcas exibidas são referências de demonstração, sem parceria ou integração comercial confirmada.</p>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                selectedCategory === category.id ? "bg-primary text-white" : "bg-white text-slate-600 shadow-sm"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <ShimoSymbol name={category.symbol} className="h-5 w-5 rounded-none bg-transparent" />
              {category.name}
            </button>
          ))}
        </div>

        {selectedCategory === "all" && !searchTerm && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight">Em destaque</h2>
              <span className="text-xs font-semibold text-slate-500">Demonstrações</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {featuredApps.map((app) => (
                <button key={app.id} className="rounded-3xl bg-white p-3 text-left shadow-sm" onClick={() => setSelectedApp(app)}>
                  <ShimoSymbol name={app.symbol} tone={app.tone} className="mb-3" />
                  <p className="truncate text-xs font-semibold">{app.name}</p>
                  {app.cashback > 0 && <p className="mt-1 text-[11px] font-semibold text-blue-700">{app.cashback}% simulado</p>}
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">{selectedCategory === "all" ? "Todos os serviços" : categories.find((c) => c.id === selectedCategory)?.name}</h2>
            <span className="text-xs font-semibold text-slate-500">{filteredApps.length}</span>
          </div>

          <div className="space-y-3">
            {filteredApps.map((app) => (
              <button key={app.id} className="flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-sm" onClick={() => setSelectedApp(app)}>
                <ShimoSymbol name={app.symbol} tone={app.tone} className="h-12 w-12 rounded-[20px]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{app.name}</p>
                    {app.cashback > 0 && <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">{app.cashback}% demo</span>}
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{app.description}</p>
                  <p className="mt-2 text-[11px] font-medium text-slate-400">
                    Miniapp demonstrativo
                  </p>
                </div>
                <ShimoSymbol name="pay" className="h-8 w-8 rounded-xl bg-slate-100 text-slate-500" />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/10 bg-blue-50 p-4 text-blue-950">
          <div className="flex items-start gap-3">
            <ShimoSymbol name="package" tone="green" />
            <div>
              <h3 className="text-sm font-semibold">Pagamento dentro do app</h3>
              <p className="mt-1 text-sm leading-5 text-blue-900/70">Ao abrir um serviço, você confirma o valor e paga com saldo ShimoPay.</p>
            </div>
          </div>
        </section>
      </main>

      <Drawer open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DrawerContent className="h-[86vh]">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-slate-100 text-left">
              <div className="flex items-center gap-3">
                {selectedApp && <ShimoSymbol name={selectedApp.symbol} tone={selectedApp.tone} className="h-12 w-12 rounded-[20px]" />}
                <div>
                  <DrawerTitle>{selectedApp?.name}</DrawerTitle>
                  <DrawerDescription>{selectedApp?.partner} no ShimoPay</DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <div className="min-h-0 flex-1 overflow-y-auto bg-background">
              {selectedApp?.id === "split_bill" ? (
                <SplitBillApp />
              ) : selectedApp?.id === "goals" ? (
                <GoalsApp />
              ) : selectedApp?.id === "mcdonalds" ? (
                <McDonaldsApp />
              ) : selectedApp?.id === "uber" ? (
                <UberApp />
              ) : selectedApp?.id === "bike_sampa" ? (
                <BikeSampaApp />
              ) : (
                <div className="p-5">
                  <div className="rounded-[30px] bg-white p-5 text-center shadow-sm">
                    {selectedApp && <ShimoSymbol name={selectedApp.symbol} tone={selectedApp.tone} className="mx-auto mb-4 h-16 w-16 rounded-[24px]" />}
                    <h3 className="text-lg font-semibold tracking-tight">{selectedApp?.name}</h3>
                    <p className="mt-2 text-sm leading-5 text-slate-600">{selectedApp?.description}</p>
                    <Button className="mt-5 h-12 w-full rounded-2xl bg-primary hover:bg-primary/90" disabled>Em breve na demonstração</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <ShimoBottomNav active="stores" />
    </ShimoScreen>
  );
};

export default Stores;
