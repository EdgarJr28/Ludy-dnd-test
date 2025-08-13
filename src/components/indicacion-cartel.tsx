import React from "react";

interface IndicacionCartelProps {
  texto: string;
  onAleatoria?: () => void;
  mostrarBoton?: boolean;
  /** Lee en voz alta automáticamente cuando cambia `texto` (por defecto true) */
  autoLeer?: boolean;
  /** Lang para TTS, ej. "es-ES" | "es-MX" */
  lang?: string;
  /** Clases extra para el contenedor */
  className?: string;
}

const SpeakerIcon = ({ active = false }: { active?: boolean }) => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M4 9v6h3l5 4V5L7 9H4Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={active ? 0.9 : 1}
    />
    <path
      d="M16 9.5c.9 1 .9 4 0 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity={0.7}
    />
    <path
      d="M18.5 7c1.8 2 1.8 8 0 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity={0.4}
    />
  </svg>
);

const ShuffleIcon = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M16 3h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 7h7c3 0 4 3 5 5s2 5 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M21 16v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IndicacionCartel: React.FC<IndicacionCartelProps> = ({
  texto,
  onAleatoria,
  mostrarBoton = false,
  autoLeer = true,
  lang = "es-ES",
  className = "",
}) => {
  const [hablando, setHablando] = React.useState(false);
  const supportsTTS = typeof window !== "undefined" && "speechSynthesis" in window;
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  // Elegir una voz española si existe
  const getVoice = React.useCallback(() => {
    if (!supportsTTS) return null;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang?.toLowerCase().startsWith(lang.toLowerCase()));
    return preferred ?? null;
  }, [supportsTTS, lang]);

  const hablar = React.useCallback((t: string) => {
    if (!supportsTTS || !t) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = lang;
    const voice = getVoice();
    if (voice) u.voice = voice;
    u.onstart = () => setHablando(true);
    u.onend = () => setHablando(false);
    u.onerror = () => setHablando(false);
    utteranceRef.current = u;
    synth.speak(u);
  }, [supportsTTS, getVoice, lang]);

  const detener = React.useCallback(() => {
    if (!supportsTTS) return;
    window.speechSynthesis.cancel();
    setHablando(false);
  }, [supportsTTS]);

  const toggleVoz = React.useCallback(() => {
    if (!supportsTTS) return;
    if (hablando) detener();
    else hablar(texto);
  }, [supportsTTS, hablando, detener, hablar, texto]);

  // Autoleer cuando cambia el texto
  React.useEffect(() => {
    if (!supportsTTS) return;
    // iOS carga voces de forma perezosa; forzamos acceso
    window.speechSynthesis.getVoices();
    if (autoLeer && texto) {
      hablar(texto);
    }
    // cleanup
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [texto, autoLeer, supportsTTS, hablar]);

  return (
    <div className={`order-1 md:order-2 w-full flex items-center justify-center ${className}`}>
      <section
        className="
          mx-auto w-full max-w-xl
          rounded-xl border border-neutral-200 dark:border-neutral-800
          bg-white dark:bg-neutral-900
          shadow-sm
          px-4 py-3 md:px-5 md:py-4
          transition-shadow
        "
        aria-label="Cartel de indicación"
      >
        <header className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            Indicación
          </h2>
          <div className="flex items-center gap-2">
            {supportsTTS && (
              <button
                type="button"
                onClick={toggleVoz}
                aria-pressed={hablando}
                title={hablando ? "Detener lectura" : "Escuchar indicación"}
                className="
                  inline-flex items-center justify-center
                  h-8 w-8 rounded-md
                  border border-neutral-200 dark:border-neutral-700
                  text-neutral-700 dark:text-neutral-200
                  hover:bg-neutral-50 dark:hover:bg-neutral-800
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60 dark:focus-visible:ring-neutral-500/60
                  transition-colors
                "
              >
                <SpeakerIcon active={hablando} />
                <span className="sr-only">{hablando ? "Detener lectura" : "Escuchar indicación"}</span>
              </button>
            )}
            {mostrarBoton && (
              <button
                type="button"
                onClick={onAleatoria}
                className="
                  inline-flex items-center gap-2 h-8
                  rounded-md px-2.5
                  text-sm font-medium
                  border border-neutral-200 dark:border-neutral-700
                  text-neutral-700 dark:text-neutral-200
                  hover:bg-neutral-50 dark:hover:bg-neutral-800
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60 dark:focus-visible:ring-neutral-500/60
                  transition-colors
                "
                title="Nueva indicación aleatoria"
              >
                <ShuffleIcon />
                Aleatoria
              </button>
            )}
          </div>
        </header>

        <p
          className="
            text-base md:text-lg leading-relaxed
            text-neutral-900 dark:text-neutral-100
            font-medium
            break-words
          "
          // Evita doble lectura por lector de pantalla si además usas TTS
          aria-live="off"
        >
          {texto}
        </p>
      </section>
    </div>
  );
};

export default IndicacionCartel;
