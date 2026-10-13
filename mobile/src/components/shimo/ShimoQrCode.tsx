import { useMemo } from "react";
import { create as createQrMatrix } from "qrcode";

import { cn } from "@/lib/utils";

// QR Code REAL (escaneavel por qualquer leitor) renderizado em SVG a partir da
// matriz gerada pela lib `qrcode`. Substitui os quadrados decorativos antigos.
// O CONTEUDO codificado define se e pagavel: payload Pix valido = pagavel;
// texto demo = apenas demonstracao.

interface ShimoQrCodeProps {
  value: string;
  className?: string;
  label?: string;
}

export const ShimoQrCode = ({ value, className, label = "QR Code" }: ShimoQrCodeProps) => {
  const matrix = useMemo(() => {
    try {
      return createQrMatrix(value, { errorCorrectionLevel: "M" }).modules;
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center rounded-[28px] border border-slate-200 bg-white p-4 text-xs text-slate-400",
          className
        )}
      >
        Conteudo invalido para QR
      </div>
    );
  }

  const rects: React.ReactNode[] = [];
  const { size, data } = matrix;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[y * size + x]) {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
      }
    }
  }

  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-200 bg-white p-3 shadow-inner",
        className
      )}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full"
        role="img"
        aria-label={label}
        shapeRendering="crispEdges"
      >
        <rect width={size} height={size} fill="#ffffff" />
        <g fill="#0f172a">{rects}</g>
      </svg>
    </div>
  );
};
