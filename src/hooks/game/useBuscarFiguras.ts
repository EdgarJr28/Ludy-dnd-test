import { useCallback } from "react";
import type { FiguraData } from "@/types/figura";

export function useBuscarFiguras(figurasEscenario: FiguraData[]) {
  return useCallback(
    (pred: (f: FiguraData) => boolean) => figurasEscenario.filter(pred),
    [figurasEscenario]
  );
}
