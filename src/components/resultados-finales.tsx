import React from "react";

interface ResultadosFinalesProps {
  aciertos: number;
  errores: number;
  correctasGlobal: number;
  incorrectasGlobal: number;
  onReiniciar: () => void;
  className?: string;
}

const CheckIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CrossIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const FlagIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M4 4v16M6 4h9l-2 3 2 3H6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StatChip = ({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) => (
  <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${className}`} >
    {children}
  </span>
);

const Progress = ({ value }: { value: number }) => (
  <div className="w-full h-2 rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full rounded bg-green-500 dark:bg-green-400" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

const ResultadosFinales: React.FC<ResultadosFinalesProps> = ({
  aciertos,
  errores,
  correctasGlobal,
  incorrectasGlobal,
  onReiniciar,
  className = "",
}) => {
  const btn =
    "inline-flex items-center justify-center rounded-md border h-10 px-4 text-sm font-medium " +
    "border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 " +
    "text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60 dark:focus-visible:ring-neutral-500/60";

  const totalSesion = aciertos + errores;
  const totalGlobal = correctasGlobal + incorrectasGlobal;

  const pctSesion = totalSesion ? (aciertos / totalSesion) * 100 : 0;
  const pctGlobal = totalGlobal ? (correctasGlobal / totalGlobal) * 100 : 0;

  const resumenId = "resultados-resumen";
  const tituloId = "resultados-titulo";
  const primaryBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    primaryBtnRef.current?.focus();
  }, []);

  const tagFor = (pct: number) =>
    pct >= 90 ? "Excelente" : pct >= 75 ? "Muy bien" : pct >= 50 ? "En práctica" : "A seguir";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      aria-describedby={resumenId}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 sm:p-6">
        <header className="flex items-center gap-2 mb-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
            <FlagIcon />
          </div>
          <h2 id={tituloId} className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            ¡Test finalizado!
          </h2>
        </header>

        <p id={resumenId} className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
          Resumen de tu desempeño en esta sesión y acumulado global.
        </p>

        <div className="grid gap-4">
          {/* Sesión */}
          {/* <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Sesión</h3>
              <StatChip className="border-green-300/70 dark:border-green-400/40 text-green-800 dark:text-green-300 bg-green-100/80 dark:bg-green-900/20">
                {tagFor(pctSesion)}
              </StatChip>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <StatChip className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                <CheckIcon /> {aciertos}
              </StatChip>
              <StatChip className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                <CrossIcon /> {errores}
              </StatChip>
              <span className="ml-auto text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                {Math.round(pctSesion)}%
              </span>
            </div>
            <Progress value={pctSesion} />
          </section> */}

          {/* Global */}
          <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Global</h3>
              <StatChip className="border-blue-300/70 dark:border-blue-400/40 text-blue-800 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/20">
                {tagFor(pctGlobal)}
              </StatChip>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <StatChip className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                <CheckIcon /> {correctasGlobal}
              </StatChip>
              <StatChip className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                <CrossIcon /> {incorrectasGlobal}
              </StatChip>
              <span className="ml-auto text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                {Math.round(pctGlobal)}%
              </span>
            </div>
            <Progress value={pctGlobal} />
          </section>
        </div>

        <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2">
          <button
            ref={primaryBtnRef}
            className={`${btn} w-full sm:w-auto`}
            onClick={onReiniciar}
          >
            Reiniciar
          </button>
          {/* Si luego quieres un botón secundario, agrégalo aquí */}
        </div>
      </div>
    </div>
  );
};

export default ResultadosFinales;
