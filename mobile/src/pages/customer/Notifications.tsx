import { ShimoScreen, ShimoTopBar } from "@/components/shimo/ShimoShell";
import { ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  symbol: ShimoSymbolName;
  tone: "green" | "blue" | "amber" | "rose";
}

const notifications: NotificationItem[] = [
  {
    id: 1,
    title: "Pagamento recebido",
    message: "Você recebeu R$ 50,00 de Maria Silva.",
    time: "Agora",
    unread: true,
    symbol: "receive",
    tone: "green",
  },
  {
    id: 2,
    title: "Oferta em serviço",
    message: "Parceiro de comida liberou 2x1 até às 22h.",
    time: "20 min",
    unread: true,
    symbol: "tag",
    tone: "rose",
  },
  {
    id: 3,
    title: "Novo acesso detectado",
    message: "Login realizado em iPhone 13, São Paulo.",
    time: "1h",
    unread: false,
    symbol: "security",
    tone: "amber",
  },
  {
    id: 4,
    title: "Cashback disponível",
    message: "R$ 2,30 da Padaria São José já entrou na conta.",
    time: "Ontem",
    unread: false,
    symbol: "gift",
    tone: "blue",
  },
];

const Notifications = () => {
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <ShimoScreen>
      <ShimoTopBar
        title="Notificações"
        eyebrow="Central"
        backTo="/customer/home"
        action={<span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">{unreadCount} novas</span>}
      />

      <main className="space-y-3 px-5">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex gap-4 rounded-3xl p-4 shadow-sm ${
              notification.unread ? "border border-blue-900/10 bg-white" : "border border-transparent bg-white/70"
            }`}
          >
            <ShimoSymbol name={notification.symbol} tone={notification.tone} className="h-12 w-12 rounded-[20px]" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between gap-3">
                <h3 className={`truncate text-sm font-semibold ${notification.unread ? "text-slate-950" : "text-slate-600"}`}>{notification.title}</h3>
                <span className="shrink-0 text-[11px] font-semibold text-slate-400">{notification.time}</span>
              </div>
              <p className="text-sm leading-5 text-slate-600">{notification.message}</p>
            </div>
            {notification.unread && <span className="mt-5 h-2 w-2 rounded-full bg-blue-500" />}
          </div>
        ))}

        <div className="pt-8 text-center text-xs font-medium text-slate-400">Fim das notificações recentes</div>
      </main>
    </ShimoScreen>
  );
};

export default Notifications;
