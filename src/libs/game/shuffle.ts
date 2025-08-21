// Función global para mezclar arrays
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Mezcla asegurando que en cada columna (por fila de círculo y cuadro) no se repita el color
export function shuffleNoRepeatColor(figurasBase: any[]): any[] {
  const cg = figurasBase.filter(
    (f) => f.tamaño === "grande" && f.tipo === "circulo"
  );
  const qg = figurasBase.filter(
    (f) => f.tamaño === "grande" && f.tipo === "cuadro"
  );
  const cp = figurasBase.filter(
    (f) => f.tamaño === "pequeño" && f.tipo === "circulo"
  );
  const qp = figurasBase.filter(
    (f) => f.tamaño === "pequeño" && f.tipo === "cuadro"
  );
  let ok = false;
  let maxTries = 20;
  let res: any[] = [];
  while (!ok && maxTries-- > 0) {
    const scg = shuffleArray(cg);
    const sqg = shuffleArray(qg);
    ok = true;
    for (let i = 0; i < 5; i++) {
      if (scg[i].color === sqg[i].color) {
        ok = false;
        break;
      }
    }
    if (ok) {
      const scp = shuffleArray(cp);
      const sqp = shuffleArray(qp);
      res = [...scg, ...sqg, ...scp, ...sqp];
    }
  }
  if (!ok) return shuffleArray(figurasBase);
  return res;
}
