import { useCallback } from "react";
import { FiguraData } from "@/types/figura";

/**
 * Hook para parsear consignas "si hay ... señale/toque ..." y devolver los conjuntos condicional y target
 * @param figurasEscenario Lista de figuras del escenario
 * @returns Callback que recibe el texto de la indicación y retorna { cond, target }
 */
export function useParseSiHayTargets(figurasEscenario: FiguraData[]) {
  return useCallback(
    (texto: string): { cond: Set<string>; target: Set<string> } | null => {
      const t = texto.toLowerCase();
      if (
        !t.includes("si hay") ||
        (!t.includes("señale") && !t.includes("toque"))
      )
        return null;
      const idxIf = t.indexOf("si hay");
      const idxS = t.indexOf("señale");
      const idxT = t.indexOf("toque");
      const idxAction =
        [idxS, idxT].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? -1;
      if (idxAction < 0) return null;
      let condStr = "";
      let targetStr = "";
      if (idxIf < idxAction) {
        condStr = t.substring(idxIf + 6, idxAction).trim();
        targetStr = t
          .substring(idxAction)
          .replace(/^señale\s+|^toque\s+/, "")
          .trim();
      } else {
        targetStr = t
          .substring(idxAction, idxIf)
          .replace(/^señale\s+|^toque\s+/, "")
          .trim();
        condStr = t.substring(idxIf + 6).trim();
      }
      const toSet = (p: string): Set<string> => {
        const isCirc = p.includes("circulo") || p.includes("círculo");
        const isCuad = p.includes("cuadrado") || p.includes("cuadro");
        const isPeq = p.includes("pequeño") || p.includes("pequeno");
        const isGra = p.includes("grande");
        const cEs = ((): string | undefined => {
          if (p.includes("rojo") || p.includes("roja")) return "rojo";
          if (p.includes("verde")) return "verde";
          if (p.includes("azul")) return "azul";
          if (p.includes("amarillo") || p.includes("amarilla"))
            return "amarillo";
          if (p.includes("blanco") || p.includes("blanca")) return "blanco";
          if (p.includes("negro") || p.includes("negra")) return "negro";
          return undefined;
        })();
        const colorMapEsToEn: Record<string, string> = {
          rojo: "red",
          verde: "green",
          azul: "blue",
          amarillo: "yellow",
          blanco: "white",
          negro: "black",
        };
        const c = cEs ? colorMapEsToEn[cEs] : undefined;
        let cand = figurasEscenario;
        if (isCirc) cand = cand.filter((f) => f.tipo === "circulo");
        if (isCuad) cand = cand.filter((f) => f.tipo === "cuadro");
        if (c) cand = cand.filter((f) => f.color === c);
        if (isPeq) cand = cand.filter((f) => f.tamaño === "pequeño");
        if (isGra) cand = cand.filter((f) => f.tamaño === "grande");
        return new Set(cand.map((f) => f.id));
      };
      return { cond: toSet(condStr), target: toSet(targetStr) };
    },
    [figurasEscenario]
  );
}
