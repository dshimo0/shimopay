import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ShimoSymbol } from "@/components/shimo/ShimoSymbols";

interface Product {
  id: number;
  name: string;
  price: number;
  code: string;
  category: string;
}

const products: Product[] = [
  { id: 1, name: "Kit cronograma capilar", price: 129.9, code: "KC", category: "Cabelos" },
  { id: 2, name: "Hidratante corporal 400ml", price: 45.5, code: "HC", category: "Corpo" },
  { id: 3, name: "Perfume essencial", price: 189, code: "PE", category: "Perfumes" },
  { id: 4, name: "Batom matte vermelho", price: 29.9, code: "BM", category: "Maquiagem" },
  { id: 5, name: "Protetor solar FPS 60", price: 64.9, code: "PS", category: "Rosto" },
  { id: 6, name: "Shampoo revitalizante", price: 32.5, code: "SR", category: "Cabelos" },
];

export const ResellerCatalogApp = ({ onBack }: { onBack?: () => void }) => {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [orderSent, setOrderSent] = useState(false);
  const [category, setCategory] = useState("Todos");

  const visibleProducts = category === "Todos" ? products : products.filter((product) => product.category === category);

  const addToCart = (id: number) => {
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
    toast.success("Produto adicionado.");
  };

  const removeFromCart = (id: number) => {
    setCart((current) => {
      const next = { ...current };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find((item) => item.id === Number(id));
    return total + (product ? product.price * qty : 0);
  }, 0);

  const handleSendOrder = () => {
    setOrderSent(true);
    toast.success("Pedido enviado para Cláudia.");
  };

  if (orderSent) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-6 text-center">
        <ShimoSymbol name="check" tone="green" className="mb-6 h-20 w-20 rounded-[28px]" />
        <h2 className="text-2xl font-semibold tracking-tight">Pedido enviado</h2>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">A revendedora Cláudia recebeu seu pedido e combinará entrega e pagamento.</p>

        <div className="my-8 w-full max-w-xs rounded-3xl bg-white p-4 text-left shadow-sm">
          <p className="text-center text-xs text-slate-500">Pedido #8293</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-semibold">Total a pagar</span>
            <span className="text-lg font-semibold text-blue-800">R$ {totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <Button
          className="h-12 w-full max-w-xs rounded-2xl bg-primary hover:bg-primary/90"
          onClick={() => {
            setCart({});
            setOrderSent(false);
            onBack?.();
          }}
        >
          Voltar para loja
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white p-4">
        <div className="mb-4 flex items-center gap-3">
          {onBack && (
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100" onClick={onBack} aria-label="Voltar">
              <ShimoSymbol name="back" className="h-5 w-5 rounded-none bg-transparent text-slate-800" />
            </button>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ShimoSymbol name="store" tone="amber" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">Espaço Cláudia</h2>
              <p className="text-xs font-medium text-blue-700">Revendedora oficial</p>
            </div>
          </div>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">Aberto</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Todos", "Perfumes", "Maquiagem", "Cabelos", "Corpo", "Rosto"].map((item) => (
            <button key={item} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${category === item ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {visibleProducts.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="relative flex aspect-square items-center justify-center bg-slate-100 text-2xl font-black text-slate-700">
                {product.code}
                {cart[product.id] > 0 && <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{cart[product.id]}</div>}
              </div>
              <div className="p-3">
                <p className="mb-1 text-xs text-slate-500">{product.category}</p>
                <h3 className="line-clamp-2 h-10 text-sm font-semibold leading-tight">{product.name}</h3>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <span className="text-sm font-semibold">R$ {product.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    {cart[product.id] > 0 && (
                      <button className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold" onClick={() => removeFromCart(product.id)}>
                        -
                      </button>
                    )}
                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white" onClick={() => addToCart(product.id)}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalItems > 0 && (
        <footer className="absolute bottom-4 left-4 right-4">
          <Button className="h-14 w-full justify-between rounded-2xl bg-primary px-5 text-white shadow-lg hover:bg-primary/90" onClick={handleSendOrder}>
            <span>{totalItems} itens</span>
            <span>Enviar · R$ {totalPrice.toFixed(2)}</span>
          </Button>
        </footer>
      )}
    </div>
  );
};
