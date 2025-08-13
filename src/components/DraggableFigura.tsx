"use client";
import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import React from "react";

interface Props {
  id: string;
  tipo: string;
  color: string;
  tamaño?: string;
  onSelect?: (id: string) => void;
  selected?: boolean;
}

const glossyColorMap: Record<Props["color"], string> = {
  red: "bg-gradient-to-br from-rose-400 to-rose-600 text-white",
  green: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
  yellow: "bg-gradient-to-br from-amber-300 to-amber-500 text-black/80",
  white:
    "bg-gradient-to-br from-slate-50 to-slate-200 text-slate-700 border border-white/60",
  black: "bg-gradient-to-br from-neutral-800 to-neutral-950 text-white",
};

export default function DraggableFigura({
  id,
  tipo,
  color,
  tamaño = "mediano",
  onSelect,
  selected,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  } as React.CSSProperties;

  const shapeClass =
    tipo === "circulo"
      ? "rounded-full"
      : tipo === "rombo"
      ? "rotate-45 rounded-xl"
      : "rounded-xl";

  const sizeClass = tamaño === "grande" ? "w-16 h-16" : "w-12 h-12";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
      aria-selected={selected}
      className={clsx(
        "group", // para que funcione group-hover del shine
        sizeClass,
        shapeClass,
        "relative overflow-hidden",
        glossyColorMap[color],
        "ring-1 ring-inset ring-white/10",
        "shadow-lg shadow-black/20",
        "cursor-grab active:cursor-grabbing select-none touch-none will-change-transform",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        isDragging && "scale-105 shadow-2xl shadow-black/25",

        // === Estado seleccionado (CLARO, sin blur) ===
        selected && [
          "ring-4 ring-indigo-500", // borde externo bien definido
          "ring-offset-2 ring-offset-white/80",
          "drop-shadow-none", // sin glow borroso
        ]
      )}
    >
      {/* Borde interno fino para aún más contraste al seleccionar */}
      {selected && (
        <span
          aria-hidden
          className={clsx(
            "pointer-events-none absolute inset-0",
            shapeClass,
            "border-2 border-white/90 mix-blend-overlay" // línea nítida sobre el relleno
          )}
        />
      )}

      {/* Badge de selección (clarísimo) */}
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-indigo-500 ring-2 ring-white shadow"
        />
      )}

      {/* Brillo superior (gloss) */}
      <span
        aria-hidden
        className={clsx(
          "pointer-events-none absolute inset-0",
          "bg-gradient-to-t from-white/25 via-white/10 to-transparent"
        )}
      />

      {/* Shine sweep al hover (ahora sí con .group) */}
      <span
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -inset-y-4 -left-1/2 w-1/3",
          "bg-white/40 blur-md",
          "rotate-12",
          "translate-x-[-120%] group-hover:translate-x-[260%]",
          "transition-transform duration-700 ease-out"
        )}
      />
    </div>
  );
}
