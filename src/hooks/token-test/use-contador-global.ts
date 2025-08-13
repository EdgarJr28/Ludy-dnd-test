import { useRef } from "react";

export function useContadorGlobal() {
  // Usar useRef para persistencia entre renders y fases
  const correctas = useRef(0);
  const incorrectas = useRef(0);

  // Funciones para incrementar
  const sumarCorrecta = () => {
    correctas.current += 1;
  };
  const sumarIncorrecta = () => {
    incorrectas.current += 1;
  };

  // Reset opcional
  const reset = () => {
    correctas.current = 0;
    incorrectas.current = 0;
  };

  return {
    correctas: correctas.current,
    incorrectas: incorrectas.current,
    sumarCorrecta,
    sumarIncorrecta,
    reset,
  };
}
