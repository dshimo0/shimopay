import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShimoMark } from "@/components/shimo/ShimoSymbols";
import { useMock } from "@/contexts/MockContext";
import { DEMO_ACCOUNTS } from "@/domain/ledger";
import type { AuditEvent, AuditRole } from "@/domain/audit";
import {
  clearOperator,
  getAuditLog,
  getOperator,
  getUserStatuses,
  recordAudit,
  setOperator,
  setUserStatus,
  type Operator,
  type UserStatus,
} from "@/lib/adminStore";
import { getStores, getTransactions } from "@/lib/storage";
import { getPixConfig, setPixConfig, isPlaceholderKey, type PixConfig } from "@/lib/pixConfig";

// Portal de backoffice DEMO para operacao interna (PRD §5.5).
// Sem auth real/RBAC de servidor: o papel do operador e escolhido na entrada
// e as acoes ficam registradas em trilha de auditoria local append-only.
// Nenhuma acao altera pagamentos; bloqueios sao overrides locais documentados.

const ROLE_LABELS: Record<AuditRole, string> = {
  support: "Suporte",
  risk: "Risco",
  admin: "Admin",
};

const ACTION_LABELS: Record<string, string> = {
  user_blocked: "Usuário bloqueado",
  user_unblocked: "Usuário desbloqueado",
  incident_flagged: "Incidente marcado",
  limit_adjusted: "Limite ajustado",
  data_export_requested: "Exportação de dados",
  data_delete_requested: "Exclusão de dados",
  consent_recorded: "Consentimento registrado",
};

interface DirectoryEntry {
  id: string;
  name: string;
  detail: string;
  kind: "customer" | "merchant";
  source: string;
}

const AdminPage = () => {
  const [operator, setOperatorState] = useState<Operator | null>(() => getOperator());

  if (!operator) {
    return (
      <OperatorLogin
        onEnter={(entry) => {
          setOperator(entry);
          setOperatorState(entry);
        }}
      />
    );
  }

  return (
    <AdminDashboard
      operator={operator}
      onExit={() => {
        clearOperator();
        setOperatorState(null);
      }}
    />
  );
};

const OperatorLogin = ({ onEnter }: { onEnter: (operator: Operator) => void }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<AuditRole>("support");

  const enter = () => {
    if (!name.trim()) {
      toast.error("Informe o nome do operador.");
      return;
    }
    onEnter({ id: `op-${role}`, name: name.trim(), role });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-5 text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <ShimoMark className="h-12 w-12 rounded-[18px] bg-white text-slate-950" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">ShimoPay Backoffice</h1>
            <p className="text-xs text-white/50">Operação interna · ambiente demonstrativo</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs leading-5 text-amber-200">
          <strong>DEMO.</strong> Não há autenticação real nem RBAC de servidor nesta fase. As ações
          ficam em uma trilha de auditoria local e bloqueios não afetam fluxos de pagamento.
        </div>

        <div className="space-y-4 rounded-3xl bg-white/[0.06] p-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Operador</span>
            <Input
              className="mt-2 h-12 rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-white/30"
              placeholder="Seu nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Papel</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(ROLE_LABELS) as AuditRole[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setRole(option)}
                  className={`h-11 rounded-2xl text-sm font-semibold transition ${
                    role === option ? "bg-blue-400 text-slate-950" : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
                >
                  {ROLE_LABELS[option]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-4 text-white/40">
              Suporte marca incidentes. Risco/Admin bloqueiam. Admin ajusta limites.
            </p>
          </div>
          <Button className="h-12 w-full rounded-2xl bg-blue-400 font-semibold text-slate-950 hover:bg-blue-300" onClick={enter}>
            Entrar no backoffice
          </Button>
          <Link to="/" className="block text-center text-xs text-white/40 hover:text-white/70">
            ← Voltar para o app
          </Link>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ operator, onExit }: { operator: Operator; onExit: () => void }) => {
  const { user, transactions } = useMock();
  const [query, setQuery] = useState("");
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(() => getAuditLog());
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>(() => getUserStatuses());
  const [pixConfig, setPixConfigState] = useState<PixConfig>(() => getPixConfig());

  const canBlock = operator.role === "risk" || operator.role === "admin";
  const canAdjustLimit = operator.role === "admin";

  const directory = useMemo<DirectoryEntry[]>(() => {
    const entries: DirectoryEntry[] = [
      {
        id: "user-demo-customer",
        name: DEMO_ACCOUNTS.customer.name,
        detail: `Cliente demo · saldo R$ ${DEMO_ACCOUNTS.customer.balance.toFixed(2)}`,
        kind: "customer",
        source: "mock",
      },
      {
        id: "user-demo-merchant",
        name: DEMO_ACCOUNTS.merchant.name,
        detail: `Lojista demo · saldo R$ ${DEMO_ACCOUNTS.merchant.balance.toFixed(2)}`,
        kind: "merchant",
        source: "mock",
      },
    ];
    if (user) {
      entries.push({
        id: `user-session-${user.type}`,
        name: `${user.name} (sessão atual)`,
        detail: `${user.email} · ${user.type}`,
        kind: user.type === "customer" ? "customer" : "merchant",
        source: "sessão",
      });
    }
    for (const store of getStores()) {
      entries.push({
        id: `merchant-${store.id}`,
        name: store.name,
        detail: [store.category, store.address].filter(Boolean).join(" · ") || "Loja local",
        kind: "merchant",
        source: "localStorage",
      });
    }
    return entries;
  }, [user]);

  const allTransactions = useMemo(() => {
    const sessionTx = transactions.map((tx) => ({
      id: `tx-${tx.id}`,
      label: `${tx.type === "sent" ? "Enviado" : "Recebido"} ${tx.amount.toFixed(2)} · ${tx.name}`,
      when: tx.date,
      source: "sessão/mock",
    }));
    const storedTx = getTransactions().map((tx) => ({
      id: `stored-${tx.id}`,
      label: `${tx.type === "sent" ? "Enviado" : "Recebido"} ${tx.amount.toFixed(2)} · ${tx.counterpartyName}`,
      when: new Date(tx.createdAt).toLocaleString("pt-BR"),
      source: "localStorage",
    }));
    return [...sessionTx, ...storedTx];
  }, [transactions]);

  const matchesQuery = (...fields: Array<string | undefined>) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return fields.some((field) => field?.toLowerCase().includes(q));
  };

  const act = (fn: () => void, success: string) => {
    fn();
    setAuditLog(getAuditLog());
    toast.success(success);
  };

  const toggleBlock = (entry: DirectoryEntry) => {
    const next: UserStatus = statuses[entry.id] === "blocked" ? "active" : "blocked";
    act(() => {
      setUserStatus(entry.id, next);
      recordAudit({
        actorId: operator.id,
        actorRole: operator.role,
        action: next === "blocked" ? "user_blocked" : "user_unblocked",
        targetType: entry.kind === "merchant" ? "merchant" : "user",
        targetId: entry.id,
        note: entry.name,
      });
    }, `${entry.name}: ${next === "blocked" ? "bloqueado" : "desbloqueado"} (override local)`);
    setStatuses(getUserStatuses());
  };

  const flagTransaction = (txId: string, label: string) => {
    act(() => {
      recordAudit({
        actorId: operator.id,
        actorRole: operator.role,
        action: "incident_flagged",
        targetType: "transaction",
        targetId: txId,
        note: label,
      });
    }, "Incidente registrado na trilha");
  };

  const adjustLimit = (entry: DirectoryEntry, cents: number) => {
    act(() => {
      recordAudit({
        actorId: operator.id,
        actorRole: operator.role,
        action: "limit_adjusted",
        targetType: "allowance",
        targetId: entry.id,
        note: `Reserva offline ajustada para ${(cents / 100).toFixed(2)} (demo)`,
      });
    }, "Limite registrado na trilha");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShimoMark className="h-10 w-10 rounded-[14px]" />
            <div>
              <p className="text-xs font-medium text-slate-500">Backoffice · demo</p>
              <h1 className="text-lg font-semibold tracking-tight">Operação ShimoPay</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-blue-700">
              {operator.name} · {ROLE_LABELS[operator.role]}
            </Badge>
            <Button variant="ghost" size="sm" className="rounded-full text-slate-500" onClick={onExit}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Ambiente demonstrativo: busca sobre dados locais/mock, ações registradas em auditoria
          append-only. Bloqueios são overrides locais e <strong>não</strong> afetam pagamentos.
          Este painel utiliza registros locais.
        </div>

        <Input
          className="h-12 rounded-2xl border-slate-200 bg-white"
          placeholder="Buscar usuário, lojista ou transação por nome, ID ou detalhe…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
              Usuários e lojistas
            </h2>
            {directory.filter((e) => matchesQuery(e.id, e.name, e.detail)).map((entry) => {
              const status: UserStatus = statuses[entry.id] ?? "active";
              return (
                <div key={entry.id} className="rounded-2xl border border-slate-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{entry.name}</p>
                      <p className="truncate text-xs text-slate-500">{entry.detail}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${
                        status === "blocked"
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-blue-200 bg-blue-50 text-blue-700"
                      }`}
                    >
                      {status === "blocked" ? "Bloqueado" : "Ativo"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canBlock}
                      className="rounded-full text-xs"
                      onClick={() => toggleBlock(entry)}
                    >
                      {status === "blocked" ? "Desbloquear" : "Bloquear"}
                    </Button>
                    {canAdjustLimit && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => adjustLimit(entry, 30000)}
                      >
                        Ajustar limite offline p/ R$ 300
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
              Transações recentes
            </h2>
            {allTransactions.filter((t) => matchesQuery(t.id, t.label)).slice(0, 8).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{tx.label}</p>
                  <p className="text-xs text-slate-500">
                    {tx.when} · fonte: {tx.source}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 rounded-full text-xs" onClick={() => flagTransaction(tx.id, tx.label)}>
                  Incidente
                </Button>
              </div>
            ))}
            {allTransactions.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
                Nenhuma transação local ainda. Pague algo no app demo para ver aqui.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
              Configuração Pix (BR Code)
            </h2>
            <Badge
              variant="outline"
              className={`rounded-full ${
                isPlaceholderKey(pixConfig)
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {isPlaceholderKey(pixConfig) ? "Chave placeholder — QR não pagável" : "Chave configurada — QR pagável"}
            </Badge>
          </div>
          <p className="mb-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Cole uma chave Pix real (telefone, e-mail, CPF/CNPJ ou aleatória) para que os QRs do
            app e do lojista virem pagáveis por qualquer banco. Cobrança com confirmação
            automática não está disponível neste painel.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Chave Pix</span>
              <Input
                className="mt-1 h-11 rounded-xl border-slate-200"
                value={pixConfig.key}
                onChange={(event) => setPixConfigState({ ...pixConfig, key: event.target.value })}
                placeholder="telefone/e-mail/chave aleatória"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Nome do recebedor</span>
              <Input
                className="mt-1 h-11 rounded-xl border-slate-200"
                value={pixConfig.merchantName}
                onChange={(event) => setPixConfigState({ ...pixConfig, merchantName: event.target.value })}
                maxLength={25}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Cidade</span>
              <Input
                className="mt-1 h-11 rounded-xl border-slate-200"
                value={pixConfig.merchantCity}
                onChange={(event) => setPixConfigState({ ...pixConfig, merchantCity: event.target.value })}
                maxLength={15}
              />
            </label>
          </div>
          <Button
            size="sm"
            className="mt-4 rounded-full bg-primary hover:bg-primary/90"
            onClick={() => {
              if (!pixConfig.key.trim()) {
                toast.error("Informe uma chave Pix.");
                return;
              }
              act(() => {
                setPixConfig(pixConfig);
                recordAudit({
                  actorId: operator.id,
                  actorRole: operator.role,
                  action: "limit_adjusted",
                  targetType: "merchant",
                  targetId: "pix-config",
                  note: `Chave Pix atualizada (${isPlaceholderKey(pixConfig) ? "placeholder" : "real"})`,
                });
              }, "Configuração Pix salva.");
            }}
          >
            Salvar configuração Pix
          </Button>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
            Trilha de auditoria ({auditLog.length})
          </h2>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {auditLog.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{ACTION_LABELS[event.action] ?? event.action}</p>
                  <p className="text-slate-500">
                    {event.targetType}:{event.targetId} · por {event.actorRole}
                    {event.note ? ` · ${event.note}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-slate-400">{new Date(event.at).toLocaleString("pt-BR")}</span>
              </div>
            ))}
            {auditLog.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
                Nenhum evento ainda. Ações desta tela aparecem aqui.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
