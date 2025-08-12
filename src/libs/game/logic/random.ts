import { fasesTest } from "@/data/test-fases";

export const getIndicacionAleatoria = (faseIdx: number) => {
  const fase = fasesTest[faseIdx];
  if (!fase) return "" as any;
  const total = fase.indicaciones.length;
  if (total === 0) return { texto: "", idx: -1 };
  const idx = Math.floor(Math.random() * total);
  return { texto: fase.indicaciones[idx], idx };
};


// getIndicacionAleatoriaValida solo retorna una indicación aleatoria de la fase, sin filtrar por factibilidad
export const getIndicacionAleatoriaValida = (faseIdx: number) => {
  const fase = fasesTest[faseIdx];
  if (!fase) return { texto: "", idx: -1 };
  const total = fase.indicaciones.length;
  if (total === 0) return { texto: "", idx: -1 };
  const idx = Math.floor(Math.random() * total);
  return { texto: fase.indicaciones[idx], idx };
};
