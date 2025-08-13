import React from "react";

interface ResultadosFinalesProps {
  aciertos: number;
  errores: number;
  correctasGlobal: number;
  incorrectasGlobal: number;
  onReiniciar: () => void;
}

const ResultadosFinales: React.FC<ResultadosFinalesProps> = ({
  aciertos,
  errores,
  correctasGlobal,
  incorrectasGlobal,
  onReiniciar,
}) => (
  <div className="fixed inset-0 bg-gray-200/10 backdrop-blur-md flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
      <h2 className="text-xl font-bold mb-4">¡Test finalizado!</h2>
      <div className="mb-2 text-green-700 font-semibold">Correctas: {correctasGlobal} <br /></div>
      <div className="mb-4 text-red-700 font-semibold">Incorrectas: {incorrectasGlobal}</div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        onClick={onReiniciar}
      >
        Reiniciar
      </button>
    </div>
  </div>
);

export default ResultadosFinales;
