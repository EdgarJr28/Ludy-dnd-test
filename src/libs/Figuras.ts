export const figurasBase = [
  // Fila superior (figuras más grandes)
  { id: "f1", tipo: "circulo", color: "red", tamaño: "grande" },
  { id: "f2", tipo: "cuadro", color: "blue", tamaño: "grande" },
  { id: "f3", tipo: "circulo", color: "green", tamaño: "grande" },
  { id: "f4", tipo: "cuadro", color: "yellow", tamaño: "grande" },
  { id: "f5", tipo: "circulo", color: "blue", tamaño: "grande" },
  { id: "f11", tipo: "circulo", color: "white", tamaño: "grande" },
  { id: "f12", tipo: "circulo", color: "black", tamaño: "grande" },
  { id: "f13", tipo: "cuadro", color: "green", tamaño: "grande" },
  { id: "f14", tipo: "cuadro", color: "red", tamaño: "grande" },
  { id: "f15", tipo: "cuadro", color: "white", tamaño: "grande" },
  
  // Fila inferior (figuras más pequeñas)
  { id: "f6", tipo: "cuadro", color: "red", tamaño: "pequeño" },
  { id: "f7", tipo: "circulo", color: "yellow", tamaño: "pequeño" },
  { id: "f8", tipo: "cuadro", color: "green", tamaño: "pequeño" },
  { id: "f9", tipo: "circulo", color: "red", tamaño: "pequeño" },
  { id: "f10", tipo: "cuadro", color: "blue", tamaño: "pequeño" },
  { id: "f16", tipo: "circulo", color: "white", tamaño: "pequeño" },
  { id: "f17", tipo: "circulo", color: "green", tamaño: "pequeño" },
  { id: "f18", tipo: "cuadro", color: "black", tamaño: "pequeño" },
];

// Crear zonas específicas para cada figura (color + tipo + tamaño)
export const figurasMeta = [
  // Fila superior (zonas más grandes)
  { id: "meta-f1", tipo: "circulo", color: "red", tamaño: "grande", figuraTarget: "f1" },
  { id: "meta-f2", tipo: "cuadro", color: "blue", tamaño: "grande", figuraTarget: "f2" },
  { id: "meta-f3", tipo: "circulo", color: "green", tamaño: "grande", figuraTarget: "f3" },
  { id: "meta-f4", tipo: "cuadro", color: "yellow", tamaño: "grande", figuraTarget: "f4" },
  { id: "meta-f5", tipo: "circulo", color: "blue", tamaño: "grande", figuraTarget: "f5" },
  { id: "meta-f11", tipo: "circulo", color: "white", tamaño: "grande", figuraTarget: "f11" },
  { id: "meta-f12", tipo: "circulo", color: "black", tamaño: "grande", figuraTarget: "f12" },
  { id: "meta-f13", tipo: "cuadro", color: "green", tamaño: "grande", figuraTarget: "f13" },
  { id: "meta-f14", tipo: "cuadro", color: "red", tamaño: "grande", figuraTarget: "f14" },
  { id: "meta-f15", tipo: "cuadro", color: "white", tamaño: "grande", figuraTarget: "f15" },
  
  // Fila inferior (zonas más pequeñas)
  { id: "meta-f6", tipo: "cuadro", color: "red", tamaño: "pequeño", figuraTarget: "f6" },
  { id: "meta-f7", tipo: "circulo", color: "yellow", tamaño: "pequeño", figuraTarget: "f7" },
  { id: "meta-f8", tipo: "cuadro", color: "green", tamaño: "pequeño", figuraTarget: "f8" },
  { id: "meta-f9", tipo: "circulo", color: "red", tamaño: "pequeño", figuraTarget: "f9" },
  { id: "meta-f10", tipo: "cuadro", color: "blue", tamaño: "pequeño", figuraTarget: "f10" },
  { id: "meta-f16", tipo: "circulo", color: "white", tamaño: "pequeño", figuraTarget: "f16" },
  { id: "meta-f17", tipo: "circulo", color: "green", tamaño: "pequeño", figuraTarget: "f17" },
  { id: "meta-f18", tipo: "cuadro", color: "black", tamaño: "pequeño", figuraTarget: "f18" },
];
