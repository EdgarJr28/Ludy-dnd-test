"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Card } from "../types/types";

type Props = {
  id: string;
  children: React.ReactNode;
  ghost?: Card | null;
  /** Marca externa para resaltar solo cuando el puntero está encima */
  isOver?: boolean;
};

export function DroppableSlot({ id, children, ghost = null, isOver = false }: Props) {
  const { setNodeRef, isOver: kitOver } = useDroppable({ id });

  // Solo resaltamos si está encima (por dnd-kit o por la prop externa)
  const active = Boolean(isOver || kitOver);

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-2xl p-2 transition-all ${
        active ? "ring-2 ring-emerald-500 ring-offset-2" : ""
      }`}
      tabIndex={-1} // evita enfoque por teclado
    >
      {children}

      {/* Si quieres pintar un “fantasma” al hacer drop, renderízalo aquí */}
      {ghost ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          {/* Ej: <CardView card={ghost} /> */}
        </div>
      ) : null}
    </div>
  );
}
