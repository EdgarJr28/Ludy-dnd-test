import { IndicacionParte } from "@/types/indicacion";
import { analizarIndicacion } from "../indicaciones/indicaciones";
import { FiguraData } from "@/types/figura";

export function esIndicacionFactible(
  indicacion: string,
  figuras: FiguraData[]
): boolean {
  const a = analizarIndicacion(indicacion);
  const filtrar = (f: FiguraData, p: IndicacionParte) =>
    (!p.tipo || f.tipo === p.tipo) &&
    (!p.color || f.color === p.color) &&
    (!p.tamaño || f.tamaño === p.tamaño);

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
    return a.partes.every((p: IndicacionParte) => figuras.some((f) => filtrar(f, p)));
  }

  // simple
  return figuras.some((f) => filtrar(f, a.partes[0]!));
}
