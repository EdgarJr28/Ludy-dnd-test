export type IndicacionParte = {
  tipo?: "circulo" | "cuadro";
  color?: string;
  tamaño?: "pequeño" | "grande";
};

export type IndicacionAnalizada = {
  tipo: "simple" | "compuesta-y" | "compuesta-o" | "todos" | "compleja" | "entre";
  partes: IndicacionParte[];
};
