"use client";

import { useDraggable, useDndContext } from "@dnd-kit/core";
import type { Card } from "../types/types";
import { CardView } from "../ui/card-view";
// importa tu CardView normal

export function DraggableResponse({ card }: { card: Card }) {
  const id = "response"; // usa el mismo id que ya usas para el draggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  // Si prefieres detectar por contexto (más robusto si tienes varios draggables):
  const { active } = useDndContext();
  const isDraggingSelf = isDragging || active?.id === id;

  const style: React.CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ ...style, opacity: isDraggingSelf ? 0 : 1 }} // 👈 oculta original al arrastrar
      className="touch-none select-none focus:outline-none"
      tabIndex={-1}
    >
      <CardView card={card} />
    </div>
  );
}
