"use client";

import { useDroppable } from "@dnd-kit/core";
import React from "react";
import DraggableFigura from "./DraggableFigura";

interface Props {
  id: string;
  tipo: string;
  figuraEjemplo?: {
    tipo: string;
    color: string;
    tamaño?: string;
  };
  figuraColocada?: {
  id: string;
    tipo: string;
    color: string;
    tamaño?: string;
  };
  onMeasure?: (id: string, rect: { x: number; y: number; width: number; height: number }) => void;
  figurasColocadas?: Array<{
  id: string;
    tipo: string;
    color: string;
    tamaño?: string;
  }>;
  // Cuando es una indicación tipo "sobre", apilar centrado (cuadro debajo, círculo encima)
  overlayMode?: boolean;
  // Orden visual deseado (ids) para mantener el último que llega arriba
  orderIds?: string[];
  // Id que se está arrastrando actualmente para elevarlo temporalmente
  draggingId?: string;
}

const colorMap: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  white: "bg-white border border-gray-300",
  black: "bg-black",
};

export default function DropZona({ id, figuraEjemplo, figuraColocada, figurasColocadas, onMeasure, overlayMode, orderIds, draggingId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const elRef = React.useRef<HTMLDivElement | null>(null);

  const lastSent = React.useRef<number>(0);
  const setRefs = React.useCallback((el: HTMLDivElement | null) => {
    setNodeRef(el);
    elRef.current = el;
    if (el && onMeasure) {
      const r = el.getBoundingClientRect();
      const now = performance.now();
      if (now - lastSent.current > 50) {
        lastSent.current = now;
        onMeasure(id, { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height });
      }
    }
  }, [id, onMeasure, setNodeRef]);

  React.useEffect(() => {
    if (!elRef.current || !onMeasure) return;
    const el = elRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      onMeasure(id, { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height });
    });
    ro.observe(el);
    const onWin = () => {
      const r = el.getBoundingClientRect();
      onMeasure(id, { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height });
    };
    window.addEventListener('resize', onWin);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWin);
    };
  }, [id, onMeasure]);

  // Determinar el tamaño basado en la figura de ejemplo o colocada - más pequeños
  const tamaño = figuraColocada?.tamaño || figuraEjemplo?.tamaño || "pequeño";
  const containerSize = tamaño === "grande" 
    ? "w-16 h-16 sm:w-20 sm:h-20" 
    : "w-14 h-14 sm:w-16 sm:h-16";
  const figuraSize = tamaño === "grande" 
    ? "w-12 h-12 sm:w-16 sm:h-16" 
    : "w-10 h-10 sm:w-12 sm:h-12";

  // Si hay una figura colocada, renderizarla como draggable para permitir mover desde el inicio
  const zonaCompleta = figuraColocada && (
    <div className="w-full h-full flex items-center justify-center">
      <DraggableFigura
        id={figuraColocada.id}
        tipo={figuraColocada.tipo}
        color={figuraColocada.color}
        tamaño={figuraColocada.tamaño}
      />
    </div>
  );

  return (
    <div
      ref={setRefs}
  className={`${containerSize} m-1 flex flex-col items-center justify-center rounded relative border-2 overflow-hidden transition-all duration-200
        ${isOver ? "bg-green-100 border-green-500 shadow-lg" : "bg-gray-50 border-gray-300 border-dashed"}
      `}
    >
      {figuraColocada && !figurasColocadas ? (
        zonaCompleta
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
          {/* Figura de ejemplo cuando no hay nada colocado */}
          {figuraEjemplo && !(figurasColocadas && figurasColocadas.length > 0) && (
            <div 
              className={`${figuraSize} ${figuraEjemplo.tipo === "circulo" ? "rounded-full" : "rounded"} ${colorMap[figuraEjemplo.color]} opacity-40 border-2 border-dashed border-gray-400`}
            />
          )}
          {/* Render de múltiples figuras colocadas (modo relacional) */}
          {figurasColocadas && figurasColocadas.length > 0 && (
            <div className="relative w-full h-full flex items-center justify-center">
              {(() => {
                // Orden base por orderIds si existe, manteniendo estabilidad
                const base = [...figurasColocadas].sort((a, b) => {
                  if (!orderIds) return 0;
                  const ia = orderIds.indexOf(a.id);
                  const ib = orderIds.indexOf(b.id);
                  return ia - ib;
                });
                // Asegurar que el que se arrastra esté arriba del todo
                const ordered = draggingId
                  ? (() => {
                      const arr = base.filter(f => f.id !== draggingId);
                      const dragging = base.find(f => f.id === draggingId);
                      return dragging ? [...arr, dragging] : base;
                    })()
                  : base;

                const n = ordered.length;
                const minScale = 0.75;
                const step = n > 1 ? (1 - minScale) / (n - 1) : 0;
                return ordered.map((f, idx) => {
                  const scale = 1 - idx * step; // top (último) más pequeño
                  return (
                    <div
                      key={f.id}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ zIndex: 10 + idx, transform: `scale(${scale})` }}
                    >
                      <DraggableFigura id={f.id} tipo={f.tipo} color={f.color} tamaño={f.tamaño} />
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
