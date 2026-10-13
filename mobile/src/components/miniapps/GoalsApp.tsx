import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  symbol: ShimoSymbolName;
}

export const GoalsApp = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", name: "Viagem Japão", target: 15000, current: 3450, symbol: "global" },
    { id: "2", name: "Notebook novo", target: 12000, current: 8900, symbol: "device" },
    { id: "3", name: "Reserva emergência", target: 5000, current: 1200, symbol: "security" },
  ]);
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  const addGoal = () => {
    if (!newGoalName || !newGoalTarget) return;

    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        name: newGoalName,
        target: Number(newGoalTarget),
        current: 0,
        symbol: "star",
      },
    ]);
    setNewGoalOpen(false);
    setNewGoalName("");
    setNewGoalTarget("");
    toast.success("Meta criada.");
  };

  const addMoney = (id: string, amount: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id !== id) return goal;
        const nextCurrent = Math.min(goal.current + amount, goal.target);
        toast.success(nextCurrent === goal.target ? `Meta "${goal.name}" concluída.` : `R$ ${amount} guardados para "${goal.name}".`);
        return { ...goal, current: nextCurrent };
      }),
    );
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
    toast.info("Meta removida.");
  };

  const totalSaved = goals.reduce((acc, goal) => acc + goal.current, 0);

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Minhas metas</h2>
            <p className="text-sm text-slate-500">Separe saldo sem sair da carteira.</p>
          </div>
          <ShimoSymbol name="trend" tone="green" />
        </div>

        <div className="rounded-[28px] bg-primary p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200/75">Total acumulado</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight">
            R$ {totalSaved.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h3>
          <p className="mt-2 text-xs text-blue-200">+12% este mês</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 pb-20">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShimoSymbol name={goal.symbol} tone="muted" />
                  <div>
                    <h4 className="text-sm font-semibold">{goal.name}</h4>
                    <p className="text-xs text-slate-500">
                      R$ {goal.current.toLocaleString("pt-BR")} de R$ {goal.target.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-rose-600" onClick={() => removeGoal(goal.id)}>
                  Remover
                </Button>
              </div>

              <Progress value={progress} className="h-2" indicatorClassName="bg-blue-500" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{progress.toFixed(0)}%</span>
                <Button size="sm" variant="outline" className="h-8 rounded-xl border-blue-100 text-blue-800" onClick={() => addMoney(goal.id, 100)} disabled={goal.current >= goal.target}>
                  + R$ 100
                </Button>
              </div>
            </div>
          );
        })}

        <Dialog open={newGoalOpen} onOpenChange={setNewGoalOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-600 shadow-none hover:bg-slate-50">
              Criar nova meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Reserva de viagem" value={newGoalName} onChange={(event) => setNewGoalName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Valor alvo</Label>
                <Input type="number" placeholder="0,00" value={newGoalTarget} onChange={(event) => setNewGoalTarget(event.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addGoal} disabled={!newGoalName || !newGoalTarget}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
