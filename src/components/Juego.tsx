"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  rectIntersection,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import DropZona from "../components/DropZona";
import DraggableFigura from "../components/DraggableFigura";
import { figurasBase, figurasMeta } from "@/libs/Figuras";
import { fasesTest, analizarIndicacion } from "@/libs/TestPhases";
// Hook para manejar preguntas aleatorias sin repetición por fase
function useRandomNoRepeatIndicacion(faseIdx: number, total: number) {
  const [usadas, setUsadas] = React.useState<Set<number>>(new Set());
  const [lastIdx, setLastIdx] = React.useState<number | null>(null);
  // Llama para obtener un índice aleatorio no repetido
  const getNoRepeat = React.useCallback(() => {
    if (usadas.size >= total) {
      setUsadas(new Set());
      setLastIdx(null);
      return 0; // reinicia y muestra la primera
    }
    let idx = Math.floor(Math.random() * total);
    let tries = 0;
    while ((usadas.has(idx) || idx === lastIdx) && tries < 50) {
      idx = Math.floor(Math.random() * total);
      tries++;
    }
    setUsadas((prev) => new Set(prev).add(idx));
    setLastIdx(idx);
    return idx;
  }, [usadas, total, lastIdx]);
  // Resetear cuando cambia la fase
  React.useEffect(() => {
    setUsadas(new Set());
    setLastIdx(null);
  }, [faseIdx, total]);
  return getNoRepeat;
}
import FeedbackVisual from "../components/FeedbackVisual";

// Función para mezclar arrays

// Función global para mezclar arrays
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Mezcla asegurando que en cada columna (por fila de círculo y cuadro) no se repita el color
function shuffleNoRepeatColor(figurasBase: any[]): any[] {
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

export default function Juego() {
  // Para consignas mixtas: guardar tiempo de inicio de cada grupo
  const [tiempoInicioCuad, setTiempoInicioCuad] = useState<number | null>(null);
  const [tiempoFinCuad, setTiempoFinCuad] = useState<number | null>(null);
  const [tiempoInicioCirc, setTiempoInicioCirc] = useState<number | null>(null);
  // Para consignas de velocidad: guardar tiempo de inicio de la indicación
  const [tiempoInicio, setTiempoInicio] = useState<number | null>(null);
  // Hook para evitar repetición de preguntas en la fase actual
  const [figuras, setFiguras] = useState(() =>
    shuffleNoRepeatColor(figurasBase)
  );
  const [zonas, setZonas] = useState(() => shuffleArray(figurasMeta));
  // Hook para evitar repetición de preguntas en la fase actual (debe ir después de faseIdx)
  const [emparejados, setEmparejados] = useState<{ [key: string]: string }>({});
  // Emparejados es la fuente de verdad, pero cada vez que se agregue un nuevo emparejamiento correcto, también incrementamos aciertos
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [juegoCompletado, setJuegoCompletado] = useState(false);
  const [faseIdx, setFaseIdx] = useState(0);
  // Hook para evitar repetición de preguntas en la fase actual (debe ir después de faseIdx)
  const getNoRepeatIndicacion = useRandomNoRepeatIndicacion(
    faseIdx,
    fasesTest[faseIdx]?.indicaciones.length || 0
  );
  const [indicacionIdx, setIndicacionIdx] = useState(0);
  // Ya no se usa setIndicacion aleatoria, sino la del array de la fase
  const indicacion = useMemo(() => {
    const fase = fasesTest[faseIdx];
    if (!fase) return null;
    const texto = fase.indicaciones[indicacionIdx] || "";
    return { texto, idx: indicacionIdx };
  }, [faseIdx, indicacionIdx]);
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [mensajeValidacion, setMensajeValidacion] = useState<string | null>(
    null
  );
  const [feedbackTipo, setFeedbackTipo] = useState<"error" | "exito" | null>(
    null
  );
  const [zoneCenters, setZoneCenters] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});
  // Orden de apilado por zona (último llega, arriba)
  const [zoneOrder, setZoneOrder] = useState<Record<string, string[]>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const colorMap: Record<string, string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-400",
    white: "bg-white border border-gray-300",
    black: "bg-black",
  };
  const handleZoneMeasure = React.useCallback(
    (
      id: string,
      rect: { x: number; y: number; width: number; height: number }
    ) => {
      setZoneCenters((prev) => {
        const cur = prev[id];
        if (
          cur &&
          cur.x === rect.x &&
          cur.y === rect.y &&
          cur.width === rect.width &&
          cur.height === rect.height
        ) {
          return prev; // no cambio
        }
        return { ...prev, [id]: rect };
      });
    },
    []
  );

  // Construir mapa zonaId -> lista de figuras colocadas para renderizar agrupaciones
  // (lo declaramos después de definir figurasEscenario)

  // Configurar sensores para requerir movimiento antes de iniciar drag
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Requiere mover 8px antes de activar drag
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200, // Requiere mantener presionado 200ms
      tolerance: 8, // Permite 8px de movimiento durante el delay
    },
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  // Logger unificado de validación para la consola
  const logValidacion = useCallback(
    (ok: boolean, detalle?: string) => {
      const txt = indicacion?.texto || "(sin indicación)";
      const prefix = ok ? "✅" : "❌";
      console.log(
        `[VALIDACION] ${prefix} ${txt}${detalle ? ` — ${detalle}` : ""}`
      );
      if (ok) setAciertos((prev) => prev + 1);
    },
    [indicacion?.texto]
  );

  // Función para mezclar el juego
  const mezclarJuego = useCallback(() => {
    setFiguras(shuffleNoRepeatColor(figurasBase));
    setZonas(shuffleArray(figurasMeta));
    setEmparejados({});
    setIntentosFallidos(0);
    setJuegoCompletado(false);
  }, []);

  // Función para reiniciar el juego
  const reiniciarJuego = useCallback(() => {
    setFiguras(figurasBase);
    setZonas(figurasMeta);
    setEmparejados({});
    setAciertos(0);
    setIntentosFallidos(0);
    setJuegoCompletado(false);
    setFaseIdx(0);
    // Ya no se usa setIndicacion
  }, []);

  // Filtros de escenario según fase
  const faseActual = fasesTest[faseIdx];
  const { figurasEscenario, zonasEscenario } = useMemo(() => {
    const quitarPequenas = faseActual?.escenario === "sin-pequeñas";
    const figs = quitarPequenas
      ? figuras.filter((f) => f.tamaño !== "pequeño")
      : figuras;
    const zs = quitarPequenas
      ? zonas.filter((z) => z.tamaño !== "pequeño")
      : zonas;
    return { figurasEscenario: figs, zonasEscenario: zs };
  }, [faseActual?.escenario, figuras, zonas]);

  // Figura activa para overlay mientras se arrastra
  const activeFigura = useMemo(
    () =>
      draggingId
        ? figurasEscenario.find((f) => f.id === draggingId) || null
        : null,
    [draggingId, figurasEscenario]
  );

  // Construir mapa zonaId -> figuras agrupadas (después de conocer figurasEscenario)
  const figurasPorZona = useMemo(() => {
    const map: Record<
      string,
      Array<{ id: string; tipo: string; color: string; tamaño: string }>
    > = {};
    for (const [fid, zid] of Object.entries(emparejados)) {
      const f = figurasEscenario.find((ff) => ff.id === fid);
      if (!f) continue;
      if (!map[zid]) map[zid] = [];
      map[zid].push({
        id: f.id,
        tipo: f.tipo,
        color: f.color,
        tamaño: f.tamaño,
      });
    }
    return map;
  }, [emparejados, figurasEscenario]);

  // Inicializar indicación si falta
  React.useEffect(() => {
    setTiempoInicioCuad(null);
    setTiempoFinCuad(null);
    setTiempoInicioCirc(null);
    // Ya no se usa setIndicacion
    // limpiar emparejamientos al cambiar de fase para mantener el mismo escenario pero sin estado previo
    setEmparejados({});
    setZoneOrder({});
    setIntentosFallidos(0);
    setJuegoCompletado(false);
    setSeleccion([]);
    setMensajeValidacion(null);
    setAciertos(0);
    setTiempoInicio(Date.now()); // Reiniciar tiempo al cambiar de fase
  }, [faseIdx]);

  // Reiniciar tiempo al cambiar de indicación
  React.useEffect(() => {
    setTiempoInicio(Date.now());
  }, [indicacionIdx]);

  // sin modal, iniciación implícita al cambiar fase o al avanzar de indicación

  // Helpers de búsqueda según atributos
  type Figura = (typeof figurasBase)[number];
  const buscarFiguras = useCallback(
    (pred: (f: Figura) => boolean) => figurasEscenario.filter(pred),
    [figurasEscenario]
  );

  // Parser básico para instrucciones “Señale …” compatibles
  const validarSeleccion = useCallback(() => {
    // Validación especial para consignas de velocidad
    const texto = indicacion?.texto.toLowerCase() || "";
    // Consigna mixta: "Señale todos los cuadrados lentamente y los círculos rápidamente"
    const esMixta =
      texto.includes("cuadrados") &&
      texto.includes("lenta") &&
      texto.includes("circulos") &&
      texto.includes("rápid");
    if (esMixta) {
      const cuadrados = figurasEscenario.filter((f) => f.tipo === "cuadro");
      const circulos = figurasEscenario.filter((f) => f.tipo === "circulo");
      const seleccionSet = new Set(seleccion);
      const selCuad = cuadrados.filter((f) => seleccionSet.has(f.id));
      const selCirc = circulos.filter((f) => seleccionSet.has(f.id));
      // Si empieza a seleccionar cuadrados, guardar tiempo de inicio
      if (selCuad.length === 1 && !tiempoInicioCuad)
        setTiempoInicioCuad(Date.now());
      // Si termina de seleccionar cuadrados, guardar tiempo de fin y tiempo de inicio de círculos
      if (selCuad.length === cuadrados.length && !tiempoFinCuad) {
        setTiempoFinCuad(Date.now());
        setTiempoInicioCirc(Date.now());
      }
      // Si empieza a seleccionar círculos, guardar tiempo de inicio si no se ha guardado
      if (selCirc.length === 1 && !tiempoInicioCirc && tiempoFinCuad)
        setTiempoInicioCirc(Date.now());
      // Solo validar si ambos grupos están completos
      if (
        selCuad.length === cuadrados.length &&
        selCirc.length === circulos.length &&
        tiempoInicioCuad &&
        tiempoFinCuad &&
        tiempoInicioCirc
      ) {
        const deltaCuad = (tiempoFinCuad - tiempoInicioCuad) / 1000;
        const deltaCirc = (Date.now() - tiempoInicioCirc) / 1000;
        let ok = false;
        let msg = "";
        // Validar todos los casos
        if (deltaCuad >= 4 && deltaCirc <= 2) {
          ok = true;
          msg = `✅ Correcto (cuadrados lento: ${deltaCuad.toFixed(
            2
          )}s, círculos rápido: ${deltaCirc.toFixed(2)}s)`;
          setAciertos((prev) => prev + 1);
        } else {
          if (deltaCuad < 4 && deltaCirc > 2) {
            msg = `❌ Cuadrados demasiado rápido (${deltaCuad.toFixed(
              2
            )}s) | ❌ Círculos demasiado lento (${deltaCirc.toFixed(2)}s)`;
          } else if (deltaCuad < 4) {
            msg = `❌ Cuadrados demasiado rápido (${deltaCuad.toFixed(2)}s)`;
          } else if (deltaCirc > 2) {
            msg = `❌ Círculos demasiado lento (${deltaCirc.toFixed(2)}s)`;
          }
          setIntentosFallidos((prev) => prev + 1);
        }
        setMensajeValidacion(msg);
        setFeedbackTipo(ok ? "exito" : "error");
        setTimeout(
          () => {
            setFeedbackTipo(null);
            if (ok) {
              if (indicacionIdx + 1 >= fasesTest[faseIdx].indicaciones.length) {
                setFaseIdx((prev) => prev + 1);
                setIndicacionIdx(0);
              } else {
                setIndicacionIdx((prev) => prev + 1);
              }
              setSeleccion([]);
              setTiempoInicioCuad(null);
              setTiempoFinCuad(null);
              setTiempoInicioCirc(null);
              setTiempoInicio(Date.now());
            }
          },
          ok ? 1000 : 1200
        );
      }
      return;
    }
    // Consignas simples de velocidad
    const isRapido =
      texto.includes("rápid") ||
      texto.includes("rapido") ||
      texto.includes("rápidamente") ||
      texto.includes("rapidamente");
    const isLento = texto.includes("lenta") || texto.includes("lentamente");
    const esTodosCuadrados =
      texto.includes("todos los cuadrados") ||
      texto.includes("todos los cuadros");
    const esTodosCirculos =
      texto.includes("todos los circulos") ||
      texto.includes("todos los círculos");
    if ((isRapido || isLento) && (esTodosCuadrados || esTodosCirculos)) {
      // Determinar el tipo
      const tipo = esTodosCuadrados ? "cuadro" : "circulo";
      const candidatos = figurasEscenario.filter((f) => f.tipo === tipo);
      const seleccionSet = new Set(seleccion);
      const selFig = figurasEscenario.filter((f) => seleccionSet.has(f.id));
      // Si seleccionó todos los del tipo
      if (
        selFig.length === candidatos.length &&
        selFig.every((f) => f.tipo === tipo)
      ) {
        const tiempoFin = Date.now();
        const delta = tiempoInicio ? (tiempoFin - tiempoInicio) / 1000 : null;
        let ok = false;
        let msg = "";
        if (isRapido && delta !== null && delta <= 2) {
          ok = true;
          msg = `✅ Correcto (rápido: ${delta.toFixed(2)}s)`;
        } else if (isLento && delta !== null && delta >= 4) {
          ok = true;
          msg = `✅ Correcto (lento: ${delta.toFixed(2)}s)`;
        } else if (delta !== null) {
          msg = isRapido
            ? `❌ Demasiado lento (${delta.toFixed(2)}s)`
            : `❌ Demasiado rápido (${delta.toFixed(2)}s)`;
        } else {
          msg = "❌ No se pudo medir el tiempo";
        }
        setMensajeValidacion(msg);
        setFeedbackTipo(ok ? "exito" : "error");
        if (ok) {
          setTimeout(() => {
            setFeedbackTipo(null);
            if (indicacionIdx + 1 >= fasesTest[faseIdx].indicaciones.length) {
              setFaseIdx((prev) => prev + 1);
              setIndicacionIdx(0);
            } else {
              setIndicacionIdx((prev) => prev + 1);
            }
            setSeleccion([]);
            setTiempoInicio(Date.now());
          }, 1000);
        } else {
          setTimeout(() => setFeedbackTipo(null), 1200);
        }
      }
      return;
    }
    if (!indicacion) return false;
    // (Eliminada la redeclaración de 'texto')

    // Normalizar términos
    const termCirculo = texto.includes("circulo") || texto.includes("círculo");
    const termCuadrado = texto.includes("cuadrado") || texto.includes("cuadro");
    const termPequeno = texto.includes("pequeño") || texto.includes("pequeno");
    const termGrande = texto.includes("grande");
    const colores: Record<string, boolean> = {
      rojo: texto.includes("rojo") || texto.includes("roja"),
      verde: texto.includes("verde"),
      azul: texto.includes("azul"),
      amarillo: texto.includes("amarillo") || texto.includes("amarilla"),
      blanco: texto.includes("blanco") || texto.includes("blanca"),
      negro: texto.includes("negro") || texto.includes("negra"),
    };

    const tipo: "circulo" | "cuadro" | null = termCirculo
      ? "circulo"
      : termCuadrado
      ? "cuadro"
      : null;
    const tamaño: "pequeño" | "grande" | null = termPequeno
      ? "pequeño"
      : termGrande
      ? "grande"
      : null;

    const colorClave = Object.keys(colores).find((c) => colores[c]);
    const colorMapEsToEn: Record<string, string> = {
      rojo: "red",
      verde: "green",
      azul: "blue",
      amarillo: "yellow",
      blanco: "white",
      negro: "black",
    };
    const color = colorClave ? colorMapEsToEn[colorClave] : null;

    // Construir el conjunto esperado según palabras clave
    let candidatos = buscarFiguras(() => true);
    if (tipo) candidatos = candidatos.filter((f) => f.tipo === tipo);
    if (color) candidatos = candidatos.filter((f) => f.color === color);
    if (tamaño) candidatos = candidatos.filter((f) => f.tamaño === tamaño);

    // manejar instrucciones con “y” (dos elementos)
    const esCompuestaY = texto.includes(" y ");
    const esCompuestaO = texto.includes(" o ");
    const esCon = texto.includes(" con ");
    const esTodos = texto.includes("todos los");
    const esUn =
      texto.includes("un ") || (texto.startsWith("señale ") && !esTodos);

    const seleccionSet = new Set(seleccion);
    const seleccionFiguras = figurasEscenario.filter((f) =>
      seleccionSet.has(f.id)
    );

    // Casos “todos los cuadrados/círculos …”
    if (esTodos) {
      // determinar el grupo target
      let target = buscarFiguras(() => true);
      if (termCirculo) target = target.filter((f) => f.tipo === "circulo");
      if (termCuadrado) target = target.filter((f) => f.tipo === "cuadro");
      if (color) target = target.filter((f) => f.color === color);
      if (tamaño) target = target.filter((f) => f.tamaño === tamaño);

      const targetIds = new Set(target.map((f) => f.id));
      const selIds = new Set(seleccion);
      const ok =
        targetIds.size > 0 &&
        targetIds.size === selIds.size &&
        [...targetIds].every((id) => selIds.has(id));
      setMensajeValidacion(ok ? "✅ Correcto" : "❌ Selección incorrecta");
      if (ok) setAciertos((prev) => prev + 1);
      else setIntentosFallidos((prev) => prev + 1);
      return ok;
    }

    // Casos con "con" (pares), ej: "toque el circulo negro con el cuadrado rojo" o "señale ... con ..."
    if (esCon) {
      const partes = texto.split(" con ");
      const validarParte = (parte: string): Figura[] => {
        const p = parte;
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
        const c = cEs ? colorMapEsToEn[cEs] : undefined;
        let cand = buscarFiguras(() => true);
        if (isCirc) cand = cand.filter((f) => f.tipo === "circulo");
        if (isCuad) cand = cand.filter((f) => f.tipo === "cuadro");
        if (c) cand = cand.filter((f) => f.color === c);
        if (isPeq) cand = cand.filter((f) => f.tamaño === "pequeño");
        if (isGra) cand = cand.filter((f) => f.tamaño === "grande");
        return cand;
      };
      const setTargets = partes
        .map(validarParte)
        .map((arr) => new Set(arr.map((f) => f.id)));
      const selIds = new Set(seleccion);
      // Debe haber exactamente 2 selecciones y una debe pertenecer a cada conjunto
      const ok =
        seleccionFiguras.length === Math.min(2, setTargets.length) &&
        setTargets.every((s) => [...selIds].some((id) => s.has(id)));
      setMensajeValidacion(ok ? "✅ Correcto" : "❌ Selección incorrecta");
      if (ok) setAciertos((prev) => prev + 1);
      else setIntentosFallidos((prev) => prev + 1);
      return ok;
    }

    // Casos “A y B” / “A o B”: estrategia simple separando por conjunción
    if (esCompuestaY || esCompuestaO) {
      // Split por conjunción principal (priorizamos ' y ')
      const partes = texto.split(esCompuestaY ? " y " : " o ");
      const validarParte = (parte: string): Figura[] => {
        const p = parte;
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
        const c = cEs ? colorMapEsToEn[cEs] : undefined;
        let cand = buscarFiguras(() => true);
        if (isCirc) cand = cand.filter((f) => f.tipo === "circulo");
        if (isCuad) cand = cand.filter((f) => f.tipo === "cuadro");
        if (c) cand = cand.filter((f) => f.color === c);
        if (isPeq) cand = cand.filter((f) => f.tamaño === "pequeño");
        if (isGra) cand = cand.filter((f) => f.tamaño === "grande");
        return cand;
      };
      const setTargets = partes
        .map(validarParte)
        .map((arr) => new Set(arr.map((f) => f.id)));
      const selIds = new Set(seleccion);
      let ok = false;
      if (esCompuestaY) {
        // Debe contener al menos uno de cada conjunto
        ok =
          setTargets.every((s) => [...selIds].some((id) => s.has(id))) &&
          seleccionFiguras.length === setTargets.length;
      } else {
        // Debe contener uno de alguno de los conjuntos (exactamente uno seleccionado)
        ok =
          setTargets.some((s) => [...selIds].some((id) => s.has(id))) &&
          seleccionFiguras.length === 1;
      }
      setMensajeValidacion(ok ? "✅ Correcto" : "❌ Selección incorrecta");
      if (ok) setAciertos((prev) => prev + 1);
      else setIntentosFallidos((prev) => prev + 1);
      return ok;
    }

    // Caso base “Señale …” (uno)
    if (esUn || tipo || color || tamaño) {
      const ok =
        seleccionFiguras.length === 1 &&
        candidatos.some((c) => c.id === seleccionFiguras[0].id);
      setMensajeValidacion(ok ? "✅ Correcto" : "❌ Selección incorrecta");
      if (ok) setAciertos((prev) => prev + 1);
      else setIntentosFallidos((prev) => prev + 1);
      return ok;
    }

    // No soportado (acciones espaciales/tiempo): por ahora marcar como no validable
    setMensajeValidacion(
      "ℹ Indicación informativa (no validada automáticamente)"
    );
    return true;
  }, [
    indicacion,
    figurasEscenario,
    seleccion,
    buscarFiguras,
    setIntentosFallidos,
  ]);

  // validación manual ya no es necesaria sin modal

  // Helper: calcular el conjunto objetivo para consignas "todos ... menos ..."
  const computeTodosMenosTarget = useCallback(
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
        if (s.includes("rojo") || s.includes("roja")) return colorEsToEn.rojo;
        if (s.includes("verde")) return colorEsToEn.verde;
        if (s.includes("azul")) return colorEsToEn.azul;
        if (s.includes("amarillo") || s.includes("amarilla"))
          return colorEsToEn.amarillo;
        if (s.includes("blanco") || s.includes("blanca"))
          return colorEsToEn.blanco;
        if (s.includes("negro") || s.includes("negra"))
          return colorEsToEn.negro;
        return undefined;
      };
      let base = figurasEscenario as typeof figurasBase;
      if (isCirc) base = base.filter((f) => f.tipo === "circulo");
      if (isCuad) base = base.filter((f) => f.tipo === "cuadro");
      if (isPeq) base = base.filter((f) => f.tamaño === "pequeño");
      if (isGra) base = base.filter((f) => f.tamaño === "grande");
      const exColor = getColor(despues);
      const exCirc = despues.includes("circulo") || despues.includes("círculo");
      const exCuad = despues.includes("cuadrado") || despues.includes("cuadro");
      const exPeq = despues.includes("pequeño") || despues.includes("pequeno");
      const exGra = despues.includes("grande");
      const excluye = (f: (typeof figurasBase)[number]) =>
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

  // Helper: parsear "si hay … señale/toque …" y devolver conjuntos cond/target del escenario
  const parseSiHayTargets = useCallback(
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
        let cand = figurasEscenario as typeof figurasBase;
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

  // Validación en vivo al cambiar la selección
  React.useEffect(() => {
    if (!indicacion) return;
    const texto = indicacion.texto.toLowerCase();

    // Caso especial: "todos ... menos ..." => permitir múltiples selecciones sin error, solo éxito al coincidir exactamente
    if (texto.includes("menos")) {
      const target = computeTodosMenosTarget(texto);
      if (!target) return;
      const sel = new Set(seleccion);
      const exact =
        sel.size === target.size && [...target].every((id) => sel.has(id));
      if (exact) {
        logValidacion(true);
        setMensajeValidacion("✅ Correcto");
        setFeedbackTipo("exito");
        setTimeout(() => {
          setFeedbackTipo(null);
          // Al cambiar de fase, reiniciar el índice de indicación y limpiar estados
          setIndicacionIdx(0);
          setSeleccion([]);
        }, 800);
      }
      return; // no mostrar errores parciales
    }

    // Condicional: "si hay X señale/toque Y" => exigir Y solo si existe X; si no, auto-skip
    if (
      texto.includes("si hay") &&
      (texto.includes("señale") || texto.includes("toque"))
    ) {
      const parsed = parseSiHayTargets(texto);
      if (parsed) {
        const { cond, target } = parsed;
        const sel = new Set(seleccion);
        if (cond.size === 0) {
          setMensajeValidacion("ℹ No aplica");
          setTimeout(() => {
            // Ya no se usa setIndicacion, el avance de indicacion se controla con setIndicacionIdx y setFaseIdx
            setSeleccion([]);
          }, 600);
          return;
        }
        if (sel.size > 1) {
          setMensajeValidacion("❌ Selección incorrecta");
          setFeedbackTipo("error");
          setIntentosFallidos((prev) => prev + 1);
          setSeleccion([]);
          setTimeout(() => setFeedbackTipo(null), 800);
          return;
        }
        if (sel.size === 1) {
          const only = [...sel][0]!;
          if (target.has(only)) {
            logValidacion(true);
            setMensajeValidacion("✅ Correcto");
            setFeedbackTipo("exito");
            setTimeout(() => {
              setFeedbackTipo(null);
              // Avanzar a la siguiente indicación o fase
              if (indicacionIdx + 1 >= fasesTest[faseIdx].indicaciones.length) {
                setFaseIdx((prev) => prev + 1);
                setIndicacionIdx(0);
              } else {
                setIndicacionIdx((prev) => prev + 1);
              }
              setSeleccion([]);
            }, 800);
          } else {
            setMensajeValidacion("❌ Selección incorrecta");
            setFeedbackTipo("error");
            setIntentosFallidos((prev) => prev + 1);
            setSeleccion([]);
            setTimeout(() => setFeedbackTipo(null), 800);
          }
          return;
        }
        return; // sin selección aún
      }
    }

    // Reutilizamos parte de la lógica de parsing para decidir feedback inmediato
    const termCirculo = texto.includes("circulo") || texto.includes("círculo");
    const termCuadrado = texto.includes("cuadrado") || texto.includes("cuadro");
    const termPequeno = texto.includes("pequeño") || texto.includes("pequeno");
    const termGrande = texto.includes("grande");
    const colores: Record<string, boolean> = {
      rojo: texto.includes("rojo") || texto.includes("roja"),
      verde: texto.includes("verde"),
      azul: texto.includes("azul"),
      amarillo: texto.includes("amarillo") || texto.includes("amarilla"),
      blanco: texto.includes("blanco") || texto.includes("blanca"),
      negro: texto.includes("negro") || texto.includes("negra"),
    };
    const tipo: "circulo" | "cuadro" | null = termCirculo
      ? "circulo"
      : termCuadrado
      ? "cuadro"
      : null;
    const tamaño: "pequeño" | "grande" | null = termPequeno
      ? "pequeño"
      : termGrande
      ? "grande"
      : null;
    const colorClave = Object.keys(colores).find((c) => colores[c]);
    const colorMapEsToEn: Record<string, string> = {
      rojo: "red",
      verde: "green",
      azul: "blue",
      amarillo: "yellow",
      blanco: "white",
      negro: "black",
    };
    const color = colorClave ? colorMapEsToEn[colorClave] : null;
    const esCompuestaY = texto.includes(" y ");
    const esCompuestaO = texto.includes(" o ");
    const esCon = texto.includes(" con ");
    const esTodos = texto.includes("todos los");

    const seleccionSet = new Set(seleccion);
    const selFig = figurasEscenario.filter((f) => seleccionSet.has(f.id));

    const err = (msg?: string) => {
      logValidacion(false);
      setMensajeValidacion(msg || "❌ Selección incorrecta");
      setFeedbackTipo("error");
      setIntentosFallidos((prev) => prev + 1);
      setSeleccion([]);
      setTimeout(() => setFeedbackTipo(null), 1000);
    };
    const ok = () => {
      logValidacion(true);
      setMensajeValidacion("✅ Correcto");
      setFeedbackTipo("exito");
      // Avanzar automáticamente a la siguiente indicación
      setTimeout(() => {
        setFeedbackTipo(null);
        // Avanzar a la siguiente indicación o fase
        if (indicacionIdx + 1 >= fasesTest[faseIdx].indicaciones.length) {
          // Si es la última indicación de la fase, pasar a la siguiente fase
          setFaseIdx((prev) => prev + 1);
          setIndicacionIdx(0);
        } else {
          setIndicacionIdx((prev) => prev + 1);
        }
        setSeleccion([]);
      }, 800);
    };

    // No validar en vivo para indicaciones complejas no soportadas
    const isCompleja = [
      "sobre",
      "junto",
      "lejos",
      "entre",
      "menos",
      "además",
      "en lugar",
      "coloque",
      "ponga",
      "rápid",
      "lenta",
    ].some((t) => texto.includes(t));
    if (isCompleja) return;

    // Construir candidatos
    let candidatos = figurasEscenario;
    if (tipo) candidatos = candidatos.filter((f) => f.tipo === tipo);
    if (color) candidatos = candidatos.filter((f) => f.color === color);
    if (tamaño) candidatos = candidatos.filter((f) => f.tamaño === tamaño);

    // "todos los ..."
    if (esTodos) {
      const targetIds = new Set(candidatos.map((f) => f.id));
      // Si selecciona algo fuera del conjunto, error inmediato
      if (selFig.some((f) => !targetIds.has(f.id))) return err();
      // Si coincide exactamente, éxito
      if (
        selFig.length > 0 &&
        selFig.length === targetIds.size &&
        selFig.every((f) => targetIds.has(f.id))
      )
        return ok();
      // parcial: sin feedback
      return;
    }

    // con (pares): exactamente 2, una de cada parte
    if (esCon) {
      const partes = texto.split(" con ");
      const mapParte = (p: string) => {
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
        const c = cEs ? colorMapEsToEn[cEs] : undefined;
        let cand = figurasEscenario;
        if (isCirc) cand = cand.filter((f) => f.tipo === "circulo");
        if (isCuad) cand = cand.filter((f) => f.tipo === "cuadro");
        if (c) cand = cand.filter((f) => f.color === c);
        if (isPeq) cand = cand.filter((f) => f.tamaño === "pequeño");
        if (isGra) cand = cand.filter((f) => f.tamaño === "grande");
        return new Set(cand.map((f) => f.id));
      };
      const sets = partes.map(mapParte);
      const selIds = selFig.map((f) => f.id);

      if (selIds.length > 2) return err();
      // Si alguno no pertenece a ninguna parte, error
      if (selIds.some((id) => !sets.some((s) => s.has(id)))) return err();
      // Éxito cuando hay 1 de cada parte
      const cumpleCada = sets.every((s) => selIds.some((id) => s.has(id)));
      if (cumpleCada && selIds.length === Math.min(2, sets.length)) return ok();
      return; // parcial
    }

    // compuesta con "y" / "o"
    if (esCompuestaY || esCompuestaO) {
      const partes = texto.split(esCompuestaY ? " y " : " o ");
      const mapParte = (p: string) => {
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
        const c = cEs ? colorMapEsToEn[cEs] : undefined;
        let cand = figurasEscenario;
        if (isCirc) cand = cand.filter((f) => f.tipo === "circulo");
        if (isCuad) cand = cand.filter((f) => f.tipo === "cuadro");
        if (c) cand = cand.filter((f) => f.color === c);
        if (isPeq) cand = cand.filter((f) => f.tamaño === "pequeño");
        if (isGra) cand = cand.filter((f) => f.tamaño === "grande");
        return new Set(cand.map((f) => f.id));
      };
      const sets = partes.map(mapParte);
      const selIds = selFig.map((f) => f.id);

      // Reglas en vivo
      if (esCompuestaY) {
        if (selIds.length > sets.length) return err();
        // Si alguno no pertenece a ninguna parte, error
        if (selIds.some((id) => !sets.some((s) => s.has(id)))) return err();
        // Éxito cuando hay 1 de cada parte
        const cumpleCada = sets.every((s) => selIds.some((id) => s.has(id)));
        if (cumpleCada && selIds.length === sets.length) return ok();
        return; // parcial
      } else {
        if (selIds.length > 1) return err();
        if (selIds.length === 1) {
          if (sets.some((s) => s.has(selIds[0]!))) return ok();
          return err();
        }
        return; // sin selección aún
      }
    }

    // simple: permitir solo 1
    if (selFig.length > 1) return err();
    if (selFig.length === 1) {
      if (candidatos.some((c) => c.id === selFig[0].id)) return ok();
      return err();
    }
  }, [
    seleccion,
    indicacion,
    figurasEscenario,
    faseIdx,
    computeTodosMenosTarget,
    parseSiHayTargets,
    logValidacion,
  ]);

  // Calcular límite esperado de selección según la indicación actual
  const expectedLimit = useMemo(() => {
    if (!indicacion) return null as number | null;
    const texto = indicacion.texto.toLowerCase();
    // Límite dinámico para "todos ... menos ...": tamaño del objetivo
    if (texto.includes("menos")) {
      const set = computeTodosMenosTarget(texto);
      if (set && set.size > 0) return set.size;
      return null;
    }
    // Condicional: si hay X señale/toque Y -> si existe X, límite 1; si no, sin límite (auto-skip)
    if (
      texto.includes("si hay") &&
      (texto.includes("señale") || texto.includes("toque"))
    ) {
      const parsed = parseSiHayTargets(texto);
      if (parsed && parsed.cond.size > 0) return 1;
      return null;
    }
    const esCompuestaY = texto.includes(" y ");
    const esCompuestaO = texto.includes(" o ");
    const esCon = texto.includes(" con ");
    const esTodos = texto.includes("todos los") || texto.includes("todas las");

    if (esCompuestaY) return texto.split(" y ").length; // número de partes
    if (esCompuestaO) return 1;
    if (esCon) return 2;

    // Singular determinantes
    if (/(\bun\b|\buna\b|\bel\b|\bla\b)/.test(texto)) return 1;

    // Todos los ... -> tamaño del conjunto objetivo
    if (esTodos) {
      // Reusar lógica básica para determinar conjunto
      const termCirculo =
        texto.includes("circulo") || texto.includes("círculo");
      const termCuadrado =
        texto.includes("cuadrado") || texto.includes("cuadro");
      const termPequeno =
        texto.includes("pequeño") || texto.includes("pequeno");
      const termGrande = texto.includes("grande");
      const colores: Record<string, boolean> = {
        rojo: texto.includes("rojo") || texto.includes("roja"),
        verde: texto.includes("verde"),
        azul: texto.includes("azul"),
        amarillo: texto.includes("amarillo") || texto.includes("amarilla"),
        blanco: texto.includes("blanco") || texto.includes("blanca"),
        negro: texto.includes("negro") || texto.includes("negra"),
      };
      const colorMapEsToEn: Record<string, string> = {
        rojo: "red",
        verde: "green",
        azul: "blue",
        amarillo: "yellow",
        blanco: "white",
        negro: "black",
      };
      const tipo: "circulo" | "cuadro" | null = termCirculo
        ? "circulo"
        : termCuadrado
        ? "cuadro"
        : null;
      const tamaño: "pequeño" | "grande" | null = termPequeno
        ? "pequeño"
        : termGrande
        ? "grande"
        : null;
      const colorClave = Object.keys(colores).find((c) => colores[c]);
      const color = colorClave ? colorMapEsToEn[colorClave] : null;
      let cand = figurasEscenario;
      if (tipo) cand = cand.filter((f) => f.tipo === tipo);
      if (color) cand = cand.filter((f) => f.color === color);
      if (tamaño) cand = cand.filter((f) => f.tamaño === tamaño);
      return Math.max(1, cand.length);
    }

    return null; // sin límite rígido
  }, [
    indicacion,
    figurasEscenario,
    computeTodosMenosTarget,
    parseSiHayTargets,
  ]);

  // Mostrar zonas DnD solo cuando la indicación requiere movimiento (coloque/ponga)
  const showDropZones = useMemo(() => {
    const t = indicacion?.texto.toLowerCase() || "";
    return t.includes("coloque") || t.includes("ponga");
  }, [indicacion]);

  // Modo overlay visual para consignas con "sobre"
  const overlayMode = useMemo(() => {
    const t = indicacion?.texto.toLowerCase() || "";
    return t.includes("sobre");
  }, [indicacion]);

  // Para consignas de posición/movimiento: pre-colocar todas las figuras en sus zonas correspondientes
  React.useEffect(() => {
    if (showDropZones) {
      // Si aún no están todas colocadas, inicializar emparejamientos por coincidencia exacta
      const currentCount = Object.keys(emparejados).length;
      const targetCount = figurasEscenario.length;
      if (currentCount < targetCount) {
        const nuevo: { [key: string]: string } = {};
        const order: Record<string, string[]> = {};
        for (const f of figurasEscenario) {
          const z = zonasEscenario.find(
            (zz) =>
              zz.tipo === f.tipo &&
              zz.color === f.color &&
              zz.tamaño === f.tamaño
          );
          if (z) nuevo[f.id] = z.id;
          if (z) {
            if (!order[z.id]) order[z.id] = [];
            order[z.id]!.push(f.id);
          }
        }
        setEmparejados(nuevo);
        setZoneOrder(order);
      }
    } else {
      // En modo selección (sin zonas), liberar las figuras para que aparezcan abajo
      if (Object.keys(emparejados).length > 0) setEmparejados({});
      if (Object.keys(zoneOrder).length > 0) setZoneOrder({});
    }
  }, [showDropZones, figurasEscenario, zonasEscenario]);

  // Handler de selección con límite esperado
  const handleSelect = useCallback(
    (id: string) => {
      setSeleccion((prev) => {
        const has = prev.includes(id);
        if (has) return prev.filter((x) => x !== id);
        const t = indicacion?.texto.toLowerCase() || "";
        const esTodosMenos = t.includes("menos");
        const esMixtaVelocidad =
          t.includes("cuadrados") &&
          t.includes("lenta") &&
          t.includes("circulos") &&
          t.includes("rápid");
        // Validación inmediata para consignas mixtas de velocidad (secuencia: primero cuadrados, luego círculos)
        if (esMixtaVelocidad) {
          const figura = figurasEscenario.find((f) => f.id === id);
          if (!figura) return prev;
          const cuadrados = figurasEscenario.filter((f) => f.tipo === "cuadro");
          const circulos = figurasEscenario.filter((f) => f.tipo === "circulo");
          const selCuad = prev.filter((pid) =>
            cuadrados.some((c) => c.id === pid)
          );
          const selCirc = prev.filter((pid) =>
            circulos.some((c) => c.id === pid)
          );
          // Solo permitir seleccionar círculos después de terminar con los cuadrados
          console.log(selCuad.length, cuadrados.length);
          if (figura.tipo === "circulo" && selCuad.length < cuadrados.length) {
            setMensajeValidacion("Primero selecciona todos los cuadrados");
            setFeedbackTipo("error");
            setTimeout(() => setFeedbackTipo(null), 1000);
            return prev;
          }
          // Cuadrados: deben ser lentos (>=4s entre el primero y el último)
          if (figura.tipo === "cuadro") {
            if (selCuad.length === 0) {
              setTiempoInicioCuad(Date.now());
            } else {
              if (selCuad.length + 1 === cuadrados.length && tiempoInicioCuad) {
                const delta = (Date.now() - tiempoInicioCuad) / 1000;
                if (delta < 8) {
                  setMensajeValidacion(
                    `❌ Cuadrados demasiado rápido (${delta.toFixed(2)}s)`
                  );
                  setFeedbackTipo("error");
                  setIntentosFallidos((f) => f + 1);
                  setTimeout(() => setFeedbackTipo(null), 1000);
                  setSeleccion([]);
                  setTiempoInicioCuad(null);
                  setTiempoFinCuad(null);
                  setTiempoInicioCirc(null);
                  setTiempoInicio(Date.now());
                  return [];
                } else {
                  console.log("Todo correcto");
                  setTiempoFinCuad(Date.now());
                  setTiempoInicioCirc(Date.now());
                }
              }
            }
          }
          // Círculos: deben ser rápidos (<=2s entre el primero y el último)
          if (figura.tipo === "circulo") {
            if (selCirc.length === 0) {
              setTiempoInicioCirc(Date.now());
            } else {
              if (selCirc.length + 1 === circulos.length && tiempoInicioCirc) {
                const delta = (Date.now() - tiempoInicioCirc) / 1000;
                if (delta > 5) {
                  setMensajeValidacion(
                    `❌ Círculos demasiado lento (${delta.toFixed(2)}s)`
                  );
                  setFeedbackTipo("error");
                  setIntentosFallidos((f) => f + 1);
                  setTimeout(() => setFeedbackTipo(null), 1000);
                  setSeleccion([]);
                  setTiempoInicioCuad(null);
                  setTiempoFinCuad(null);
                  setTiempoInicioCirc(null);
                  setTiempoInicio(Date.now());
                  return [];
                }
              }
            }
          }
        }
        if (
          !esTodosMenos &&
          !esMixtaVelocidad &&
          expectedLimit != null &&
          prev.length >= expectedLimit
        ) {
          // no permitir más de N selecciones
          setMensajeValidacion(`Límite de selección: ${expectedLimit}`);
          setFeedbackTipo("error");
          setIntentosFallidos((prevFail) => prevFail + 1);
          setTimeout(() => setFeedbackTipo(null), 600);
          return [];
        }
        if (prev.length + 1 === figurasEscenario.length) {
          setMensajeValidacion(
            "✅ ¡Todas las figuras seleccionadas correctamente!"
          );
          setFeedbackTipo("exito");
          setAciertos((a) => a + 1);
          setTimeout(() => setFeedbackTipo(null), 1000);
          setSeleccion([]);
          // Aquí puedes avanzar de indicación/fase si lo deseas
          return [];
        }
        return [...prev, id];
      });
    },
    [
      expectedLimit,
      indicacion?.texto,
      figurasEscenario,
      tiempoInicioCuad,
      tiempoInicioCirc,
    ]
  );

  const handleDragStart = (event: import("@dnd-kit/core").DragStartEvent) => {
    const { active } = event;
    if (!active) return;
    const fid = String(active.id);
    setDraggingId(fid);
    // Si ya está en una zona, súbelo al tope visual inmediatamente
    const zId = emparejados[fid];
    if (zId) {
      setZoneOrder((prev) => {
        const cur = prev[zId] || [];
        const without = cur.filter((id) => id !== fid);
        return { ...prev, [zId]: [...without, fid] };
      });
    }
  };

  // Estado para reducir ruido de logs en validación en vivo
  const liveLogRef = React.useRef<{
    overId: string | null;
    status: boolean | null;
  }>({ overId: null, status: null });

  // Helper: valida "entre" contra un mapeo dado sin efectos secundarios
  const checkEntreWithMapping = useCallback(
    (
      map: Record<string, string>,
      figuraA: (typeof figurasBase)[number] | undefined
    ) => {
      if (!indicacion) return { handled: false, ok: false };
      const a = analizarIndicacion(indicacion.texto);
      const pA = a.partes[0];
      const pB = a.partes[1];
      const pC = a.partes[2];
      if (!pA || !pB || !pC) return { handled: false, ok: false };

      // Resolver A
      const draggedMatchesA =
        figuraA &&
        (!pA.tipo || figuraA.tipo === pA.tipo) &&
        (!pA.color || figuraA.color === pA.color);
      const figA = draggedMatchesA
        ? figuraA
        : figurasEscenario.find(
            (f) =>
              (!pA.tipo || f.tipo === pA.tipo) &&
              (!pA.color || f.color === pA.color)
          );
      const figB = figurasEscenario.find(
        (f) =>
          (!pB.tipo || f.tipo === pB.tipo) &&
          (!pB.color || f.color === pB.color)
      );
      const figC = figurasEscenario.find(
        (f) =>
          (!pC.tipo || f.tipo === pC.tipo) &&
          (!pC.color || f.color === pC.color)
      );
      const zA = figA ? map[figA.id] : undefined;
      const zB = figB ? map[figB.id] : undefined;
      const zC = figC ? map[figC.id] : undefined;

      // Si A tiene vecinos en su fila, exigir que coincidan
      if (zA && zoneCenters[zA]) {
        const cA = zoneCenters[zA];
        const sameRow = Object.entries(zoneCenters)
          .filter(
            ([_, c]) =>
              Math.abs(c.y - cA.y) <= Math.min(c.height, cA.height) * 0.6
          )
          .sort((a, b) => a[1].x - b[1].x)
          .map(([id]) => id);
        const idxA = sameRow.indexOf(zA);
        const leftZ = idxA > 0 ? sameRow[idxA - 1] : undefined;
        const rightZ =
          idxA >= 0 && idxA < sameRow.length - 1
            ? sameRow[idxA + 1]
            : undefined;
        const occupant = (zid?: string) => {
          if (!zid) return undefined;
          const entry = Object.entries(map).find(([_, z]) => z === zid);
          return entry ? entry[0] : undefined;
        };
        const fLId = occupant(leftZ);
        const fRId = occupant(rightZ);
        const fL = fLId
          ? figurasEscenario.find((f) => f.id === fLId)
          : undefined;
        const fR = fRId
          ? figurasEscenario.find((f) => f.id === fRId)
          : undefined;
        const matchPart = (f: any, p: any) =>
          !!f &&
          (!p.tipo || f.tipo === p.tipo) &&
          (!p.color || f.color === p.color) &&
          (!p.tamaño || f.tamaño === p.tamaño);
        if (fL && fR) {
          const neighborsOk =
            (matchPart(fL, pB) && matchPart(fR, pC)) ||
            (matchPart(fL, pC) && matchPart(fR, pB));
          return { handled: true, ok: neighborsOk };
        }
      }

      // Fallback geométrico cuando faltan vecinos
      if (
        zA &&
        zB &&
        zC &&
        zoneCenters[zA] &&
        zoneCenters[zB] &&
        zoneCenters[zC]
      ) {
        const A = zoneCenters[zA];
        const B = zoneCenters[zB];
        const C = zoneCenters[zC];
        const ABx = C.x - B.x;
        const ABy = C.y - B.y;
        const APx = A.x - B.x;
        const APy = A.y - B.y;
        const denom = ABx * ABx + ABy * ABy;
        if (denom > 0.0001) {
          const tProj = (APx * ABx + APy * ABy) / denom;
          const cross = Math.abs(APx * ABy - APy * ABx);
          const distPerp = cross / Math.sqrt(denom);
          const zoneRef = Math.max(B.width, C.width, A.width);
          const withinSegment = tProj >= -0.1 && tProj <= 1.1;
          const closeToLine = distPerp <= zoneRef * 1.2;
          const horizontalDominant = Math.abs(ABx) >= Math.abs(ABy);
          const between = horizontalDominant
            ? (B.x <= A.x && A.x <= C.x) || (C.x <= A.x && A.x <= B.x)
            : (B.y <= A.y && A.y <= C.y) || (C.y <= A.y && A.y <= B.y);
          return { handled: true, ok: withinSegment && closeToLine && between };
        }
      }
      return { handled: false, ok: false };
    },
    [indicacion, figurasEscenario, zoneCenters]
  );

  // Validación en vivo mientras se arrastra (solo para "entre")
  const handleDragOver = (event: import("@dnd-kit/core").DragOverEvent) => {
    const t = indicacion?.texto.toLowerCase() || "";
    if (!t.includes("entre")) return;
    const { active, over } = event;
    if (!active || !over) return;
    const fid = String(active.id);
    const newZ = String(over.id);
    const zonaOver = zonas.find((z) => z.id === newZ);
    if (!zonaOver) return; // solo zonas válidas
    const figuraA = figuras.find((i) => i.id === fid);
    if (!figuraA) return;

    // Simular swap (sin agrupar) para vista previa
    const preview: Record<string, string> = { ...emparejados };
    const oldZ = preview[fid];
    const ocupantesDestino = Object.entries(preview)
      .filter(([_, z]) => z === newZ)
      .map(([id]) => id);
    const topDestino = ocupantesDestino[ocupantesDestino.length - 1];
    if (topDestino) {
      if (oldZ) preview[topDestino] = oldZ;
      else delete preview[topDestino];
    }
    preview[fid] = newZ;

    const { handled, ok } = checkEntreWithMapping(preview, figuraA);
    if (handled) {
      const last = liveLogRef.current;
      if (last.overId !== newZ || last.status !== ok) {
/*         console.log(
          `[VALIDACION-LIVE] ${ok ? "✅" : "❌"} ${
            indicacion?.texto
          } — entre (preview)`
        ); */
        liveLogRef.current = { overId: newZ, status: ok };
      }
    }
  };

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event;
    setDraggingId(null);

    /*     console.log("🎯 Drag End:", { active: active?.id, over: over?.id }); */

    // Si no hay destino válido, no hacer nada
    if (!over || !active) {
      return;
    }

    // Verificar que el destino sea una zona válida (debe estar en la lista de zonas)
    const zona = zonas.find((z) => z.id === over.id);
    if (!zona) {
      return;
    }

    const figura = figuras.find((i) => i.id === active.id);
    if (!figura) {
      return;
    }

    if (figura && zona) {
      const t = indicacion?.texto.toLowerCase() || "";
      const isSpatialDnD = [
        "coloque",
        "ponga",
        "sobre",
        "junto",
        "lejos",
        "entre",
      ].some((w) => t.includes(w));
      const isSelectionMode =
        !isSpatialDnD &&
        (t.includes("señale") || t.includes(" con ") || t.includes("toque"));

      // Instrucciones de selección (incluye "toque"): ignorar drops (ni éxito ni error ni emparejar)
      if (isSelectionMode) {
        console.log("ℹ Instrucción de selección; se ignora el drop");
        return;
      }

      const coincideExacto =
        figura.tipo === zona.tipo &&
        figura.color === zona.color &&
        figura.tamaño === zona.tamaño;
      // En modo relacional permitimos colocar en cualquier zona; si no es relacional, exige coincidencia exacta
      if (coincideExacto || isSpatialDnD) {
        const fid = String(active.id);
        const newZ = String(over.id);
        const oldZ = emparejados[fid];
        const incluyeSobre = t.includes("sobre");

        // Detectar ocupantes actuales del destino
        const ocupantesDestino = Object.entries(emparejados)
          .filter(([_, z]) => z === newZ)
          .map(([id]) => id);
        // Top por zoneOrder si existe
        const topDestino =
          zoneOrder[newZ] && zoneOrder[newZ].length > 0
            ? zoneOrder[newZ][zoneOrder[newZ].length - 1]
            : ocupantesDestino[ocupantesDestino.length - 1];

        const nuevosEmparejados = { ...emparejados };

        if (incluyeSobre) {
          // Agrupar solo en consignas "sobre"
          nuevosEmparejados[fid] = newZ;
          // Solo contar como acierto si es un emparejamiento nuevo y correcto
          const eraNuevo = !emparejados[fid];
          setEmparejados(nuevosEmparejados);
          if (eraNuevo && coincideExacto) setAciertos((prev) => prev + 1);
          setZoneOrder((prev) => {
            const updated: Record<string, string[]> = {};
            for (const [z, arr] of Object.entries(prev)) {
              updated[z] = arr.filter((id) => id !== fid);
            }
            if (!updated[newZ]) updated[newZ] = [];
            updated[newZ] = [...updated[newZ], fid];
            return updated;
          });
        } else {
          // No agrupar: intercambiar posiciones con el top del destino (si hay), o mover si vacío
          if (topDestino) {
            // swap entre fid y topDestino
            if (oldZ) {
              nuevosEmparejados[topDestino] = oldZ;
            } else {
              // si no había oldZ, expulsamos al ocupante (lo quitamos del mapeo)
              delete nuevosEmparejados[topDestino];
            }
          }
          nuevosEmparejados[fid] = newZ;
          // Solo contar como acierto si es un emparejamiento nuevo y correcto
          const eraNuevo = !emparejados[fid];
          setEmparejados(nuevosEmparejados);
          if (eraNuevo && coincideExacto) setAciertos((prev) => prev + 1);
          // actualizar órdenes (una figura por zona)
          setZoneOrder((prev) => {
            const updated: Record<string, string[]> = { ...prev };
            // limpiar fid de todas las zonas
            for (const [z, arr] of Object.entries(updated)) {
              updated[z] = arr.filter((id) => id !== fid && id !== topDestino);
            }
            // destino solo con fid
            updated[newZ] = [fid];
            // oldZ (si existía) con topDestino
            if (oldZ && topDestino) updated[oldZ] = [topDestino];
            return updated;
          });
        }

        // Verificar si el juego está completado
        if (Object.keys(nuevosEmparejados).length === figurasBase.length) {
          setJuegoCompletado(true);
        }
        // Remover el feedback de éxito individual

        /*   console.log("✅ Emparejamiento exitoso:", { 
          figuraId: figura.id, 
          zonaId: zona.id,
          tipo: figura.tipo,
          color: figura.color,
          tamaño: figura.tamaño
        }); */
        // Feedback de drop correcto solo si la indicación es de DnD
        if (
          isSpatialDnD &&
          !t.includes("lejos") &&
          !t.includes("junto") &&
          !t.includes("sobre") &&
          !t.includes("entre")
        ) {
          // En consignas DnD sin chequeo espacial adicional implementado, mostrar éxito básico del drop
          setFeedbackTipo("exito");
          setTimeout(() => setFeedbackTipo(null), 800);
        }

        // Validación adicional para consignas espaciales como "lejos de"
        if (indicacion) {
          const a = analizarIndicacion(indicacion.texto);
          const t = indicacion.texto.toLowerCase();
          if (t.includes("lejos")) {
            // Necesitamos dos figuras: cuadrado verde y cuadrado amarillo, por ejemplo
            const idsColocados = Object.entries(nuevosEmparejados).map(
              ([fId, zId]) => ({ fId, zId })
            );
            // Buscar la figura que se acaba de colocar y la otra figura mencionada
            const tipo1 = a.partes[0]?.tipo;
            const color1 = a.partes[0]?.color as string | undefined;
            const tipo2 = a.partes[1]?.tipo;
            const color2 = a.partes[1]?.color as string | undefined;
            if (tipo1 && color1 && tipo2 && color2) {
              // Usar únicamente las figuras del escenario actual para evitar coincidir con fichas ocultas
              const fig1 = figurasEscenario.find(
                (f) => f.tipo === tipo1 && f.color === color1
              );
              const fig2 = figurasEscenario.find(
                (f) => f.tipo === tipo2 && f.color === color2
              );
              const zona1 = fig1 ? nuevosEmparejados[fig1.id] : undefined;
              const zona2 = fig2 ? nuevosEmparejados[fig2.id] : undefined;
              if (zona1 && zona2 && zoneCenters[zona1] && zoneCenters[zona2]) {
                const c1 = zoneCenters[zona1];
                const c2 = zoneCenters[zona2];
                const dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);
                // Umbral: al menos 1.2 veces el ancho de una zona grande como referencia (más flexible)
                const threshold = Math.max(c1.width, c2.width) * 1.2;
                console.log(
                  `[VALIDACION-LEJOS] Distancia: ${dist.toFixed(
                    2
                  )}, Umbral: ${threshold.toFixed(2)}`
                );
                if (dist >= threshold) {
                  logValidacion(true, "lejos");
                  setFeedbackTipo("exito");
                  setTimeout(() => {
                    setFeedbackTipo(null);
                    // Avanzar a la siguiente indicación (sin cambiar de fase)
                    setIndicacionIdx((prev) => prev + 1);
                    setSeleccion([]);
                  }, 800);
                } else {
                  logValidacion(false, "lejos");
                  setFeedbackTipo("error");
                  setIntentosFallidos((prev) => prev + 1);
                  setTimeout(() => setFeedbackTipo(null), 800);
                }
              }
            }
          }
          if (t.includes("junto")) {
            // cerca: distancia menor a 1.2 * ancho zona
            const tipo1 = a.partes[0]?.tipo;
            const color1 = a.partes[0]?.color as string | undefined;
            const tipo2 = a.partes[1]?.tipo;
            const color2 = a.partes[1]?.color as string | undefined;
            if (tipo1 && color1 && tipo2 && color2) {
              const fig1 = figurasEscenario.find(
                (f) => f.tipo === tipo1 && f.color === color1
              );
              const fig2 = figurasEscenario.find(
                (f) => f.tipo === tipo2 && f.color === color2
              );
              const zona1 = fig1 ? nuevosEmparejados[fig1.id] : undefined;
              const zona2 = fig2 ? nuevosEmparejados[fig2.id] : undefined;
              if (zona1 && zona2 && zoneCenters[zona1] && zoneCenters[zona2]) {
                const c1 = zoneCenters[zona1];
                const c2 = zoneCenters[zona2];
                const dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);
                const threshold = Math.max(c1.width, c2.width) * 1.2;
                if (dist <= threshold) {
                  logValidacion(true, "junto");
                  setFeedbackTipo("exito");
                  setTimeout(() => {
                    setFeedbackTipo(null);
                    // Avanzar a la siguiente indicación o fase
                    if (
                      indicacionIdx + 1 >=
                      fasesTest[faseIdx].indicaciones.length
                    ) {
                      setFaseIdx((prev) => prev + 1);
                      setIndicacionIdx(0);
                    } else {
                      setIndicacionIdx((prev) => prev + 1);
                    }
                    setSeleccion([]);
                  }, 800);
                } else {
                  logValidacion(false, "junto");
                  setFeedbackTipo("error");
                  setIntentosFallidos((prev) => prev + 1);
                  setTimeout(() => setFeedbackTipo(null), 800);
                }
              }
            }
          }
          if (t.includes("sobre")) {
            // Interpretación: figura A "sobre" figura B => ambas en la misma zona
            const tipo1 = a.partes[0]?.tipo;
            const color1 = a.partes[0]?.color as string | undefined;
            const tipo2 = a.partes[1]?.tipo;
            const color2 = a.partes[1]?.color as string | undefined;
            if (tipo1 && color1 && tipo2 && color2) {
              const fig1 = figurasEscenario.find(
                (f) => f.tipo === tipo1 && f.color === color1
              );
              const fig2 = figurasEscenario.find(
                (f) => f.tipo === tipo2 && f.color === color2
              );
              const zona1 = fig1 ? nuevosEmparejados[fig1.id] : undefined;
              const zona2 = fig2 ? nuevosEmparejados[fig2.id] : undefined;
              if (zona1 && zona2) {
                if (zona1 === zona2) {
                  logValidacion(true, "sobre");
                  setFeedbackTipo("exito");
                  setTimeout(() => {
                    setFeedbackTipo(null);
                    // Avanzar a la siguiente indicación o fase
                    if (
                      indicacionIdx + 1 >=
                      fasesTest[faseIdx].indicaciones.length
                    ) {
                      setFaseIdx((prev) => prev + 1);
                      setIndicacionIdx(0);
                    } else {
                      setIndicacionIdx((prev) => prev + 1);
                    }
                    setSeleccion([]);
                  }, 800);
                } else {
                  logValidacion(false, "sobre");
                  setFeedbackTipo("error");
                  setIntentosFallidos((prev) => prev + 1);
                  setTimeout(() => setFeedbackTipo(null), 800);
                }
              }
            }
          }
          if (t.includes("entre")) {
            // A entre B y C -> A proyectado dentro del segmento BC y cerca de la recta
            const pA = a.partes[0];
            const pB = a.partes[1];
            const pC = a.partes[2];
            if (pA && pB && pC) {
              // Preferir la figura arrastrada como A si coincide con la descripción de A
              const draggedMatchesA =
                (!pA.tipo || figura.tipo === pA.tipo) &&
                (!pA.color || figura.color === pA.color);
              const figA = draggedMatchesA
                ? figura
                : figurasEscenario.find(
                    (f) =>
                      (!pA.tipo || f.tipo === pA.tipo) &&
                      (!pA.color || f.color === pA.color)
                  );
              const figB = figurasEscenario.find(
                (f) =>
                  (!pB.tipo || f.tipo === pB.tipo) &&
                  (!pB.color || f.color === pB.color)
              );
              const figC = figurasEscenario.find(
                (f) =>
                  (!pC.tipo || f.tipo === pC.tipo) &&
                  (!pC.color || f.color === pC.color)
              );
              const zA = figA ? nuevosEmparejados[figA.id] : undefined;
              const zB = figB ? nuevosEmparejados[figB.id] : undefined;
              const zC = figC ? nuevosEmparejados[figC.id] : undefined;
              // Primero, si A tiene vecinos inmediatos en su misma fila, exigir que coincidan con B y C
              let validated = false;
              if (zA && zoneCenters[zA]) {
                const cA = zoneCenters[zA];
                // Filtrar zonas de la misma fila (misma banda Y)
                const sameRow = Object.entries(zoneCenters)
                  .filter(
                    ([zid, c]) =>
                      Math.abs(c.y - cA.y) <=
                      Math.min(c.height, cA.height) * 0.6
                  )
                  .sort((a, b) => a[1].x - b[1].x)
                  .map(([zid]) => zid);
                const idxA = sameRow.indexOf(zA);
                const leftZ = idxA > 0 ? sameRow[idxA - 1] : undefined;
                const rightZ =
                  idxA >= 0 && idxA < sameRow.length - 1
                    ? sameRow[idxA + 1]
                    : undefined;
                const topInZone = (zid?: string) => {
                  if (!zid) return undefined;
                  const ocupantes = Object.entries(nuevosEmparejados)
                    .filter(([_, z]) => z === zid)
                    .map(([id]) => id);
                  if (ocupantes.length === 0) return undefined;
                  const ord = zoneOrder[zid];
                  if (ord && ord.length) {
                    const last = [...ord]
                      .reverse()
                      .find((id) => ocupantes.includes(id));
                    return last || ocupantes[ocupantes.length - 1];
                  }
                  return ocupantes[ocupantes.length - 1];
                };
                const fLId = topInZone(leftZ);
                const fRId = topInZone(rightZ);
                const fL = fLId
                  ? figurasEscenario.find((f) => f.id === fLId)
                  : undefined;
                const fR = fRId
                  ? figurasEscenario.find((f) => f.id === fRId)
                  : undefined;
                const matchPart = (f: any, p: any) =>
                  !!f &&
                  (!p.tipo || f.tipo === p.tipo) &&
                  (!p.color || f.color === p.color) &&
                  (!p.tamaño || f.tamaño === p.tamaño);
                if (fL && fR) {
                  const neighborsOk =
                    (matchPart(fL, pB) && matchPart(fR, pC)) ||
                    (matchPart(fL, pC) && matchPart(fR, pB));
                  if (neighborsOk) {
                    logValidacion(true, "entre (vecinos)");
                    setFeedbackTipo("exito");
                    setTimeout(() => setFeedbackTipo(null), 800);
                    // Ya no se usa setIndicacion
                    setSeleccion([]);
                    validated = true;
                  } else {
                    // Si hay vecinos pero no coinciden, no aprobar (sin error visual)
                    logValidacion(false, "entre (vecinos no coinciden)");
                    validated = true; // consideramos manejado; no hacemos fallback para evitar aprobar con otros B/C lejanos
                  }
                }
              }
              // Si no pudimos validar por vecinos (no había ambos vecinos), usar validación geométrica global como antes
              if (
                !validated &&
                zA &&
                zB &&
                zC &&
                zoneCenters[zA] &&
                zoneCenters[zB] &&
                zoneCenters[zC]
              ) {
                const A = zoneCenters[zA];
                const B = zoneCenters[zB];
                const C = zoneCenters[zC];
                const ABx = C.x - B.x;
                const ABy = C.y - B.y; // vector BC (usamos B->C)
                const APx = A.x - B.x;
                const APy = A.y - B.y; // vector BA (usamos B->A)
                const denom = ABx * ABx + ABy * ABy;
                if (denom > 0.0001) {
                  const tProj = (APx * ABx + APy * ABy) / denom; // proyección de A sobre segmento B->C
                  // distancia perpendicular de A a la recta BC
                  const cross = Math.abs(APx * ABy - APy * ABx);
                  const distPerp = cross / Math.sqrt(denom);
                  const zoneRef = Math.max(B.width, C.width, A.width);
                  // A debe proyectar dentro del segmento B-C (con pequeña tolerancia) y estar relativamente cerca de la línea
                  const withinSegment = tProj >= -0.1 && tProj <= 1.1;
                  const closeToLine = distPerp <= zoneRef * 1.2;
                  // Comprobar que A quede entre B y C considerando la orientación dominante (horizontal/vertical)
                  const horizontalDominant = Math.abs(ABx) >= Math.abs(ABy);
                  const between = horizontalDominant
                    ? (B.x <= A.x && A.x <= C.x) || (C.x <= A.x && A.x <= B.x)
                    : (B.y <= A.y && A.y <= C.y) || (C.y <= A.y && A.y <= B.y);
                  if (withinSegment && closeToLine && between) {
                    logValidacion(true, "entre");
                    setFeedbackTipo("exito");
                    setTimeout(() => {
                      setFeedbackTipo(null);
                      // Avanzar a la siguiente indicación o fase
                      if (
                        indicacionIdx + 1 >=
                        fasesTest[faseIdx].indicaciones.length
                      ) {
                        setFaseIdx((prev) => prev + 1);
                        setIndicacionIdx(0);
                      } else {
                        setIndicacionIdx((prev) => prev + 1);
                      }
                      setSeleccion([]);
                    }, 800);
                  } else {
                    // En consignas "entre" no notificamos error cuando aún no se cumple;
                    // permitimos que el usuario siga intercambiando hasta lograrlo.
                    logValidacion(false, "entre");
                  }
                }
              }
            }
          }
        }
      } else {
        // Incrementar intentos fallidos
        if (isSpatialDnD) setIntentosFallidos((prev) => prev + 1);
        // Remover el feedback de error individual
        console.log("❌ No coinciden:", {
          figuraType: figura.tipo,
          figuraColor: figura.color,
          figuraTamaño: figura.tamaño,
          zonaType: zona.tipo,
          zonaColor: zona.color,
          zonaTamaño: zona.tamaño,
        });
        if (isSpatialDnD) {
          setFeedbackTipo("error");
          setTimeout(() => setFeedbackTipo(null), 800);
        }
      }
    }
  };

  return (
    <main className="h-screen w-screen bg-gray-100 flex flex-col p-2 sm:p-4 overflow-hidden">
      {/* Header con estadísticas, indicación centrada y controles */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-start md:items-center gap-2 mb-3 flex-shrink-0">
        {/* Izquierda: título y stats */}
        <div className="order-2 md:order-1 flex flex-wrap gap-2 items-center justify-center md:justify-start">
          <h2 className="text-base sm:text-lg font-bold">
            Empareja las figuras
          </h2>
          <div className="bg-white px-2 py-1 rounded shadow text-xs sm:text-sm">
            <span className="text-red-600 font-semibold">
              ❌ {intentosFallidos}
            </span>
          </div>
          <div className="bg-white px-2 py-1 rounded shadow text-xs sm:text-sm">
            <span className="text-green-600 font-semibold">
              ✅ {aciertos}/{fasesTest[faseIdx]?.indicaciones.length}
            </span>
          </div>
        </div>
        {/* Centro: indicación visible */}
        <div className="order-1 md:order-2 flex items-center justify-center gap-2 flex-wrap px-2">
          <span className="text-xs sm:text-sm text-gray-500">Indicación:</span>
          <span className="font-medium text-center text-black max-w-[92vw] md:max-w-none break-words leading-snug text-sm">
            {indicacion?.texto}
          </span>
          <button
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs sm:text-sm"
            onClick={() => {
              setSeleccion([]);
              setFiguras(shuffleNoRepeatColor(figurasBase));
              // Seleccionar una indicación aleatoria NO repetida de la fase actual
              const fase = fasesTest[faseIdx];
              if (fase && fase.indicaciones.length > 0) {
                const idx = getNoRepeatIndicacion();
                setIndicacionIdx(idx);
              }
            }}
          >
            Aleatoria
          </button>
        </div>
        {/* Derecha: fase/escenario y acciones */}
        <div className="order-3 flex flex-wrap gap-2 items-center justify-center md:justify-end">
          <span className="text-xs sm:text-sm text-gray-500">Fase</span>
          <button
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs sm:text-sm"
            onClick={() => setFaseIdx((i) => Math.max(0, i - 1))}
            disabled={faseIdx === 0}
          >
            ◀
          </button>
          <span className="font-semibold text-xs sm:text-sm">
            {faseIdx + 1} / {fasesTest.length}
          </span>
          <button
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs sm:text-sm"
            onClick={() =>
              setFaseIdx((i) => Math.min(fasesTest.length - 1, i + 1))
            }
            disabled={faseIdx === fasesTest.length - 1}
          >
            ▶
          </button>
          <span className="ml-0 md:ml-2 text-[11px] sm:text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 whitespace-nowrap">
            {faseActual?.escenario === "todas"
              ? "todas las fichas"
              : "sin pequeñas"}
          </span>
          <button
            onClick={mezclarJuego}
            className="ml-0 md:ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs sm:text-sm font-semibold transition-colors"
            disabled={juegoCompletado}
          >
            🔀 Mezclar
          </button>
          <button
            onClick={reiniciarJuego}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs sm:text-sm font-semibold transition-colors"
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>

      {/* Mensaje de validación textual */}
      {mensajeValidacion && (
        <div
          style={{
            margin: "16px 0",
            padding: "10px 18px",
            background: "#fffbe6",
            color: "#b8860b",
            border: "1px solid #ffe58f",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 18,
            textAlign: "center",
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "0 2px 8px #0001",
          }}
        >
          {mensajeValidacion}
        </div>
      )}

      <DndContext
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        {/* Zonas organizadas en dos filas (filtradas por escenario) - visibles solo para consignas de movimiento */}
        {showDropZones && (
          <div
            className="flex flex-col items-center mb-2 sm:mb-4 flex-shrink-0 px-1"
            data-no-dnd="true"
          >
            {/* Fila 1: Círculos grandes */}
            <div
              className="flex justify-center flex-wrap mb-2 gap-1"
              data-no-dnd="true"
            >
              {zonasEscenario
                .filter((z) => z.tamaño === "grande" && z.tipo === "circulo")
                .slice(0, 5)
                .map((zona) => {
                  const figuraEmparejadaId = Object.keys(emparejados).find(
                    (figuraId) => emparejados[figuraId] === zona.id
                  );
                  const figuraColocada = figuraEmparejadaId
                    ? figurasEscenario.find((f) => f.id === figuraEmparejadaId)
                    : undefined;
                  return (
                    <DropZona
                      key={zona.id}
                      id={zona.id}
                      tipo={zona.tipo}
                      figuraEjemplo={{
                        tipo: zona.tipo,
                        color: zona.color,
                        tamaño: zona.tamaño,
                      }}
                      figuraColocada={
                        figuraColocada
                          ? {
                              id: figuraColocada.id,
                              tipo: figuraColocada.tipo,
                              color: figuraColocada.color,
                              tamaño: figuraColocada.tamaño,
                            }
                          : undefined
                      }
                      onMeasure={handleZoneMeasure}
                      figurasColocadas={figurasPorZona[zona.id]}
                      overlayMode={overlayMode}
                      orderIds={zoneOrder[zona.id]}
                      draggingId={draggingId || undefined}
                    />
                  );
                })}
            </div>
            {/* Fila 2: Cuadros grandes */}
            <div
              className="flex justify-center flex-wrap mb-2 gap-1"
              data-no-dnd="true"
            >
              {zonasEscenario
                .filter((z) => z.tamaño === "grande" && z.tipo === "cuadro")
                .slice(0, 5)
                .map((zona) => {
                  const figuraEmparejadaId = Object.keys(emparejados).find(
                    (figuraId) => emparejados[figuraId] === zona.id
                  );
                  const figuraColocada = figuraEmparejadaId
                    ? figurasEscenario.find((f) => f.id === figuraEmparejadaId)
                    : undefined;
                  return (
                    <DropZona
                      key={zona.id}
                      id={zona.id}
                      tipo={zona.tipo}
                      figuraEjemplo={{
                        tipo: zona.tipo,
                        color: zona.color,
                        tamaño: zona.tamaño,
                      }}
                      figuraColocada={
                        figuraColocada
                          ? {
                              id: figuraColocada.id,
                              tipo: figuraColocada.tipo,
                              color: figuraColocada.color,
                              tamaño: figuraColocada.tamaño,
                            }
                          : undefined
                      }
                      onMeasure={handleZoneMeasure}
                      figurasColocadas={figurasPorZona[zona.id]}
                      overlayMode={overlayMode}
                      orderIds={zoneOrder[zona.id]}
                      draggingId={draggingId || undefined}
                    />
                  );
                })}
            </div>
            {/* Fila 3: Círculos pequeños (oculta si no hay) */}
            {zonasEscenario.some(
              (z) => z.tamaño === "pequeño" && z.tipo === "circulo"
            ) && (
              <div
                className="flex justify-center flex-wrap mb-2 gap-1"
                data-no-dnd="true"
              >
                {zonasEscenario
                  .filter((z) => z.tamaño === "pequeño" && z.tipo === "circulo")
                  .slice(0, 5)
                  .map((zona) => {
                    const figuraEmparejadaId = Object.keys(emparejados).find(
                      (figuraId) => emparejados[figuraId] === zona.id
                    );
                    const figuraColocada = figuraEmparejadaId
                      ? figurasEscenario.find(
                          (f) => f.id === figuraEmparejadaId
                        )
                      : undefined;
                    return (
                      <DropZona
                        key={zona.id}
                        id={zona.id}
                        tipo={zona.tipo}
                        figuraEjemplo={{
                          tipo: zona.tipo,
                          color: zona.color,
                          tamaño: zona.tamaño,
                        }}
                        figuraColocada={
                          figuraColocada
                            ? {
                                id: figuraColocada.id,
                                tipo: figuraColocada.tipo,
                                color: figuraColocada.color,
                                tamaño: figuraColocada.tamaño,
                              }
                            : undefined
                        }
                        onMeasure={handleZoneMeasure}
                        figurasColocadas={figurasPorZona[zona.id]}
                        overlayMode={overlayMode}
                        orderIds={zoneOrder[zona.id]}
                        draggingId={draggingId || undefined}
                      />
                    );
                  })}
              </div>
            )}
            {/* Fila 4: Cuadros pequeños (oculta si no hay) */}
            {zonasEscenario.some(
              (z) => z.tamaño === "pequeño" && z.tipo === "cuadro"
            ) && (
              <div
                className="flex justify-center flex-wrap gap-1"
                data-no-dnd="true"
              >
                {zonasEscenario
                  .filter((z) => z.tamaño === "pequeño" && z.tipo === "cuadro")
                  .slice(0, 5)
                  .map((zona) => {
                    const figuraEmparejadaId = Object.keys(emparejados).find(
                      (figuraId) => emparejados[figuraId] === zona.id
                    );
                    const figuraColocada = figuraEmparejadaId
                      ? figurasEscenario.find(
                          (f) => f.id === figuraEmparejadaId
                        )
                      : undefined;
                    return (
                      <DropZona
                        key={zona.id}
                        id={zona.id}
                        tipo={zona.tipo}
                        figuraEjemplo={{
                          tipo: zona.tipo,
                          color: zona.color,
                          tamaño: zona.tamaño,
                        }}
                        figuraColocada={
                          figuraColocada
                            ? {
                                id: figuraColocada.id,
                                tipo: figuraColocada.tipo,
                                color: figuraColocada.color,
                                tamaño: figuraColocada.tamaño,
                              }
                            : undefined
                        }
                        onMeasure={handleZoneMeasure}
                        figurasColocadas={figurasPorZona[zona.id]}
                        overlayMode={overlayMode}
                        orderIds={zoneOrder[zona.id]}
                        draggingId={draggingId || undefined}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Área de figuras disponibles organizadas por tamaño (filtradas por escenario) */}
        <div
          className="flex flex-col items-center flex-1 justify-start overflow-auto pb-16"
          data-no-dnd="true"
        >
          <div
            className="flex flex-col items-center gap-2 w-full px-1"
            data-no-dnd="true"
          >
            {/* Fila 1: Círculos grandes */}
            <div
              className="flex flex-wrap justify-center gap-1"
              data-no-dnd="true"
            >
              {figurasEscenario
                .filter(
                  (item) =>
                    item.tamaño === "grande" &&
                    item.tipo === "circulo" &&
                    !emparejados[item.id]
                )
                .slice(0, 5)
                .map((item) => (
                  <DraggableFigura
                    key={item.id}
                    {...item}
                    onSelect={handleSelect}
                    selected={seleccion.includes(item.id)}
                  />
                ))}
            </div>
            {/* Fila 2: Cuadros grandes */}
            <div
              className="flex flex-wrap justify-center gap-1"
              data-no-dnd="true"
            >
              {figurasEscenario
                .filter(
                  (item) =>
                    item.tamaño === "grande" &&
                    item.tipo === "cuadro" &&
                    !emparejados[item.id]
                )
                .slice(0, 5)
                .map((item) => (
                  <DraggableFigura
                    key={item.id}
                    {...item}
                    onSelect={handleSelect}
                    selected={seleccion.includes(item.id)}
                  />
                ))}
            </div>
            {/* Fila 3: Círculos pequeños (oculta si escenario es sin-pequeñas) */}
            {faseActual?.escenario !== "sin-pequeñas" && (
              <div
                className="flex flex-wrap justify-center gap-1"
                data-no-dnd="true"
              >
                {figurasEscenario
                  .filter(
                    (item) =>
                      item.tamaño === "pequeño" &&
                      item.tipo === "circulo" &&
                      !emparejados[item.id]
                  )
                  .slice(0, 5)
                  .map((item) => (
                    <DraggableFigura
                      key={item.id}
                      {...item}
                      onSelect={handleSelect}
                      selected={seleccion.includes(item.id)}
                    />
                  ))}
              </div>
            )}
            {/* Fila 4: Cuadros pequeños (oculta si escenario es sin-pequeñas) */}
            {faseActual?.escenario !== "sin-pequeñas" && (
              <div
                className="flex flex-wrap justify-center gap-1"
                data-no-dnd="true"
              >
                {figurasEscenario
                  .filter(
                    (item) =>
                      item.tamaño === "pequeño" &&
                      item.tipo === "cuadro" &&
                      !emparejados[item.id]
                  )
                  .slice(0, 5)
                  .map((item) => (
                    <DraggableFigura
                      key={item.id}
                      {...item}
                      onSelect={handleSelect}
                      selected={seleccion.includes(item.id)}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
        {/* Drag overlay para evitar clipping mientras se arrastra */}
        <DragOverlay>
          {activeFigura ? (
            <div
              className={`pointer-events-none ${
                activeFigura.tamaño === "grande" ? "w-16 h-16" : "w-12 h-12"
              } ${
                activeFigura.tipo === "circulo" ? "rounded-full" : "rounded"
              } ${colorMap[activeFigura.color]} shadow-lg`}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {juegoCompletado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
            <h3 className="text-3xl font-bold text-green-600 mb-4">
              🎉 ¡Felicitaciones!
            </h3>
            <p className="text-lg mb-2">Completaste el juego</p>
            <div className="mb-4">
              <p className="text-gray-600">
                Total de intentos fallidos:{" "}
                <span className="font-bold text-red-600">
                  {intentosFallidos}
                </span>
              </p>
              <p className="text-gray-600">
                Figuras correctas:{" "}
                <span className="font-bold text-green-600">
                  {figurasBase.length}
                </span>
              </p>
              <p className="text-gray-600 mt-2">
                Puntuación:{" "}
                <span className="font-bold text-blue-600">
                  {Math.max(0, 100 - intentosFallidos * 10)}%
                </span>
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={mezclarJuego}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🔀 Jugar de nuevo (Mezclado)
              </button>
              <button
                onClick={reiniciarJuego}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🔄 Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* sin modal; la indicación se muestra en el nav superior */}

      {/* Feedback visual flotante */}
      <FeedbackVisual tipo={feedbackTipo} onComplete={() => {}} />
    </main>
  );
}
