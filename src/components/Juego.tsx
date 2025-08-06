"use client";

import React, { useState, useCallback } from "react";
import { 
  DndContext, 
  rectIntersection,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import DropZona from "../components/DropZona";
import DraggableFigura from "../components/DraggableFigura";
import { figurasBase, figurasMeta } from "@/libs/Figuras";

// Función para mezclar arrays
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function Juego() {
  const [figuras, setFiguras] = useState(figurasBase);
  const [zonas, setZonas] = useState(figurasMeta);
  const [emparejados, setEmparejados] = useState<{ [key: string]: string }>({});
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [juegoCompletado, setJuegoCompletado] = useState(false);

  // Configurar sensores para requerir movimiento antes de iniciar drag
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Requiere mover 8px antes de activar drag
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200, // Requiere mantener presionado 200ms
      tolerance: 8, // Permite 8px de movimiento durante el delay
    },
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  // Función para mezclar el juego
  const mezclarJuego = useCallback(() => {
    setFiguras(shuffleArray(figurasBase));
    setZonas(shuffleArray(figurasMeta));
    setEmparejados({});
    setIntentosFallidos(0);
    setJuegoCompletado(false);
  }, []);

  // Función para reiniciar el juego
  const reiniciarJuego = useCallback(() => {
    setFiguras(figurasBase);
    setZonas(figurasMeta);
    setEmparejados({});
    setIntentosFallidos(0);
    setJuegoCompletado(false);
  }, []);

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event;
    
    console.log("🎯 Drag End:", { active: active?.id, over: over?.id });
    
    // Si no hay destino válido, no hacer nada
    if (!over || !active) {
      console.log("❌ No hay destino válido o elemento activo");
      return;
    }
    
    // Verificar que el destino sea una zona válida (debe estar en la lista de zonas)
    const zona = zonas.find((z) => z.id === over.id);
    if (!zona) {
      console.log("❌ El destino no es una zona válida:", over.id);
      return;
    }
    
    const figura = figuras.find((i) => i.id === active.id);
    if (!figura) {
      console.log("❌ No se encontró la figura:", active.id);
      return;
    }
    
    if (figura && zona) {
      // Verificar si la figura coincide exactamente con la zona (color, tipo y tamaño)
      if (figura.tipo === zona.tipo && figura.color === zona.color && figura.tamaño === zona.tamaño) {
        const nuevosEmparejados = { ...emparejados, [active.id]: String(over.id) };
        setEmparejados(nuevosEmparejados);
        
        // Verificar si el juego está completado
        if (Object.keys(nuevosEmparejados).length === figurasBase.length) {
          setJuegoCompletado(true);
        }
        // Remover el feedback de éxito individual
        
        console.log("✅ Emparejamiento exitoso:", { 
          figuraId: figura.id, 
          zonaId: zona.id,
          tipo: figura.tipo,
          color: figura.color,
          tamaño: figura.tamaño
        });
      } else {
        // Incrementar intentos fallidos
        setIntentosFallidos(prev => prev + 1);
        // Remover el feedback de error individual
        console.log("❌ No coinciden:", { 
          figuraType: figura.tipo, 
          figuraColor: figura.color,
          figuraTamaño: figura.tamaño,
          zonaType: zona.tipo,
          zonaColor: zona.color,
          zonaTamaño: zona.tamaño
        });
      }
    }
  };

  return (
    <main className="h-screen w-screen bg-gray-100 flex flex-col p-4 overflow-hidden">
      {/* Header con estadísticas y controles */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <div className="flex gap-3 items-center">
          <h2 className="text-lg font-bold">Empareja las figuras</h2>
          <div className="bg-white px-2 py-1 rounded shadow text-sm">
            <span className="text-red-600 font-semibold">❌ {intentosFallidos}</span>
          </div>
          <div className="bg-white px-2 py-1 rounded shadow text-sm">
            <span className="text-green-600 font-semibold">✅ {Object.keys(emparejados).length}/{figurasBase.length}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={mezclarJuego}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
            disabled={juegoCompletado}
          >
            🔀 Mezclar
          </button>
          <button
            onClick={reiniciarJuego}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>

      <DndContext 
        collisionDetection={rectIntersection} 
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        {/* Zonas organizadas en dos filas */}
        <div className="flex flex-col items-center mb-4 flex-shrink-0" data-no-dnd="true">
          {/* Fila superior - Figuras grandes */}
          <div className="flex justify-center flex-wrap mb-2 gap-1" data-no-dnd="true">
            {zonas.filter(zona => zona.tamaño === "grande").map((zona) => {
              const figuraEmparejadaId = Object.keys(emparejados).find(
                figuraId => emparejados[figuraId] === zona.id
              );
              const figuraColocada = figuraEmparejadaId 
                ? figuras.find(f => f.id === figuraEmparejadaId)
                : undefined;

              return (
                <DropZona 
                  key={zona.id} 
                  id={zona.id} 
                  tipo={zona.tipo}
                  figuraEjemplo={{
                    tipo: zona.tipo,
                    color: zona.color,
                    tamaño: zona.tamaño
                  }}
                  figuraColocada={figuraColocada ? {
                    tipo: figuraColocada.tipo,
                    color: figuraColocada.color,
                    tamaño: figuraColocada.tamaño
                  } : undefined}
                />
              );
            })}
          </div>
          
          {/* Fila inferior - Figuras pequeñas */}
          <div className="flex justify-center flex-wrap gap-1" data-no-dnd="true">
            {zonas.filter(zona => zona.tamaño === "pequeño").map((zona) => {
              const figuraEmparejadaId = Object.keys(emparejados).find(
                figuraId => emparejados[figuraId] === zona.id
              );
              const figuraColocada = figuraEmparejadaId 
                ? figuras.find(f => f.id === figuraEmparejadaId)
                : undefined;

              return (
                <DropZona 
                  key={zona.id} 
                  id={zona.id} 
                  tipo={zona.tipo}
                  figuraEjemplo={{
                    tipo: zona.tipo,
                    color: zona.color,
                    tamaño: zona.tamaño
                  }}
                  figuraColocada={figuraColocada ? {
                    tipo: figuraColocada.tipo,
                    color: figuraColocada.color,
                    tamaño: figuraColocada.tamaño
                  } : undefined}
                />
              );
            })}
          </div>
        </div>

        {/* Área de figuras disponibles organizadas por tamaño */}
        <div className="flex flex-col items-center flex-1 justify-start" data-no-dnd="true">
          <div className="flex flex-col items-center gap-2" data-no-dnd="true">
            {/* Figuras grandes */}
            <div className="flex flex-wrap justify-center gap-1" data-no-dnd="true">
              {figuras.filter(item => item.tamaño === "grande" && !emparejados[item.id]).map((item) => (
                <DraggableFigura key={item.id} {...item} />
              ))}
            </div>
            
            {/* Figuras pequeñas */}
            <div className="flex flex-wrap justify-center gap-1" data-no-dnd="true">
              {figuras.filter(item => item.tamaño === "pequeño" && !emparejados[item.id]).map((item) => (
                <DraggableFigura key={item.id} {...item} />
              ))}
            </div>
          </div>
        </div>
      </DndContext>

      {juegoCompletado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
            <h3 className="text-3xl font-bold text-green-600 mb-4">🎉 ¡Felicitaciones!</h3>
            <p className="text-lg mb-2">Completaste el juego</p>
            <div className="mb-4">
              <p className="text-gray-600">Total de intentos fallidos: <span className="font-bold text-red-600">{intentosFallidos}</span></p>
              <p className="text-gray-600">Figuras correctas: <span className="font-bold text-green-600">{figurasBase.length}</span></p>
              <p className="text-gray-600 mt-2">
                Puntuación: <span className="font-bold text-blue-600">
                  {Math.max(0, 100 - (intentosFallidos * 10))}%
                </span>
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={mezclarJuego}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🔀 Jugar de nuevo (Mezclado)
              </button>
              <button
                onClick={reiniciarJuego}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🔄 Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
