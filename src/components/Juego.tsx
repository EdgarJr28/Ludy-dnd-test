"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import DropZona from "../components/DropZona";
import DraggableFigura from "../components/DraggableFigura";
import { figurasBase, figurasMeta } from "@/libs/Figuras";


export default function Juego() {
  const items = figurasBase;
  const [emparejados, setEmparejados] = useState<{ [key: string]: string }>({});

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event;
    if (over && active) {
      const figura = items.find((i) => i.id === active.id);
      if (figura && figura.tipo === String(over.id).replace("meta-", "")) {
        setEmparejados((prev) => ({ ...prev, [active.id]: String(over.id) }));
      }
    }
  };

  return (
    <main className="h-screen w-screen bg-gray-100 flex flex-col p-6 overflow-hidden">
      <h2 className="text-xl font-bold mb-4 text-center">Empareja las figuras con su tipo</h2>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex justify-center flex-wrap mb-6 flex-shrink-0">
          {figurasMeta.map((zona) => (
            <DropZona key={zona.id} id={zona.id} tipo={zona.tipo}>
              <span className="capitalize font-semibold">{zona.tipo}</span>
            </DropZona>
          ))}
        </div>

        <div className="flex justify-center flex-wrap flex-1 items-start">
          {items.map((item) =>
            !emparejados[item.id] ? (
              <DraggableFigura key={item.id} {...item} />
            ) : null
          )}
        </div>
      </DndContext>

      {Object.keys(emparejados).length === figurasBase.length && (
        <p className="text-green-700 font-semibold mt-4 text-center">¡Bien hecho!</p>
      )}
    </main>
  );
}
