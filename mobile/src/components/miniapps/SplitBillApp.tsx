import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShimoSymbol } from "@/components/shimo/ShimoSymbols";

export const SplitBillApp = () => {
  const [total, setTotal] = useState("");
  const [people, setPeople] = useState("2");
  const [includeTip, setIncludeTip] = useState(true);
  const [friendSelectionOpen, setFriendSelectionOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [chargeSent, setChargeSent] = useState(false);

  const friends = [
    { id: 1, name: "Ana Silva", initials: "AS" },
    { id: 2, name: "Pedro Santos", initials: "PS" },
    { id: 3, name: "Lucas Oliveira", initials: "LO" },
    { id: 4, name: "Carla Souza", initials: "CS" },
    { id: 5, name: "Marcos Lima", initials: "ML" },
  ];

  const result = useMemo(() => {
    const amount = Number(total);
    const numPeople = Number(people);
    if (!amount || !numPeople || numPeople <= 0) return null;

    const totalWithTip = includeTip ? amount * 1.1 : amount;
    return {
      perPerson: (totalWithTip / numPeople).toFixed(2),
      totalWithTip: totalWithTip.toFixed(2),
    };
  }, [includeTip, people, total]);

  const toggleFriend = (id: number) => {
    setSelectedFriends((current) => (current.includes(id) ? current.filter((friendId) => friendId !== id) : [...current, id]));
  };

  const sendCharge = () => {
    setFriendSelectionOpen(false);
    setChargeSent(true);
    toast.success(`Cobrança enviada para ${selectedFriends.length} pessoas.`);

    window.setTimeout(() => {
      setChargeSent(false);
      setSelectedFriends([]);
    }, 3000);
  };

  if (chargeSent) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white p-6 text-center">
        <ShimoSymbol name="check" tone="green" className="mb-6 h-20 w-20 rounded-[28px]" />
        <h2 className="text-2xl font-semibold tracking-tight">Cobrança enviada</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Seus contatos receberam o pedido de pagamento de <strong>R$ {result?.perPerson}</strong> cada.
        </p>
        <div className="mt-6 flex -space-x-2">
          {selectedFriends.map((friendId) => {
            const friend = friends.find((item) => item.id === friendId);
            return (
              <div key={friendId} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-slate-700">
                {friend?.initials}
              </div>
            );
          })}
        </div>
        <Button variant="outline" className="mt-8 rounded-2xl" onClick={() => setChargeSent(false)}>
          Voltar
        </Button>
      </div>
    );
  }

  if (friendSelectionOpen) {
    return (
      <div className="flex h-full flex-col bg-white p-4">
        <h3 className="text-lg font-semibold tracking-tight">Selecionar contatos</h3>
        <p className="mb-6 mt-1 text-sm text-slate-500">Quem vai dividir essa conta com você?</p>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
          {friends.map((friend) => (
            <button
              key={friend.id}
              className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                selectedFriends.includes(friend.id) ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-white"
              }`}
              onClick={() => toggleFriend(friend.id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{friend.initials}</div>
                <span className="text-sm font-semibold">{friend.name}</span>
              </div>
              {selectedFriends.includes(friend.id) && <ShimoSymbol name="check" className="h-6 w-6 rounded-xl bg-blue-100 text-blue-700" />}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <Button className="h-12 w-full rounded-2xl bg-primary hover:bg-primary/90" onClick={sendCharge} disabled={selectedFriends.length === 0}>
            Cobrar {selectedFriends.length} pessoas
          </Button>
          <Button variant="ghost" className="mt-2 h-12 w-full rounded-2xl" onClick={() => setFriendSelectionOpen(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 space-y-6 p-4">
        <section className="rounded-[28px] bg-white p-4 text-center shadow-sm">
          <ShimoSymbol name="split" tone="green" className="mx-auto mb-3 h-12 w-12 rounded-[20px]" />
          <h3 className="font-semibold tracking-tight">Rachar conta</h3>
          <p className="mt-1 text-xs text-slate-500">Divida despesas e cobre contatos ShimoPay.</p>
        </section>

        <div className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor da conta</Label>
            <Input id="amount" type="number" placeholder="0,00" value={total} onChange={(event) => setTotal(event.target.value)} className="h-12 rounded-2xl text-lg font-semibold" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="people">Pessoas</Label>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => setPeople(Math.max(1, Number(people || "0") - 1).toString())}>
                -
              </Button>
              <Input id="people" type="number" value={people} onChange={(event) => setPeople(event.target.value)} className="h-12 rounded-2xl text-center font-semibold" />
              <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => setPeople((Number(people || "0") + 1).toString())}>
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <ShimoSymbol name="profile" className="h-6 w-6 rounded-xl bg-white text-slate-500" />
              <Label htmlFor="tip" className="cursor-pointer">
                Incluir 10% de serviço
              </Label>
            </div>
            <Switch id="tip" checked={includeTip} onCheckedChange={setIncludeTip} />
          </div>
        </div>

        {result && (
          <section className="rounded-[30px] bg-primary p-5 text-center text-white shadow-lg">
            <p className="text-sm text-white/55">Cada um paga</p>
            <h2 className="mt-1 text-4xl font-semibold tracking-tight">R$ {result.perPerson}</h2>
            <p className="mt-1 text-xs text-white/50">Total com serviço: R$ {result.totalWithTip}</p>
            <Button className="mt-5 h-12 w-full rounded-2xl bg-blue-400 text-slate-950 hover:bg-blue-300" onClick={() => setFriendSelectionOpen(true)}>
              Cobrar contatos
            </Button>
          </section>
        )}
      </div>
    </div>
  );
};
