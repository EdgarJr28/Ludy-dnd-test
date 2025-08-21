// app/wcst/WCSTGame.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  rectIntersection
} from "@dnd-kit/core";
import { Card } from "./types/types";
import { useDnDSensors } from "./hooks/use-dnd-sensors";
import { useWCST } from "./hooks/use-wcst";
import { MAX_CATEGORIES, MODEL_CARDS } from "./types/constants";
import { useKeyShortcuts } from "./hooks/use-key-shortcuts";
import { DroppableSlot } from "./components/droppable-slot";
import { CardView } from "./ui/card-view";
import { DraggableResponse } from "./components/draggable-response";
import { sanitizeDeck } from "./libs/deck";
import rawDeck from "./config/wcst-deck.json";
import { useToneSfx } from "./hooks/use-sfx";


export default function WCSTGame() {
  const {
    started,
    totalTrials,
    criterion,
    trial,
    rule,
    prevRule,
    streak,
    categories,
    finished,
    correct,
    errors,
    perseverativeErrors,
    failMaintainSet,
    accuracy,
    currentCard,
    feedback,
    rts,
    start,
    classify,
    restart,
  } = useWCST();

  const [dragActive, setDragActive] = useState(false);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropGhost, setDropGhost] = useState<{ card: Card; targetId: string } | null>(null);

  const sensors = useDnDSensors();
  const models = useMemo(() => MODEL_CARDS, []);
  const deck = useMemo(() => sanitizeDeck(rawDeck), []);

  // 🔊 Controles de sonido
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolume] = useState(0.9); // 0..1
  const { playOk, playErr } = useToneSfx({ volume });

  // Reproduce sonido cuando cambia el feedback (correcto/incorrecto)
  useEffect(() => {
    if (!soundOn || !started || !feedback) return;
    feedback.ok ? playOk() : playErr();
  }, [feedback, soundOn, started, playOk, playErr]);

  // Handlers para iniciar con mazo JSON
  const startAbreviada = () => {
    try {
      if (!deck.length) throw new Error("Mazo vacío");
      start(24, { deck });
    } catch (e) {
      console.error(e);
      console.warn("Revisa config/wcst-deck.json, el JSON está mal formado o no existe.");
    }
  };

  const startExtendida = () => {
    try {
      if (!deck.length) throw new Error("Mazo vacío");
      start(64, { deck });
    } catch (e) {
      console.error(e);
      console.warn("Revisa config/wcst-deck.json, el JSON está mal formado o no existe.");
    }
  };

  // Atajos 1..4 sólo cuando la sesión está activa
  useKeyShortcuts(started && !finished, (key) => {
    if (["1", "2", "3", "4"].includes(key) && started && !finished) {
      const idx = parseInt(key, 10) - 1;
      const target = models[idx]?.id;
      if (target) classify(target);
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">WCST — Demo Drag & Drop</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 rounded-full bg-white border">
              Regla actual: <strong className="capitalize">
                {rule ?? `descubrir${prevRule ? ` (no repetir: ${prevRule})` : ""}`}
              </strong>
            </span>
            <span className="px-2 py-1 rounded-full bg-white border">
              Ensayo: <strong>{Math.min(trial + 1, totalTrials)}</strong> / {totalTrials}
            </span>
            <span className="px-2 py-1 rounded-full bg-white border">
              Categorías: <strong>{categories}</strong> / {MAX_CATEGORIES}
            </span>
          </div>
        </header>

        {/* Pantalla de selección de modo (antes de empezar) */}
        {!started && (
          <div className="rounded-2xl bg-white border p-6 flex flex-col items-center gap-4">
            <h2 className="text-lg font-semibold">Elige el modo</h2>
            <div className="flex gap-3">
              <button onClick={startAbreviada} className="px-4 py-2 rounded-xl border">
                Abreviada (24)
              </button>
              <button onClick={startExtendida} className="px-4 py-2 rounded-xl bg-gray-900 text-white">
                Extendida (64)
              </button>
            </div>
          </div>
        )}

        {/* Juego activo */}
        {started && (
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={(_e: DragStartEvent) => setDragActive(true)}
            onDragOver={(e: DragOverEvent) => setOverId((e.over?.id as string) ?? null)}
            onDragCancel={() => {
              setDragActive(false);
              setOverId(null);
            }}
            onDragEnd={(e) => {
              setDragActive(false);

              // Debe existir un droppable detectado y debe ser el mismo que teníamos "encima"
              const over = e.over?.id as string | undefined;
              const valid = over && overId && over === overId;

              // Limpia estado de hover después de evaluar
              setOverId(null);

              if (!valid || !currentCard) {
                // ❌ No clasifiques si no está encima al soltar
                return;
              }

              // ✅ Drop válido (encima del objetivo)
              setDropGhost({ card: currentCard, targetId: over });
              classify(over);
              window.setTimeout(() => setDropGhost(null), 350);
            }}
          >
            {/* Estímulos modelo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {models.map((m) => (
                <DroppableSlot
                  key={m.id}
                  id={m.id}
                  isOver={overId === m.id}
                  ghost={dropGhost && dropGhost.targetId === m.id ? dropGhost.card : null}
                >
                  <CardView card={m} />
                </DroppableSlot>
              ))}
            </div>

            {/* Zona de juego */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-6">
              <div className="md:col-span-2">
                <div className="rounded-2xl bg-white border p-6 min-h-[300px] flex flex-col items-center justify-center gap-4">
                  {!finished && currentCard ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Arrastra la carta y suéltala sobre una carta modelo (o usa teclas 1–4).
                      </p>
                      <DraggableResponse card={currentCard} />
                      {feedback && (
                        <div
                          className={`px-3 py-1 rounded-full text-sm ${feedback.ok ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                            }`}
                        >
                          {feedback.msg}
                        </div>
                      )}
                      <div className="text-[10px] text-gray-400">overId: {overId ?? "(none)"}</div>
                    </>
                  ) : (
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">Evaluación terminada</h2>
                      <p className="text-gray-600">Puedes reiniciar para una nueva sesión.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Métricas y acciones */}
              <aside className="space-y-3">
                <div className="rounded-2xl bg-white border p-4">
                  <h3 className="font-semibold mb-2">Métricas</h3>
                  <ul className="text-sm space-y-1">
                    <li>Aciertos: <strong>{correct}</strong></li>
                    <li>Errores: <strong>{errors}</strong></li>
                    <li>Errores perseverativos: <strong>{perseverativeErrors}</strong></li>
                    <li>Fallo en mantener set: <strong>{failMaintainSet}</strong></li>
                    <li>Racha actual: <strong>{streak}</strong> / {criterion}</li>
                    <li>Precisión: <strong>{accuracy.toFixed(1)}%</strong></li>
                    <li>RT mediana: <strong>{rts.length ? Math.round(median(rts)) : 0} ms</strong></li>
                  </ul>
                </div>

                {/* 🔊 Sonido */}
                <div className="rounded-2xl bg-white border p-4 space-y-2">
                  <h3 className="font-semibold">Sonido</h3>
                  <div className="flex items-center gap-3">
                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={soundOn}
                        onChange={(e) => setSoundOn(e.target.checked)}
                      />
                      Activar sonidos
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-12">Vol.</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-xs text-gray-500 w-10">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={restart} className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-black">
                    Reiniciar
                  </button>
                  {/* Cambiar modo: vuelve a pantalla de selección */}
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      location.reload();
                      // Si prefieres sin recargar, expón un método en tu hook para setStarted(false).
                    }}
                    className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
                  >
                    Cambiar modo
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  La regla se fija con tu primer acierto y se mantiene hasta <strong>{criterion} aciertos consecutivos</strong>.
                </p>
              </aside>
            </div>

            <DragOverlay>
              {dragActive && currentCard ? <CardView card={currentCard} /> : null}
            </DragOverlay>
          </DndContext>
        )}

        <footer className="pt-4 text-xs text-gray-500">
          Demo educativa inspirada en WCST. No usar para diagnóstico clínico.
        </footer>
      </div>
    </div>
  );
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
