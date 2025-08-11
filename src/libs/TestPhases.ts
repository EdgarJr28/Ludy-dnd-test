export type Escenario = "todas" | "sin-pequeñas";

export interface FaseTest {
  id: number;
  titulo: string;
  escenario: Escenario;
  indicaciones: string[];
}

// Definición de fases e indicaciones del test
export const fasesTest: FaseTest[] = [
  {
    id: 1,
    titulo: "Todas las fichas",
    escenario: "todas",
    indicaciones: [
      "Señale un circulo",
      "Señale un cuadrado",
      "Señale una figura amarilla",
      "Señale una figura roja",
      "Señale una figura negra",
      "Señale una figura verde",
      "Señale una figura blanca",
    ],
  },
  {
    id: 2,
    titulo: "Retire las figuras pequeñas",
    escenario: "sin-pequeñas",
    indicaciones: [
      "Señale el cuadrado amarillo",
      "Señale el circulo negro",
      "Señale el círculo verde",
      "Señale el círculo blanco",
    ],
  },
  {
    id: 3,
    titulo: "Todas las fichas",
    escenario: "todas",
    indicaciones: [
      "Señale el circulo blanco pequeño",
      "Señale el cuadrado amarillo grande",
      "Señale el cuadrado verde grande",
      "Señale el cuadrado pequeño negro",
    ],
  },
  {
    id: 4,
    titulo: "Retirar las figuras pequeñas",
    escenario: "sin-pequeñas",
    indicaciones: [
      "Señale el circulo rojo y el cuadrado verde",
      "Señale el cuadrado amarillo y cuadrado blanco",
      "Señale el cuadrado blanco y circulo verde",
      "Señale el circulo blanco y circulo rojo",
    ],
  },
  {
    id: 5,
    titulo: "Todas las fichas",
    escenario: "todas",
    indicaciones: [
      "Señale el circulo grande blanco y cuadrado verde grande",
      "Señale el circulo pequeño negro y cuadrado amarillo grande",
      "Señale el cuadrado grande verde y cuadrado rojo grande",
      "Señale el cuadrado rojo grande y circulo verde pequeño",
    ],
  },
  {
    id: 6,
    titulo: "Retirar las figuras pequeñas",
    escenario: "sin-pequeñas",
    indicaciones: [
      "Ponga el circulo rojo sobre el cuadrado verde",
      "Toque el circulo negro con el cuadrado rojo",
      "Señale el circulo negro y el cuadrado rojo",
      "Señale el circulo negro o el cuadrado rojo",
      "Coloque el cuadrado verde lejos del cuadrado amarillo",
      "Si hay un circulo blanco señale el cuadrado rojo",
      "Coloque el cuadrado verde junto al circulo amarillo",
      "Señale todos los cuadrados lentamente y los circulos rápidamente",
      "Coloque el circulo rojo entre el cuadrado amarillo y el cuadrado verde",
      "Toque todos los circulos menos el verde",
      "Señale el circulo rojo con el cuadrado blanco",
      "En lugar del cuadrado blanco señale el circulo amarillo",
      "Además del circulo amarillo señale el circulo negro",
    ],
  },
];

export const getIndicacionAleatoria = (faseIdx: number) => {
  const fase = fasesTest[faseIdx];
  if (!fase) return "" as any;
  const total = fase.indicaciones.length;
  if (total === 0) return { texto: "", idx: -1 };
  const idx = Math.floor(Math.random() * total);
  return { texto: fase.indicaciones[idx], idx };
};

// Utilidades de parsing y factibilidad
type FiguraData = { id: string; tipo: string; color: string; tamaño: "pequeño" | "grande" };

export type IndicacionParte = {
  tipo?: "circulo" | "cuadro";
  color?: string;
  tamaño?: "pequeño" | "grande";
};

export type IndicacionAnalizada = {
  tipo: "simple" | "compuesta-y" | "compuesta-o" | "todos" | "compleja";
  partes: IndicacionParte[];
};

const colorEsToEn: Record<string, string> = {
  rojo: "red",
  verde: "green",
  azul: "blue",
  amarillo: "yellow",
  blanco: "white",
  negro: "black",
};

export function analizarIndicacion(texto: string): IndicacionAnalizada {
  const t = texto.toLowerCase();
  const esCompleja = [
    "sobre",
    "junto",
    "lejos",
    "entre",
    "toque",
    "coloque",
    "ponga",
    "rápid",
    "lenta",
    "además",
    "en lugar",
  ].some((w) => t.includes(w));

  const termCirculo = t.includes("circulo") || t.includes("círculo");
  const termCuadrado = t.includes("cuadrado") || t.includes("cuadro");
  const termPeque = t.includes("pequeño") || t.includes("pequeno");
  const termGrande = t.includes("grande");

  const getColor = (s: string): string | undefined => {
    if (s.includes("rojo") || s.includes("roja")) return colorEsToEn["rojo"];
    if (s.includes("verde")) return colorEsToEn["verde"];
    if (s.includes("azul")) return colorEsToEn["azul"];
    if (s.includes("amarillo") || s.includes("amarilla")) return colorEsToEn["amarillo"];
    if (s.includes("blanco") || s.includes("blanca")) return colorEsToEn["blanco"];
    if (s.includes("negro") || s.includes("negra")) return colorEsToEn["negro"];
    return undefined;
  };

  const esTodos = t.includes("todos los") || t.includes("todas las");
  if (esTodos) {
    const parte: IndicacionParte = {
      tipo: termCirculo ? "circulo" : termCuadrado ? "cuadro" : undefined,
      tamaño: termPeque ? "pequeño" : termGrande ? "grande" : undefined,
      color: getColor(t),
    };
    return { tipo: "todos", partes: [parte] };
  }

  if (t.includes(" y ")) {
    const [a, b] = t.split(" y ");
    const part = (s: string): IndicacionParte => ({
      tipo: s.includes("circulo") || s.includes("círculo") ? "circulo" : s.includes("cuadrado") || s.includes("cuadro") ? "cuadro" : undefined,
      tamaño: s.includes("pequeño") || s.includes("pequeno") ? "pequeño" : s.includes("grande") ? "grande" : undefined,
      color: getColor(s),
    });
    return { tipo: "compuesta-y", partes: [part(a), part(b)] };
  }

  if (t.includes(" o ")) {
    const [a, b] = t.split(" o ");
    const part = (s: string): IndicacionParte => ({
      tipo: s.includes("circulo") || s.includes("círculo") ? "circulo" : s.includes("cuadrado") || s.includes("cuadro") ? "cuadro" : undefined,
      tamaño: s.includes("pequeño") || s.includes("pequeno") ? "pequeño" : s.includes("grande") ? "grande" : undefined,
      color: getColor(s),
    });
    return { tipo: "compuesta-o", partes: [part(a), part(b)] };
  }

  if (esCompleja) {
    // Extraer todas las referencias a objetos (tipo/color/tamaño) en la frase
    const partes: IndicacionParte[] = [];
    const re = /\b(?:el|la|un|una)?\s*(círculo|circulo|cuadrado|cuadro)\s*(rojo|roja|verde|azul|amarillo|amarilla|blanco|blanca|negro|negra)?\s*(pequeño|pequeno|grande)?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      const tipoRaw = m[1];
      const colorRaw = m[2];
      const tamRaw = m[3];
      const tipo: "circulo" | "cuadro" = tipoRaw.includes("círculo") || tipoRaw.includes("circulo") ? "circulo" : "cuadro";
      const color = colorRaw ? getColor(colorRaw) : undefined;
      const tamaño = tamRaw ? (tamRaw.includes("peque") ? "pequeño" : "grande") : undefined;
      partes.push({ tipo, color, tamaño });
    }
    if (partes.length > 0) {
      return { tipo: "compleja", partes };
    }
    // Fallback a una parte genérica
    const parte: IndicacionParte = {
      tipo: termCirculo ? "circulo" : termCuadrado ? "cuadro" : undefined,
      tamaño: termPeque ? "pequeño" : termGrande ? "grande" : undefined,
      color: getColor(t),
    };
    return { tipo: "compleja", partes: [parte] };
  }

  // simple
  const parte: IndicacionParte = {
    tipo: termCirculo ? "circulo" : termCuadrado ? "cuadro" : undefined,
    tamaño: termPeque ? "pequeño" : termGrande ? "grande" : undefined,
    color: getColor(t),
  };
  return { tipo: "simple", partes: [parte] };
}

export function esIndicacionFactible(indicacion: string, figuras: FiguraData[]): boolean {
  const a = analizarIndicacion(indicacion);
  const filtrar = (f: FiguraData, p: IndicacionParte) =>
    (!p.tipo || f.tipo === p.tipo) && (!p.color || f.color === p.color) && (!p.tamaño || f.tamaño === p.tamaño);

  if (a.tipo === "todos") {
    const cands = figuras.filter((f) => filtrar(f, a.partes[0]!));
    return cands.length > 0;
  }

  if (a.tipo === "compuesta-y") {
    const [p1, p2] = a.partes;
    const c1 = figuras.some((f) => filtrar(f, p1!));
    const c2 = figuras.some((f) => filtrar(f, p2!));
    return c1 && c2;
  }

  if (a.tipo === "compuesta-o") {
    const [p1, p2] = a.partes;
    const c1 = figuras.some((f) => filtrar(f, p1!));
    const c2 = figuras.some((f) => filtrar(f, p2!));
    return c1 || c2;
  }

  if (a.tipo === "compleja") {
    // Solo verificamos existencia de cada parte si hay
    return a.partes.every((p) => figuras.some((f) => filtrar(f, p)));
  }

  // simple
  return figuras.some((f) => filtrar(f, a.partes[0]!));
}

// Ahora getIndicacionAleatoriaValida solo retorna una indicación aleatoria de la fase, sin filtrar por factibilidad
export const getIndicacionAleatoriaValida = (faseIdx: number) => {
  const fase = fasesTest[faseIdx];
  if (!fase) return { texto: "", idx: -1 };
  const total = fase.indicaciones.length;
  if (total === 0) return { texto: "", idx: -1 };
  const idx = Math.floor(Math.random() * total);
  return { texto: fase.indicaciones[idx], idx };
};
