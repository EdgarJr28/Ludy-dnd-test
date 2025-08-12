import { IndicacionAnalizada, IndicacionParte } from "@/types/indicacion";
import { colorEsToEn } from "@/types/juego";

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
    if (s.includes("amarillo") || s.includes("amarilla"))
      return colorEsToEn["amarillo"];
    if (s.includes("blanco") || s.includes("blanca"))
      return colorEsToEn["blanco"];
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

  // Manejo especial para instrucciones tipo "entre"
  if (t.includes("entre") && t.includes(" y ")) {
    // Ejemplo: "Coloque el circulo rojo entre el cuadrado amarillo y el cuadrado verde"
    // Extraer A, B y C
    // A: antes de 'entre', B: entre 'entre' y 'y', C: después de 'y'
    const reEntre =
      /(?:el|la|un|una)?\s*([^ ]+\s+(?:circulo|círculo|cuadrado|cuadro)[^ ]*) entre ([^ ]+\s+(?:circulo|círculo|cuadrado|cuadro)[^ ]*) y ([^ ]+\s+(?:circulo|círculo|cuadrado|cuadro)[^ ]*)/i;
    const m = reEntre.exec(t);
    if (m) {
      const [, aRaw, bRaw, cRaw] = m;
      const part = (s: string): IndicacionParte => ({
        tipo:
          s.includes("circulo") || s.includes("círculo")
            ? "circulo"
            : s.includes("cuadrado") || s.includes("cuadro")
            ? "cuadro"
            : undefined,
        tamaño:
          s.includes("pequeño") || s.includes("pequeno")
            ? "pequeño"
            : s.includes("grande")
            ? "grande"
            : undefined,
        color: getColor(s),
      });
      return { tipo: "entre", partes: [part(aRaw), part(bRaw), part(cRaw)] };
    } else {
      // Fallback: split manual
      const [antesEntre, despuesEntre] = t.split("entre");
      const [bRaw, cRaw] = despuesEntre.split(" y ");
      const aRaw = antesEntre.replace(/coloque|ponga|el|la|un|una/g, "").trim();
      const part = (s: string): IndicacionParte => ({
        tipo:
          s.includes("circulo") || s.includes("círculo")
            ? "circulo"
            : s.includes("cuadrado") || s.includes("cuadro")
            ? "cuadro"
            : undefined,
        tamaño:
          s.includes("pequeño") || s.includes("pequeno")
            ? "pequeño"
            : s.includes("grande")
            ? "grande"
            : undefined,
        color: getColor(s),
      });
      return { tipo: "entre", partes: [part(aRaw), part(bRaw), part(cRaw)] };
    }
  }

  if (t.includes(" y ")) {
    const [a, b] = t.split(" y ");
    const part = (s: string): IndicacionParte => ({
      tipo:
        s.includes("circulo") || s.includes("círculo")
          ? "circulo"
          : s.includes("cuadrado") || s.includes("cuadro")
          ? "cuadro"
          : undefined,
      tamaño:
        s.includes("pequeño") || s.includes("pequeno")
          ? "pequeño"
          : s.includes("grande")
          ? "grande"
          : undefined,
      color: getColor(s),
    });
    return { tipo: "compuesta-y", partes: [part(a), part(b)] };
  }

  if (t.includes(" o ")) {
    const [a, b] = t.split(" o ");
    const part = (s: string): IndicacionParte => ({
      tipo:
        s.includes("circulo") || s.includes("círculo")
          ? "circulo"
          : s.includes("cuadrado") || s.includes("cuadro")
          ? "cuadro"
          : undefined,
      tamaño:
        s.includes("pequeño") || s.includes("pequeno")
          ? "pequeño"
          : s.includes("grande")
          ? "grande"
          : undefined,
      color: getColor(s),
    });
    return { tipo: "compuesta-o", partes: [part(a), part(b)] };
  }

  if (esCompleja) {
    // Extraer todas las referencias a objetos (tipo/color/tamaño) en la frase
    const partes: IndicacionParte[] = [];
    const re =
      /\b(?:el|la|un|una)?\s*(círculo|circulo|cuadrado|cuadro)\s*(rojo|roja|verde|azul|amarillo|amarilla|blanco|blanca|negro|negra)?\s*(pequeño|pequeno|grande)?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      const tipoRaw = m[1];
      const colorRaw = m[2];
      const tamRaw = m[3];
      const tipo: "circulo" | "cuadro" =
        tipoRaw.includes("círculo") || tipoRaw.includes("circulo")
          ? "circulo"
          : "cuadro";
      const color = colorRaw ? getColor(colorRaw) : undefined;
      const tamaño = tamRaw
        ? tamRaw.includes("peque")
          ? "pequeño"
          : "grande"
        : undefined;
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
