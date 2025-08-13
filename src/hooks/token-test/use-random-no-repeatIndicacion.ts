"use client";
import React, { useEffect, useState, useCallback } from "react";

export function useRandomNoRepeatIndicacion(faseIdx: number, total: number) {
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
