import type { Card, Color, Shape, Count } from "./types";

export const COLORS: Color[] = ["red", "green", "blue", "yellow"];
export const SHAPES: Shape[] = ["circle", "triangle", "cross", "star"];
export const COUNTS: Count[] = [1, 2, 3, 4];

export const MODEL_CARDS: Card[] = [
  { id: "m1", color: "red",    shape: "triangle", count: 1 },
  { id: "m2", color: "green",  shape: "star",     count: 2 },
  { id: "m3", color: "blue",   shape: "cross",    count: 3 },
  { id: "m4", color: "yellow", shape: "circle",   count: 4 },
];

export const MAX_CATEGORIES = 6;

// Nuevas opciones de ensayo total (selector de modo)
export const TRIAL_OPTIONS = [24, 64] as const;
