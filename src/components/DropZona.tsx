"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useDroppable } from "@dnd-kit/core";
import React from "react";

interface Props {
  id: string;
  tipo: string;
  children: React.ReactNode;
}

export default function DropZona({ id, tipo, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`w-28 h-28 m-2 flex items-center justify-center rounded border-2
        ${isOver ? "bg-green-100 border-green-500" : "bg-white border-gray-300"}
      `}
    >
      {children}
    </div>
  );
}
