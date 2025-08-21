import { Card, Rule } from "../types/types";

export const RULE_PRIORITY: Rule[] = ["color", "shape", "count"];

export function matchesByRule(card: Card, model: Card, rule: Rule): boolean {
  switch (rule) {
    case "color": return card.color === model.color;
    case "shape": return card.shape === model.shape;
    case "count": return card.count === model.count;
  }
}

/**
 * Elige una regla a partir de los matches. Si blockRule está definida,
 * NO la considerará aunque haga match (para evitar repetir criterio).
 */
export function pickRuleFromMatches(
  matches: { color: boolean; shape: boolean; count: boolean },
  blockRule?: Rule | null
): Rule | null {
  for (const r of RULE_PRIORITY) {
    if (blockRule && r === blockRule) continue; // 👈 evita repetir
    if (matches[r]) return r;
  }
  return null;
}