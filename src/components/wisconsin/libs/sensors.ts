"use client";

import { useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";

export function createSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );
}
