'use client'
import { Escenario } from "@/types/juego";
import React from "react";

interface FaseToolbarProps {
  faseIdx: number;
  totalFases: number;
  onPrev: () => void;
  onNext: () => void;
  escenario?: Escenario;
  className?: string;
  mostrarEscenario?: boolean;

  onMezclar?: () => void;
  onReiniciar?: () => void;
  showExtras?: boolean;

  controlesDisabled?: boolean; // modo informativo
  mostrarEstadoDisabled?: boolean;
  disabledLabel?: string;
}

const ChevronLeft = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const ChevronRight = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const LockIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-3.5 h-3.5">
    <path d="M7 10V8a5 5 0 0110 0v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="5" y="10" width="14" height="10" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const FaseToolbar: React.FC<FaseToolbarProps> = ({
  faseIdx,
  totalFases,
  onPrev,
  onNext,
  escenario = "todas",
  className = "",
  mostrarEscenario = true,
  onMezclar,
  onReiniciar,
  showExtras = false,
  controlesDisabled = false,
  mostrarEstadoDisabled = true,
  disabledLabel = "solo lectura",
}) => {
  const prevEdge = faseIdx <= 0;
  const nextEdge = faseIdx >= totalFases - 1;

  const prevDisabled = controlesDisabled || prevEdge;
  const nextDisabled = controlesDisabled || nextEdge;
  const extrasDisabled = controlesDisabled;

  // === Estilos con estado normal visible (bg + borde con más contraste) ===
  const btnBase =
    "inline-flex items-center justify-center rounded-md border text-xs sm:text-sm font-medium " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60 dark:focus-visible:ring-neutral-500/60 " +
    "disabled:opacity-60 disabled:cursor-not-allowed";
  const btn =
    `${btnBase} h-8 px-2.5 ` +
    // borde más visible
    "border-neutral-300 dark:border-neutral-700 " +
    // fondo visible en reposo
    "bg-neutral-100 dark:bg-neutral-800 " +
    // texto con buen contraste
    "text-neutral-800 dark:text-neutral-100 " +
    // hover solo acentúa, pero ya se ve en reposo
    "hover:bg-neutral-200 dark:hover:bg-neutral-700";
  const pill =
    "ml-0 md:ml-2 text-[11px] sm:text-xs px-2 py-1 rounded " +
    "border border-black dark:border-black " +
    "bg-amber-100 dark:bg-amber-900/30 " +
    "text-amber-900 dark:text-black whitespace-nowrap";
  const pillDisabled =
    "text-[11px] sm:text-xs px-2 py-1 rounded " +
    "border border-neutral-300 dark:border-neutral-700 " +
    "bg-neutral-100 dark:bg-neutral-800 " +
    "text-neutral-700 dark:text-neutral-200 inline-flex items-center gap-1";

  const handleKey: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (controlesDisabled) return;
    if (e.key === "ArrowLeft" && !prevDisabled) onPrev();
    if (e.key === "ArrowRight" && !nextDisabled) onNext();
  };

  const disabledTitle = controlesDisabled ? `Controles deshabilitados (${disabledLabel})` : undefined;

  return (
    <div
      className={`order-3 flex flex-wrap items-center justify-center md:justify-end gap-2 ${className}`}
      role="toolbar"
      aria-label="Controles de fase"
      aria-disabled={controlesDisabled || undefined}
      tabIndex={0}
      onKeyDown={handleKey}
      data-testid="fase-toolbar"
    >
      <span className="text-xs sm:text-sm text-black">Fase</span>

      <button
        type="button"
        className={btn}
        onClick={onPrev}
        disabled={prevDisabled}
        aria-label="Fase anterior"
        title={prevDisabled ? (disabledTitle ?? (prevEdge ? "Primera fase" : "Deshabilitado")) : "Fase anterior"}
      >
        <ChevronLeft />
      </button>

      <span
        className="font-semibold text-xs sm:text-sm text-black"
        aria-live="polite"
        aria-atomic="true"
        title={disabledTitle}
      >
        {faseIdx + 1} / {totalFases}
      </span>

      <button
        type="button"
        className={btn}
        onClick={onNext}
        disabled={nextDisabled}
        aria-label="Fase siguiente"
        title={nextDisabled ? (disabledTitle ?? (nextEdge ? "Última fase" : "Deshabilitado")) : "Fase siguiente"}
      >
        <ChevronRight />
      </button>

      {mostrarEscenario && (
        <span className={pill}>
          {escenario === "todas" ? "todas las fichas" : "sin pequeñas"}
        </span>
      )}

      {controlesDisabled && mostrarEstadoDisabled && (
        <span className={pillDisabled} title={disabledLabel} role="note">
          <LockIcon />
          {disabledLabel}
        </span>
      )}

      {showExtras && onMezclar && (
        <button
          type="button"
          className={btn}
          onClick={onMezclar}
          title="Mezclar"
          disabled={extrasDisabled}
          aria-disabled={extrasDisabled || undefined}
        >
          🔀 <span className="hidden sm:inline ml-1">Mezclar</span>
        </button>
      )}

      {showExtras && onReiniciar && (
        <button
          type="button"
          className={btn}
          onClick={onReiniciar}
          title="Reiniciar"
          disabled={extrasDisabled}
          aria-disabled={extrasDisabled || undefined}
        >
          🔄 <span className="hidden sm:inline ml-1">Reiniciar</span>
        </button>
      )}
    </div>
  );
};
