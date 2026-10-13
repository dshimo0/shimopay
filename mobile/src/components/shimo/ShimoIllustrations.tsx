import { cn } from "@/lib/utils";
import { ShimoMark, ShimoSymbol } from "./ShimoSymbols";

export const BrazilPaymentScene = ({ className }: { className?: string }) => (
  <div className={cn("relative h-56 overflow-hidden rounded-[26px] bg-[#eef4eb]", className)} aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,0.18),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(163,230,53,0.18),transparent_32%)]" />
    <div className="absolute left-5 top-5 grid grid-cols-2 gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[11px] font-black text-blue-800 shadow-sm">PIX</div>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-[11px] font-black text-blue-900 shadow-sm">BRL</div>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-200 text-[11px] font-black text-slate-900 shadow-sm">QR</div>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[11px] font-black text-slate-700 shadow-sm">OFF</div>
    </div>

    <div className="absolute bottom-7 left-6 right-6 h-28 overflow-hidden rounded-[26px] bg-primary p-4 text-white shadow-xl">
      <div className="absolute right-[-34px] top-[-34px] h-24 w-24 rounded-full border border-white/10" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-200/75">Saldo Brasil</p>
          <p className="mt-2 text-[25px] font-semibold leading-none">R$ 1.284,60</p>
        </div>
        <ShimoMark className="h-10 w-10 rounded-[16px] bg-white/10" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <span className="h-2 rounded-full bg-white/15" />
        <span className="h-2 rounded-full bg-blue-300" />
        <span className="h-2 rounded-full bg-lime-300" />
      </div>
    </div>

    <div className="absolute right-5 top-7 grid h-16 w-16 grid-cols-4 gap-1 rounded-[18px] bg-white p-2 shadow-sm">
      {Array.from({ length: 16 }).map((_, index) => (
        <span key={index} className={cn("rounded-sm", [0, 1, 4, 5, 7, 8, 10, 13, 14, 15].includes(index) ? "bg-primary" : "bg-slate-100")} />
      ))}
    </div>
  </div>
);

export const OfflinePaymentScene = ({ className }: { className?: string }) => (
  <div className={cn("relative h-56 overflow-hidden rounded-[26px] bg-primary", className)} aria-hidden="true">
    <div className="absolute inset-x-0 bottom-0 h-20 bg-blue-900/50" />
    <div className="absolute left-8 top-9 h-32 w-20 rotate-[-6deg] rounded-[24px] border-[5px] border-slate-800 bg-white shadow-xl">
      <ShimoMark className="absolute left-1/2 top-12 h-10 w-10 -translate-x-1/2 rounded-[15px]" />
      <div className="absolute bottom-3 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-slate-200" />
    </div>
    <div className="absolute bottom-7 right-8 h-36 w-24 rotate-[7deg] rounded-[24px] bg-slate-800 p-3 shadow-2xl">
      <div className="h-20 rounded-2xl bg-white">
        <ShimoSymbol name="offline" className="mx-auto translate-y-6 bg-transparent text-blue-700" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <span className="h-2.5 rounded bg-lime-300" />
        <span className="h-2.5 rounded bg-lime-300" />
        <span className="h-2.5 rounded bg-lime-300" />
      </div>
    </div>
    <div className="absolute left-24 top-12 h-24 w-24 rounded-full border-[8px] border-lime-300/25" />
    <div className="absolute left-20 top-16 h-32 w-32 rounded-full border-[8px] border-lime-300/15" />
    <div className="absolute left-16 top-20 h-40 w-40 rounded-full border-[8px] border-lime-300/10" />
  </div>
);

export const VisitorPaymentScene = ({ className }: { className?: string }) => (
  <div className={cn("relative h-56 overflow-hidden rounded-[26px] bg-[#eef4eb]", className)} aria-hidden="true">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.04)_25%,transparent_25%),linear-gradient(225deg,rgba(15,23,42,0.04)_25%,transparent_25%)] bg-[size:32px_32px]" />
    <div className="absolute left-7 top-7 rounded-[24px] bg-white p-4 shadow-xl">
      <div className="mb-5 flex items-center gap-3">
        <ShimoSymbol name="global" tone="blue" />
        <div className="space-y-1">
          <span className="block h-2 w-20 rounded bg-slate-200" />
          <span className="block h-2 w-14 rounded bg-slate-100" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="h-12 w-8 rounded-t-2xl bg-teal-600" />
        <span className="h-20 w-8 rounded-t-2xl bg-blue-400" />
        <span className="h-10 w-8 rounded-t-2xl bg-lime-300" />
      </div>
    </div>
    <div className="absolute bottom-7 right-7 h-36 w-28 rotate-3 rounded-[26px] bg-primary p-3 shadow-2xl">
      <div className="rounded-2xl bg-white p-3">
        <ShimoSymbol name="cash" tone="green" className="mx-auto h-12 w-12 rounded-[18px]" />
        <div className="mx-auto mt-3 h-2 w-16 rounded bg-slate-200" />
        <div className="mx-auto mt-2 h-2 w-10 rounded bg-slate-100" />
      </div>
    </div>
    <div className="absolute bottom-12 left-0 right-0 h-8 -rotate-12 bg-lime-300/80" />
    <ShimoMark className="absolute bottom-14 left-1/2 h-12 w-12 -translate-x-1/2 rounded-[18px] bg-white text-slate-950 shadow-xl" />
  </div>
);
