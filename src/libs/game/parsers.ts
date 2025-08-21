// computeTodosMenosTarget y parseSiHayTargets como funciones puras

const colorMapEsToEn: Record<string, string> = {
  rojo: "red",
  verde: "green",
  azul: "blue",
  amarillo: "yellow",
  blanco: "white",
  negro: "black",
};

type Figura = {
  id: string;
  tipo: "circulo" | "cuadro";
  color: "red" | "green" | "blue" | "yellow" | "white" | "black";
  tamaño: "pequeño" | "grande";
};

export function computeTodosMenosTargetPure(
  texto: string,
  figurasEscenario: Figura[]
): Set<string> | null {
  const t = texto.toLowerCase();
  if (!t.includes("menos")) return null;
  const partesTodos = t.includes("todos los") || t.includes("todas las");
  if (!partesTodos) return null;
  const [antesRaw, despuesRaw] = t.split("menos");
  const antes = (antesRaw || "").trim();
  const despues = (despuesRaw || "").trim();

  const isCirc = antes.includes("circulo") || antes.includes("círculo");
  const isCuad = antes.includes("cuadrado") || antes.includes("cuadro");
  const isPeq = antes.includes("pequeño") || antes.includes("pequeno");
  const isGra = antes.includes("grande");

  const getColor = (s: string): string | undefined => {
    if (s.includes("rojo") || s.includes("roja")) return colorMapEsToEn.rojo;
    if (s.includes("verde")) return colorMapEsToEn.verde;
    if (s.includes("azul")) return colorMapEsToEn.azul;
    if (s.includes("amarillo") || s.includes("amarilla"))
      return colorMapEsToEn.amarillo;
    if (s.includes("blanco") || s.includes("blanca"))
      return colorMapEsToEn.blanco;
    if (s.includes("negro") || s.includes("negra"))
      return colorMapEsToEn.negro;
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

  const excluye = (f: Figura) =>
    (exColor ? f.color === exColor : false) ||
    (exCirc ? f.tipo === "circulo" : false) ||
    (exCuad ? f.tipo === "cuadro" : false) ||
    (exPeq ? f.tamaño === "pequeño" : false) ||
    (exGra ? f.tamaño === "grande" : false);

  const target = base.filter((f) => !excluye(f));
  return new Set(target.map((f) => f.id));
}

export function parseSiHayTargetsPure(
  texto: string,
  figurasEscenario: Figura[]
): { cond: Set<string>; target: Set<string> } | null {
  const t = texto.toLowerCase();
  if (!t.includes("si hay") || (!t.includes("señale") && !t.includes("toque")))
    return null;

  const idxIf = t.indexOf("si hay");
  const idxS = t.indexOf("señale");
  const idxT = t.indexOf("toque");
  const idxAction = [idxS, idxT].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? -1;
  if (idxAction < 0) return null;

  let condStr = "";
  let targetStr = "";
  if (idxIf < idxAction) {
    condStr = t.substring(idxIf + 6, idxAction).trim();
    targetStr = t.substring(idxAction).replace(/^señale\s+|^toque\s+/, "").trim();
  } else {
    targetStr = t.substring(idxAction, idxIf).replace(/^señale\s+|^toque\s+/, "").trim();
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
      if (p.includes("amarillo") || p.includes("amarilla")) return "amarillo";
      if (p.includes("blanco") || p.includes("blanca")) return "blanco";
      if (p.includes("negro") || p.includes("negra")) return "negro";
      return undefined;
    })();
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
}
