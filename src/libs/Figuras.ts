export const figurasBase = [
  // Fila superior (figuras más grandes)
  { id: "f1", tipo: "circulo", color: "red", tamaño: "grande" },
  { id: "f2", tipo: "cuadro", color: "blue", tamaño: "grande" },
  { id: "f3", tipo: "circulo", color: "green", tamaño: "grande" },
  { id: "f4", tipo: "cuadro", color: "yellow", tamaño: "grande" },
  { id: "f5", tipo: "circulo", color: "blue", tamaño: "grande" },
  
  // Fila inferior (figuras más pequeñas)
  { id: "f6", tipo: "cuadro", color: "red", tamaño: "pequeño" },
  { id: "f7", tipo: "circulo", color: "yellow", tamaño: "pequeño" },
  { id: "f8", tipo: "cuadro", color: "green", tamaño: "pequeño" },
  { id: "f9", tipo: "circulo", color: "red", tamaño: "pequeño" },
  { id: "f10", tipo: "cuadro", color: "blue", tamaño: "pequeño" },
];

// Crear zonas específicas para cada figura (color + tipo + tamaño)
export const figurasMeta = [
  // Fila superior (zonas más grandes)
  { id: "meta-f1", tipo: "circulo", color: "red", tamaño: "grande", figuraTarget: "f1" },
  { id: "meta-f2", tipo: "cuadro", color: "blue", tamaño: "grande", figuraTarget: "f2" },
  { id: "meta-f3", tipo: "circulo", color: "green", tamaño: "grande", figuraTarget: "f3" },
  { id: "meta-f4", tipo: "cuadro", color: "yellow", tamaño: "grande", figuraTarget: "f4" },
  { id: "meta-f5", tipo: "circulo", color: "blue", tamaño: "grande", figuraTarget: "f5" },
  
  // Fila inferior (zonas más pequeñas)
  { id: "meta-f6", tipo: "cuadro", color: "red", tamaño: "pequeño", figuraTarget: "f6" },
  { id: "meta-f7", tipo: "circulo", color: "yellow", tamaño: "pequeño", figuraTarget: "f7" },
  { id: "meta-f8", tipo: "cuadro", color: "green", tamaño: "pequeño", figuraTarget: "f8" },
  { id: "meta-f9", tipo: "circulo", color: "red", tamaño: "pequeño", figuraTarget: "f9" },
  { id: "meta-f10", tipo: "cuadro", color: "blue", tamaño: "pequeño", figuraTarget: "f10" },
];
