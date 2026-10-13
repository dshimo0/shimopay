import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SplitBillApp } from "@/components/miniapps/SplitBillApp";
import { ShimoQrCode } from "@/components/shimo/ShimoQrCode";
import { ShimoMark, ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";
import { useMock } from "@/contexts/MockContext";
import { buildCurrentPixPayload, getPixConfig, isPlaceholderKey } from "@/lib/pixConfig";

const QR = () => {
  const { user } = useMock();
  const navigate = useNavigate();
  const [token, setToken] = useState("1234-5678-9012");
  const [timeLeft, setTimeLeft] = useState(60);
  const [splitBillOpen, setSplitBillOpen] = useState(false);

  // Payload Pix EMV real: com chave valida configurada no /admin, o QR e
  // pagavel por qualquer app bancario. Placeholder => apenas demonstrativo.
  const pixConfig = useMemo(() => getPixConfig(), []);
  const pixPayload = useMemo(() => buildCurrentPixPayload(), []);
  const isDemoPix = isPlaceholderKey(pixConfig);

  const copyPixPayload = async () => {
    if (!pixPayload) {
      toast.error("Configure a chave Pix no portal admin para gerar o código.");
      return;
    }
    try {
      await navigator.clipboard.writeText(pixPayload);
      toast.success("Pix copia-e-cola na área de transferência.");
    } catch {
      toast.error("Não foi possível copiar neste navegador.");
    }
  };

  const generateNewToken = () => {
    const random = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setToken(random.match(/.{1,4}/g)?.join("-") || random);
    setTimeLeft(60);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          generateNewToken();
          return 60;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-8 text-slate-950">
      <header className="px-5 pb-4 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" onClick={() => navigate(-1)} aria-label="Voltar">
            <ShimoSymbol name="back" className="h-5 w-5 rounded-none bg-transparent text-slate-800" />
          </button>
          <div>
            <p className="text-xs font-medium text-slate-500">Código ShimoPay</p>
            <h1 className="text-xl font-semibold tracking-tight">Pagar e receber</h1>
          </div>
        </div>
      </header>

      <main className="px-5">
        <Tabs defaultValue="receive" className="w-full">
          <TabsList className="mb-5 grid h-12 w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-sm">
            <TabsTrigger value="receive" className="rounded-xl">
              Receber
            </TabsTrigger>
            <TabsTrigger value="pay" className="rounded-xl">
              Pagar offline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receive" className="mt-0 space-y-5">
            <section className="rounded-[30px] bg-white p-5 text-center shadow-sm">
              <ShimoMark className="mx-auto mb-4 h-14 w-14 rounded-full" />
              <h2 className="text-lg font-semibold tracking-tight">{user?.name}</h2>
              <p className="text-sm text-slate-500">Receber via Pix · {pixConfig.merchantName}</p>

              <Badge
                variant="outline"
                className={`mt-3 rounded-full ${
                  isDemoPix
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {isDemoPix ? "Demonstrativo — chave Pix placeholder" : "Pix pagável — escaneie com seu banco"}
              </Badge>

              <div className="my-7">
                <ShimoQrCode
                  value={pixPayload ?? "shimopay:configure-chave-pix-no-admin"}
                  label="QR Code Pix para receber"
                  className="mx-auto aspect-square w-64"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ActionButton symbol="send" label="Compartilhar" onClick={() => toast.success("Link de recebimento copiado.")} />
                <ActionButton symbol="receipt" label="Copiar Pix" onClick={copyPixPayload} />
              </div>
            </section>

            <Button className="h-12 w-full rounded-2xl" onClick={() => setSplitBillOpen(true)}>
              <ShimoSymbol name="split" className="mr-2 h-6 w-6 rounded-none bg-transparent" />
              Rachar conta
            </Button>
          </TabsContent>

          <TabsContent value="pay" className="mt-0 space-y-5">
            <section className="relative overflow-hidden rounded-[30px] bg-primary p-5 text-white shadow-xl shadow-slate-900/10">
              <div className="absolute right-[-52px] top-[-48px] h-40 w-40 rounded-full border border-white/10" />
              <div className="relative mb-5 flex items-center justify-between gap-4">
                <div>
                  <ShimoSymbol name="offline" className="mb-3 bg-blue-400 text-slate-950" />
                  <h2 className="text-xl font-semibold tracking-tight">Código para pagar sem sinal</h2>
                  <p className="mt-1 text-sm leading-5 text-white/60">Mostre ao lojista. O comprovante é assinado no aparelho.</p>
                </div>
                <ShimoSymbol name="security" className="bg-white/10 text-blue-200" />
              </div>

              <div className="relative rounded-[28px] bg-white p-4 text-slate-950">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  QR demo — token rotativo
                </p>
                <ShimoQrCode value={token} label="QR do token offline demonstrativo" className="mx-auto aspect-square w-48" />
                <div className="mt-5 text-center">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Token</p>
                  <p className="mt-1 font-mono text-2xl font-semibold tracking-wider">{token}</p>
                </div>
              </div>

              <div className="relative mt-4 space-y-2">
                <div className="flex justify-between text-xs font-medium text-white/60">
                  <span>Atualiza em {timeLeft}s</span>
                  <span className="text-blue-200">Identidade local ok</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: `${(timeLeft / 60) * 100}%` }} />
                </div>
              </div>
            </section>

            <Button variant="outline" className="h-12 w-full rounded-2xl bg-white" onClick={generateNewToken}>
              <ShimoSymbol name="sync" className="mr-2 h-5 w-5 rounded-none bg-transparent" />
              Atualizar código agora
            </Button>
          </TabsContent>
        </Tabs>
      </main>

      <Drawer open={splitBillOpen} onOpenChange={setSplitBillOpen}>
        <DrawerContent className="h-[90vh]">
          <SplitBillApp />
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const ActionButton = ({ symbol, label, onClick }: { symbol: ShimoSymbolName; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center rounded-2xl bg-slate-50 p-3 text-center transition active:scale-[0.98]">
    <ShimoSymbol name={symbol} className="mb-1 h-8 w-8 rounded-xl bg-white text-slate-800 shadow-sm" />
    <span className="text-xs font-semibold text-slate-700">{label}</span>
  </button>
);

export default QR;
