export type Color = "red" | "green" | "blue" | "yellow";
export type Shape = "circle" | "triangle" | "cross" | "star";
export type Count = 1 | 2 | 3 | 4;

export type Card = {
  id: string;
  color: Color;
  shape: Shape;
  count: Count;
};

export type Rule = "color" | "shape" | "count";



export const CUSTOM_MODELS: Card[] = [
  { id: "m1", color: "red",    shape: "triangle", count: 1 },
  { id: "m2", color: "green",  shape: "star",     count: 2 },
  { id: "m3", color: "blue",   shape: "cross",    count: 3 },
  { id: "m4", color: "yellow", shape: "circle",   count: 4 },
];