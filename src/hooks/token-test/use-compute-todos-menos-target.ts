import { useCallback } from "react";
import { FiguraData } from "@/types/figura";

/**
 * Helper para calcular el conjunto objetivo para consignas "todos ... menos ..."
 * @param figurasEscenario Lista de figuras del escenario
 * @returns Callback que recibe el texto de la indicación y retorna un Set de IDs objetivo
 */
export function useComputeTodosMenosTarget(figurasEscenario: FiguraData[]) {
  return useCallback(
    (texto: string) => {
      const t = texto.toLowerCase();
      if (!t.includes("menos")) return null as Set<string> | null;
      const partesTodos = t.includes("todos los") || t.includes("todas las");
      if (!partesTodos) return null;
      const [antesRaw, despuesRaw] = t.split("menos");
      const antes = (antesRaw || "").trim();
      const despues = (despuesRaw || "").trim();
      const isCirc = antes.includes("circulo") || antes.includes("círculo");
      const isCuad = antes.includes("cuadrado") || antes.includes("cuadro");
      const isPeq = antes.includes("pequeño") || antes.includes("pequeno");
      const isGra = antes.includes("grande");
      const colorEsToEn: Record<string, string> = {
        rojo: "red",
        verde: "green",
        azul: "blue",
        amarillo: "yellow",
        blanco: "white",
        negro: "black",
      };
      const getColor = (s: string): string | undefined => {
        if (s.includes("rojo") || s.includes("roja")) return "red";
        if (s.includes("verde")) return "green";
        if (s.includes("azul")) return "blue";
        if (s.includes("amarillo") || s.includes("amarilla")) return "yellow";
        if (s.includes("blanco") || s.includes("blanca")) return "white";
        if (s.includes("negro") || s.includes("negra")) return "black";
        return undefined;
      };
      let base = figurasEscenario;
      if (isCirc) base = base.filter((f) => f.tipo === "circulo");
      if (isCuad) base = base.filter((f) => f.tipo === "cuadro");
      if (isPeq) base = base.filter((f) => f.tamaño === "pequeño");
      if (isGra) base = base.filter((f) => f.tamaño === "grande");
      const exColor = getColor(despues);
      const exCirc = despues.includes("circulo") || despues.includes("círculo");
      const exCuad = despues.includes("cuadrado") || despues.includes("cuadro");
      const exPeq = despues.includes("pequeño") || despues.includes("pequeno");
      const exGra = despues.includes("grande");
  const excluye = (f: FiguraData) =>
        (exColor ? f.color === exColor : false) ||
        (exCirc ? f.tipo === "circulo" : false) ||
        (exCuad ? f.tipo === "cuadro" : false) ||
        (exPeq ? f.tamaño === "pequeño" : false) ||
        (exGra ? f.tamaño === "grande" : false);
      const target = base.filter((f) => !excluye(f));
      return new Set(target.map((f) => f.id));
    },
    [figurasEscenario]
  );
}
