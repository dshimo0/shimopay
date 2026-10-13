import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";
import { useMock } from "@/contexts/MockContext";
import {
  getStoredCredential,
  isPlatformAuthenticatorAvailable,
  registerDeviceCredential,
  verifyWithDeviceBiometry,
} from "@/lib/webauthn";

type PaymentMethod = {
  id: string;
  name: string;
  detail: string;
  symbol: ShimoSymbolName;
};

const Scanner = () => {
  const navigate = useNavigate();
  const { pay, user } = useMock();
  const [scanning, setScanning] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("wallet");
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [tapMode, setTapMode] = useState(false);
  // Biometria real do dispositivo via WebAuthn; PIN demo como fallback.
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"biometry" | "pin">("pin");

  useEffect(() => {
    let active = true;
    isPlatformAuthenticatorAvailable().then((available) => {
      if (!active) return;
      setBiometryAvailable(available);
      if (available && getStoredCredential()) setConfirmMode("biometry");
    });
    return () => {
      active = false;
    };
  }, []);

  const paymentMethods: PaymentMethod[] = [
    { id: "wallet", name: "Saldo ShimoPay", symbol: "wallet", detail: `R$ ${user?.balance.toFixed(2)}` },
    { id: "pix", name: "PIX conectado", symbol: "cash", detail: "Conta corrente" },
    { id: "card", name: "Mastercard final 8899", symbol: "card", detail: "Crédito" },
    { id: "global", name: "Saldo de viagem", symbol: "global", detail: "USDC/USDT convertido para BRL" },
    { id: "benefits", name: "Benefícios", symbol: "check", detail: "12.450 pontos disponíveis" },
  ];

  useEffect(() => {
    if (!scanning || tapMode) return;

    const timer = window.setTimeout(() => {
      setScanning(false);
      setPaymentOpen(true);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [scanning, tapMode]);

  useEffect(() => {
    if (!tapMode) return;

    const hintTimer = window.setTimeout(() => {
      toast.info("Aproxime da maquininha...");

      const paymentTimer = window.setTimeout(() => {
        setScanning(false);
        setPaymentOpen(true);
        setAmount("25.00");
      }, 1800);

      return () => window.clearTimeout(paymentTimer);
    }, 600);

    return () => window.clearTimeout(hintTimer);
  }, [tapMode]);

  const initiatePayment = () => {
    if (!amount) return;
    setPaymentOpen(false);
    setPinOpen(true);
    setPin("");
  };

  const handlePinSubmit = (enteredPin: string) => {
    if (enteredPin.length !== 6) return;

    setPin(enteredPin);
    setProcessing(true);
    window.setTimeout(() => {
      handlePaymentFinal();
    }, 850);
  };

  // Confirmacao com a biometria REAL do aparelho (FaceID/digital/PIN nativo).
  // Sem credencial registrada, o registro (create) ja exige biometria; depois,
  // cada pagamento pede uma assertion nova com userVerification required.
  const handleBiometricPay = async () => {
    setProcessing(true);
    try {
      let verified = false;
      if (!getStoredCredential()) {
        try {
          await registerDeviceCredential(user?.email || "cliente@shimopay.demo");
          verified = true;
        } catch {
          verified = false;
        }
      } else {
        verified = await verifyWithDeviceBiometry("pagamento");
      }

      if (verified) {
        handlePaymentFinal();
      } else {
        toast.error("Biometria nao concluida. Use o PIN.");
        setConfirmMode("pin");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentFinal = () => {
    const method = paymentMethods.find((item) => item.id === selectedMethod)?.name || "Saldo ShimoPay";
    const success = pay(parseFloat(amount), "Padaria São José", method);
    setProcessing(false);
    setPinOpen(false);

    if (success) {
      toast.success("Pagamento realizado com sucesso.");
      navigate("/customer/home");
    } else {
      toast.error("Saldo insuficiente.");
      setPaymentOpen(true);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-primary text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(52,211,153,0.18),transparent_32%),linear-gradient(145deg,#0f172a,#020617)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:28px_28px]" />

      <button
        className="absolute right-4 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
        onClick={() => navigate(-1)}
        aria-label="Fechar scanner"
      >
        <ShimoSymbol name="close" className="h-5 w-5 rounded-none bg-transparent" />
      </button>

      <div className="absolute left-0 right-0 top-20 z-20 flex justify-center">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-md">
          <ShimoSymbol name="offline" className={`h-6 w-6 rounded-none bg-transparent ${tapMode ? "text-blue-300" : "text-white/50"}`} />
          <span className="text-sm font-medium">Aproximar</span>
          <Switch checked={tapMode} onCheckedChange={setTapMode} className="scale-75" />
        </div>
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6">
        {tapMode ? <TapTarget /> : <ScanTarget />}
      </main>

      <Drawer
        open={paymentOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPaymentOpen(false);
            setScanning(true);
          }
        }}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle className="text-center text-xl">Pagar Padaria São José</DrawerTitle>
              <DrawerDescription className="text-center">Confirme o valor e escolha como pagar.</DrawerDescription>
            </DrawerHeader>

            <div className="space-y-6 p-4 pb-0">
              <div className="flex items-center justify-center gap-2 rounded-3xl bg-slate-50 px-4 py-4">
                <span className="text-xl font-semibold text-slate-400">R$</span>
                <Input
                  type="number"
                  placeholder="0,00"
                  className="h-16 w-48 border-none bg-transparent p-0 text-center text-[30px] font-semibold shadow-none focus-visible:ring-0"
                  autoFocus
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Forma de pagamento</p>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                        selectedMethod === method.id ? "border-slate-950 bg-primary text-white" : "border-slate-100 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <ShimoSymbol
                          name={method.symbol}
                          className={`h-10 w-10 ${selectedMethod === method.id ? "bg-white/10 text-white" : "bg-slate-100 text-slate-800"}`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{method.name}</p>
                          <p className={`truncate text-xs ${selectedMethod === method.id ? "text-white/55" : "text-slate-500"}`}>{method.detail}</p>
                        </div>
                      </div>
                      {selectedMethod === method.id && <ShimoSymbol name="check" className="h-7 w-7 rounded-xl bg-blue-400 text-slate-950" />}
                    </button>
                  ))}
                </div>

                {selectedMethod === "global" && amount && (
                  <div className="mt-4 rounded-2xl bg-sky-50 p-3 text-center text-sm text-sky-900">
                    <p>Conversão no pagamento</p>
                    <p className="font-semibold">R$ {amount} ≈ US$ {(parseFloat(amount) / 5.08).toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            <DrawerFooter>
              <Button onClick={initiatePayment} disabled={!amount || processing} className="h-12 w-full rounded-2xl">
                Confirmar pagamento
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="rounded-2xl">
                  Cancelar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={pinOpen} onOpenChange={setPinOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm pb-8">
            <DrawerHeader>
              <DrawerTitle className="text-center">Segurança</DrawerTitle>
              <DrawerDescription className="text-center">
                {confirmMode === "biometry"
                  ? "Confirme com a biometria do aparelho."
                  : "Digite seu PIN de 6 dígitos."}
              </DrawerDescription>
            </DrawerHeader>

            {confirmMode === "biometry" ? (
              <div className="my-6 flex flex-col items-center gap-4">
                <button
                  onClick={handleBiometricPay}
                  disabled={processing}
                  aria-label="Confirmar com biometria do dispositivo"
                  className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-blue-400 text-slate-950 shadow-lg shadow-blue-400/25 transition active:scale-95 disabled:opacity-50"
                >
                  <ShimoSymbol name="security" className="h-11 w-11 rounded-none bg-transparent" />
                </button>
                <p className="text-sm font-medium text-slate-600">
                  {processing ? "Verificando..." : "Toque e use FaceID / digital / PIN do aparelho"}
                </p>
                <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => setConfirmMode("pin")}>
                  Usar PIN de 6 dígitos
                </Button>
              </div>
            ) : (
              <>
                <div className="my-4 flex justify-center gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className={`h-4 w-4 rounded-full border border-slate-300 ${pin.length > index ? "border-slate-950 bg-primary" : "bg-transparent"}`} />
                  ))}
                </div>

                <Keypad
                  onInput={(key) => {
                    if (key === "back") {
                      setPin((current) => current.slice(0, -1));
                      return;
                    }

                    if (pin.length < 6) {
                      const nextPin = pin + key;
                      setPin(nextPin);
                      handlePinSubmit(nextPin);
                    }
                  }}
                />

                {biometryAvailable && (
                  <div className="mt-5 text-center">
                    <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => setConfirmMode("biometry")}>
                      Usar biometria do aparelho
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const ScanTarget = () => (
  <div className="flex flex-col items-center text-center">
    <div className="relative h-72 w-72 rounded-[40px] border border-white/30">
      <span className="absolute left-5 top-5 h-12 w-12 rounded-tl-3xl border-l-4 border-t-4 border-blue-300" />
      <span className="absolute right-5 top-5 h-12 w-12 rounded-tr-3xl border-r-4 border-t-4 border-blue-300" />
      <span className="absolute bottom-5 left-5 h-12 w-12 rounded-bl-3xl border-b-4 border-l-4 border-blue-300" />
      <span className="absolute bottom-5 right-5 h-12 w-12 rounded-br-3xl border-b-4 border-r-4 border-blue-300" />
      <span className="absolute left-8 right-8 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-blue-300 shadow-[0_0_24px_rgba(110,231,183,0.8)]" />
    </div>
    <p className="mt-8 text-lg font-semibold">Aponte para o código</p>
    <p className="mt-2 max-w-[280px] text-sm text-white/55">O app detecta o lojista e abre a confirmação de pagamento.</p>
  </div>
);

const TapTarget = () => (
  <div className="flex flex-col items-center text-center">
    <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-blue-300/25">
      <span className="absolute h-56 w-56 rounded-full border border-blue-300/35" />
      <span className="absolute h-40 w-40 rounded-full bg-blue-300/10" />
      <ShimoSymbol name="offline" className="h-20 w-20 rounded-[32px] bg-blue-400 text-slate-950" />
    </div>
    <p className="mt-8 text-lg font-semibold">Aproxime para pagar</p>
    <p className="mt-2 max-w-[280px] text-sm text-white/55">Funciona com terminal ShimoPay autorizado.</p>
  </div>
);

const Keypad = ({ onInput }: { onInput: (value: string) => void }) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

  return (
    <div className="mx-auto mt-6 grid max-w-[250px] grid-cols-3 gap-4">
      {keys.map((key, index) => (
        <button
          key={`${key}-${index}`}
          onClick={() => onInput(key)}
          className={`flex h-16 items-center justify-center rounded-full text-2xl font-medium transition-colors ${
            key === "" ? "invisible" : "hover:bg-slate-100 active:bg-slate-200"
          }`}
        >
          {key === "back" ? <ShimoSymbol name="back" className="h-6 w-6 rotate-180 rounded-none bg-transparent text-slate-800" /> : key}
        </button>
      ))}
    </div>
  );
};

export default Scanner;
