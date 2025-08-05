"use client";
import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import React from "react";

interface Props {
  id: string;
  tipo: string;
  color: string;
}

const colorMap: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
};

export default function DraggableFigura({ id, tipo, color }: Props) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "w-20 h-20 m-2",
        colorMap[color],
        figuraEstilo
      )}
    />
  );
}
