import { COLORS, COUNTS, SHAPES } from "../types/constants";
import { Card, Color, Count, Shape } from "../types/types";

// (opcional) si quieres mantener también la opción aleatoria:
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Orden fijo: recorre colores → formas → cantidades y numera c1..c64 */
export function generateDeckOrdered(): Card[] {
  const deck: Card[] = [];
  let id = 1;
  for (const color of COLORS) {
    for (const shape of SHAPES) {
      for (const count of COUNTS) {
        deck.push({ id: `c${id++}`, color, shape, count });
      }
    }
  }
  return deck; // SIN shuffle → orden determinista
}

/** (opcional) si alguna vez quieres aleatorio */
export function generateDeckRandom(): Card[] {
  return shuffle(generateDeckOrdered());
}

  /**
  * Sanitiza un mazo de entrada para que cumpla con las reglas del juego.
  * - Asegura que los colores, formas y cantidades sean válidos.
  * - Asigna un ID único si no se proporciona.
  * - Normaliza un array desde JSON para que cumpla el tipo Card
  */
export function sanitizeDeck(input: any[]): Card[] {
  const colorSet = new Set<Color>(COLORS);
  const shapeSet = new Set<Shape>(SHAPES);
  const countSet = new Set<Count>(COUNTS);

  return (input ?? []).map((raw, i): Card => {
    // tu JSON trae id numérico; lo convertimos a string para el tipo Card
    const id =
      typeof raw?.id === "string" && raw.id.trim()
        ? raw.id
        : typeof raw?.id === "number"
        ? String(raw.id)
        : `u${i + 1}`;

    const color: Color = colorSet.has(raw?.color) ? raw.color : "red";
    const shape: Shape = shapeSet.has(raw?.shape) ? raw.shape : "circle";
    const count: Count = countSet.has(raw?.count) ? raw.count : 1;

    return { id, color, shape, count };
  });
}