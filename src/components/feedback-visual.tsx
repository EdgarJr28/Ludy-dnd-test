"use client";

import { useEffect, useState } from "react";

interface Props {
  tipo: "error" | "exito" | null;
  onComplete: () => void;
}

export default function FeedbackVisual({ tipo, onComplete }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (tipo) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onComplete, 300); // Esperar a que termine la animación
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [tipo, onComplete]);

  if (!tipo) return null;

  const config = {
    error: {
      icon: "❌",
      text: "¡Intenta de nuevo!",
      color: "bg-red-500",
      textColor: "text-white"
    },
    exito: {
      icon: "✅",
      text: "¡Muy bien!",
      color: "bg-green-500",
      textColor: "text-white"
    }
  };

  const current = config[tipo];

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-40 pointer-events-none transition-opacity duration-300 ${
      visible ? "opacity-100" : "opacity-0"
    }`}>
      <div className={`${current.color} ${current.textColor} px-8 py-4 rounded-xl shadow-lg transform transition-all duration-300 ${
        visible ? "scale-100 translate-y-0" : "scale-75 translate-y-4"
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{current.icon}</span>
          <span className="text-xl font-bold">{current.text}</span>
        </div>
      </div>
    </div>
  );
}
