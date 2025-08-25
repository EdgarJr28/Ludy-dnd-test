"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  rectIntersection,
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
  const [dropGhost, setDropGhost] = useState<{
    card: Card;
    targetId: string;
  } | null>(null);

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
      console.warn(
        "Revisa config/wcst-deck.json, el JSON está mal formado o no existe."
      );
    }
  };

  const startExtendida = () => {
    try {
      if (!deck.length) throw new Error("Mazo vacío");
      start(64, { deck });
    } catch (e) {
      console.error(e);
      console.warn(
        "Revisa config/wcst-deck.json, el JSON está mal formado o no existe."
      );
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
      {/* padding responsivo y ancho máximo */}
      <div className="mx-auto w-full max-w-screen-lg px-3 sm:px-4 md:px-6 py-4 md:py-4 space-y-4 md:space-y-4">
        {/* Header responsive */}
        <header className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-center">
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-sm sm:text-xs">
            <span className="px-2 py-1 rounded-full bg-white border">
              Regla actual:{" "}
              <strong className="capitalize">
                {rule ??
                  `descubrir${prevRule ? ` (no repetir: ${prevRule})` : ""}`}
              </strong>
            </span>
            <span className="px-2 py-1 rounded-full bg-white border">
              Ensayo: <strong>{Math.min(trial + 1, totalTrials)}</strong> /{" "}
              {totalTrials}
            </span>
            <span className="px-2 py-1 rounded-full bg-white border">
              Categorías: <strong>{categories}</strong> / {MAX_CATEGORIES}
            </span>
          </div>
        </header>

        {/* Pantalla de selección de modo (antes de empezar) */}
        {!started && (
          <div className="rounded-2xl bg-white border p-4 sm:p-4 flex flex-col items-center gap-4">
            <h2 className="text-base sm:text-lg font-semibold text-center">
              Elige el modo
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={startAbreviada}
                className="px-4 py-2 rounded-xl border w-full sm:w-auto"
              >
                Abreviada (24)
              </button>
              <button
                onClick={startExtendida}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white w-full sm:w-auto"
              >
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
            onDragStart={(_e: DragStartEvent) => {
              setDragActive(true);
              setOverId(null);
            }}
            onDragOver={(e: DragOverEvent) =>
              setOverId((e.over?.id as string) ?? null)
            }
            onDragCancel={() => {
              setDragActive(false);
              setOverId(null);
            }}
            onDragEnd={(e: DragEndEvent) => {
              setDragActive(false);
              const over = e.over?.id as string | undefined;
              const valid = over && overId && over === overId;
              setOverId(null);
              if (!valid || !currentCard) return;

              setDropGhost({ card: currentCard, targetId: over });
              classify(over);
              window.setTimeout(() => setDropGhost(null), 350);
            }}
          >
            {/* Estímulos modelo - centrados y con gaps compactos en móvil */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 place-items-center">
              {models.map((m) => (
                <DroppableSlot
                  key={m.id}
                  id={m.id}
                  isOver={overId === m.id}
                  ghost={
                    dropGhost && dropGhost.targetId === m.id
                      ? dropGhost.card
                      : null
                  }
                >
                  {/* Escala suave de la carta en móviles */}
                  <div className="scale-5 sm:scale-100 origin-center">
                    <CardView card={m} />
                  </div>
                </DroppableSlot>
              ))}
            </div>

            {/* Zona de juego + Aside (1 col en móvil, 2/3 col en md+) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
              {/* Área de drop y feedback */}
              <div className="md:col-span-2">
                <div className="rounded-2xl bg-gray-200 p-4 sm:p-2 min-h-[240px] sm:min-h-[240px] flex flex-col items-center justify-center gap-3 sm:gap-2">
                  {!finished && currentCard ? (
                    <>
                      <p className="text-xs text-gray-600 text-center">
                        Arrastra la carta y suéltala sobre una carta modelo (o
                        usa teclas 1–4).
                      </p>
                      {/* El Draggable ya tiene touch-none/select-none; cabe dentro en mobile */}
                      <div className="scale-95 sm:scale-100 origin-center">
                        <DraggableResponse card={currentCard} />
                      </div>

                      {feedback && (
                        <div
                          className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
                            feedback.ok
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-rose-100 text-rose-900"
                          }`}
                        >
                          {feedback.msg}
                        </div>
                      )}
                      <div className="hidden md:block text-[10px] text-gray-400">
                        overId: {overId ?? "(none)"}
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-1">
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Evaluación terminada
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Puedes reiniciar para una nueva sesión.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Aside (sticky en pantallas md+) */}
              <aside className="space-y-2 md:sticky md:top-4">
                <div className="rounded-2xl bg-white border p-4">
                  <h3 className="font-semibold mb-2">Métricas</h3>
                  <ul className="text-xs space-y-1">
                    <li>
                      Aciertos: <strong>{correct}</strong>
                    </li>
                    <li>
                      Errores: <strong>{errors}</strong>
                    </li>
                    <li>
                      Errores perseverativos:{" "}
                      <strong>{perseverativeErrors}</strong>
                    </li>
                    <li>
                      Fallo en mantener set: <strong>{failMaintainSet}</strong>
                    </li>
                    <li>
                      Racha actual: <strong>{streak}</strong> / {criterion}
                    </li>
                    <li>
                      Precisión: <strong>{accuracy.toFixed(1)}%</strong>
                    </li>
                    <li>
                      RT mediana:{" "}
                      <strong>
                        {rts.length ? Math.round(median(rts)) : 0} ms
                      </strong>
                    </li>
                  </ul>
                </div>

                {/* Controles (botones full en móvil) */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {restart()}}
                    className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-black w-full sm:w-auto"
                  >
                    Reiniciar
                  </button>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      location.reload();
                    }}
                    className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 w-full sm:w-auto"
                  >
                    Cambiar modo
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  La regla se fija con tu primer acierto y se mantiene hasta{" "}
                  <strong>{criterion} aciertos consecutivos</strong>.
                </p>
              </aside>
            </div>

            {/* Overlay (carta “volando”) */}
            <DragOverlay>
              {dragActive && currentCard ? (
                <div className="scale-95 sm:scale-100 origin-center">
                  <CardView card={currentCard} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
