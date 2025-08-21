"use client";

import { useSensors, useSensor, PointerSensor, KeyboardSensor } from "@dnd-kit/core";

/** Hook de sensores para dnd-kit: llama hooks al tope, cumpliendo Rules of Hooks */
export function useDnDSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );
}
