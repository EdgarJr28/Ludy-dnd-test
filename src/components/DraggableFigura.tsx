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

const colorMap: Record<string, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  white: "bg-white border border-gray-300",
  black: "bg-black",
};

export default function DraggableFigura({ id, tipo, color, tamaño, onSelect, selected }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  const figuraEstilo =
    tipo === "circulo" ? "rounded-full" : tipo === "cuadro" ? "" : "";

  // Determinar el tamaño basado en la prop tamaño - más pequeños
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
      className={clsx(
        sizeClass,
        "m-1",
        colorMap[color],
        figuraEstilo,
        selected ? "ring-4 ring-indigo-400" : ""
      )}
    />
  );
}
