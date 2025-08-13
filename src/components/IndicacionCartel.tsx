import React from "react";

interface IndicacionCartelProps {
  texto: string;
  onAleatoria?: () => void;
  mostrarBoton?: boolean;
}

const IndicacionCartel: React.FC<IndicacionCartelProps> = ({ texto, onAleatoria, mostrarBoton = false }) => {
  return (
    <div className="order-1 md:order-2 flex items-center justify-center w-full">
      <div className="mx-auto w-full max-w-xl px-4 py-3 rounded-xl shadow-lg bg-gradient-to-br from-yellow-100 to-yellow-300 border-2 border-yellow-400 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 mb-1">
          {/* <span className="text-2xl">📢</span> */}
          <span className="text-base sm:text-lg font-bold text-yellow-900">
            Completa la indicación
          </span>
        </div>
        <span className="font-semibold text-center text-yellow-900 text-lg sm:text-xl break-words leading-snug">
          {texto}
        </span>
        {mostrarBoton && (
          <button
            className="mt-2 px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded font-semibold text-sm shadow"
            onClick={onAleatoria}
          >
            🔀 Aleatoria
          </button>
        )}
      </div>
    </div>
  );
};

export default IndicacionCartel;
