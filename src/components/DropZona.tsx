"use client";

import { useDroppable } from "@dnd-kit/core";
import React from "react";

interface Props {
  id: string;
  tipo: string;
  figuraEjemplo?: {
    tipo: string;
    color: string;
    tamaño?: string;
  };
  figuraColocada?: {
    tipo: string;
    color: string;
    tamaño?: string;
  };
}

const colorMap: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
};

export default function DropZona({ id, figuraEjemplo, figuraColocada }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Determinar el tamaño basado en la figura de ejemplo o colocada - más pequeños
  const tamaño = figuraColocada?.tamaño || figuraEjemplo?.tamaño || "pequeño";
  const containerSize = tamaño === "grande" ? "w-20 h-20" : "w-16 h-16";
  const figuraSize = tamaño === "grande" ? "w-16 h-16" : "w-12 h-12";

  // Si hay una figura colocada, usar su color para toda la zona
  const zonaCompleta = figuraColocada && (
    <div 
      className={`w-full h-full ${figuraColocada.tipo === "circulo" ? "rounded-full" : "rounded"} ${colorMap[figuraColocada.color]} flex items-center justify-center`}
    >
      <span className="text-white text-2xl">✓</span>
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      className={`${containerSize} m-1 flex flex-col items-center justify-center rounded relative border-2 transition-all duration-200
        ${isOver ? "bg-green-100 border-green-500 shadow-lg" : "bg-gray-50 border-gray-300 border-dashed"}
      `}
    >
      {figuraColocada ? (
        zonaCompleta
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
          {/* Figura de ejemplo cuando no hay nada colocado */}
          {figuraEjemplo && (
            <div 
              className={`${figuraSize} ${figuraEjemplo.tipo === "circulo" ? "rounded-full" : "rounded"} ${colorMap[figuraEjemplo.color]} opacity-40 border-2 border-dashed border-gray-400`}
            />
          )}
        </div>
      )}
    </div>
  );
}
