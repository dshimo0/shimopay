import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShimoSymbol } from "@/components/shimo/ShimoSymbols";
import { useMock } from "@/contexts/MockContext";

const PRODUCTS = [
  { id: 1, name: "Combo clássico", price: 32.9, desc: "Sanduíche, fritas e bebida.", code: "C1" },
  { id: 2, name: "Queijo duplo", price: 28.5, desc: "Carne, queijo e molho especial.", code: "Q2" },
  { id: 3, name: "Nuggets 10 un.", price: 19.9, desc: "Porção crocante com molho.", code: "N10" },
  { id: 4, name: "Sobremesa gelada", price: 14.9, desc: "Baunilha com cobertura.", code: "SG" },
  { id: 5, name: "Batata grande", price: 12.9, desc: "Porção extra para compartilhar.", code: "BG" },
];

export const McDonaldsApp = () => {
  const { pay } = useMock();
  const [cart, setCart] = useState<Array<{ id: number; qty: number }>>([]);

  const addToCart = (id: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...current, { id, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing && existing.qty > 1) {
        return current.map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item));
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const total = cart.reduce((acc, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    return acc + (product ? product.price * item.qty : 0);
  }, 0);

  const handleCheckout = () => {
    if (!total) return;

    const success = pay(total, "Méqui Delivery", "Saldo ShimoPay");
    if (success) {
      toast.success(`Pedido pago com ShimoPay: R$ ${total.toFixed(2)}.`);
      setCart([]);
    } else {
      toast.error("Saldo insuficiente.");
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white">M</div>
            <div>
              <h2 className="text-sm font-semibold">Méqui Delivery</h2>
              <p className="text-xs text-slate-500">Loja Paulista</p>
            </div>
          </div>
          <ShimoSymbol name="food" tone="amber" />
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4 pb-32">
          <h3 className="text-base font-semibold tracking-tight">Destaques</h3>
          {PRODUCTS.map((product) => {
            const inCart = cart.find((item) => item.id === product.id);
            return (
              <div key={product.id} className="flex gap-4 border-b border-slate-100 pb-4 last:border-0">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] bg-background text-lg font-black text-slate-700">{product.code}</div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-900">{product.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{product.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-blue-800">R$ {product.price.toFixed(2)}</span>
                    {inCart ? (
                      <div className="flex items-center gap-3 rounded-full bg-slate-100 px-2 py-1">
                        <button onClick={() => removeFromCart(product.id)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-semibold">
                          -
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">{inCart.qty}</span>
                        <button onClick={() => addToCart(product.id)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-semibold">
                          +
                        </button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="h-8 rounded-full border-slate-200 text-xs" onClick={() => addToCart(product.id)}>
                        Adicionar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {cart.length > 0 && (
        <footer className="sticky bottom-0 z-20 border-t bg-white p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">Total</span>
            <span className="text-xl font-semibold">R$ {total.toFixed(2)}</span>
          </div>
          <Button className="h-12 w-full rounded-2xl bg-primary hover:bg-primary/90" onClick={handleCheckout}>
            Pagar com ShimoPay
          </Button>
        </footer>
      )}
    </div>
  );
};
