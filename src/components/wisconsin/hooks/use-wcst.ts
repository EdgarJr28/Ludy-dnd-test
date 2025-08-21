"use client";

import { useEffect, useRef, useState } from "react";
import { generateDeckOrdered } from "../libs/deck";
import { MAX_CATEGORIES, MODEL_CARDS } from "../types/constants";
import { matchesByRule, pickRuleFromMatches } from "../libs/rules";
import { Card, Rule } from "../types/types";

type StartOptions = {
  deck?: Card[]; // mazo personalizado en el orden deseado (opcional)
};

export function useWCST() {
  // Control de sesión
  const [started, setStarted] = useState(false);
  const [totalTrials, setTotalTrials] = useState<number>(64);

  // Guarda el mazo "semilla" para reiniciar con el mismo orden
  const seedDeckRef = useRef<Card[] | null>(null);

  // Estado base
  const [deck, setDeck] = useState<Card[]>([]);
  const [trial, setTrial] = useState(0);

  /*
   * Criterio de selección: número de aciertos consecutivos
   * (24 -> 6, 64 -> 10; puedes ajustar esto si quieres)
   */
  const [criterion, setCriterion] = useState(10);

  // Regla de categoría: se define con el primer acierto (o null = descubriendo)
  const [rule, setRule] = useState<Rule | null>(null);
  const [prevRule, setPrevRule] = useState<Rule | null>(null);

  const [streak, setStreak] = useState(0);
  const [categories, setCategories] = useState(0);
  const [finished, setFinished] = useState(false);

  // Métricas
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [perseverativeErrors, setPerseverativeErrors] = useState(0);
  const [failMaintainSet, setFailMaintainSet] = useState(0);

  // Feedback & timing
  const [feedback, setFeedback] = useState<null | { ok: boolean; msg: string }>(null);
  const feedbackTimer = useRef<number | null>(null);
  const trialStartRef = useRef<number>(0);
  const [rts, setRts] = useState<number[]>([]);

  // Derivados
  const currentCard = deck[trial] ?? null;
  const accuracy = (correct / Math.max(1, trial)) * 100;

  // Timestamp por ensayo
  useEffect(() => {
    trialStartRef.current = Date.now();
  }, [trial]);

  useEffect(() => {
    trialStartRef.current = Date.now();
    return () => {
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    };
  }, []);

  // Construye un mazo de longitud N repitiendo/recortando el mazo base sin alterar su orden
  function buildDeckForTrials(trials: number, base: Card[]): Card[] {
    if (base.length === 0) return [];
    const out: Card[] = [];
    let i = 0;
    while (out.length < trials) {
      // copiamos la carta manteniendo su id original (solo informativo)
      out.push({ ...base[i % base.length] });
      i++;
    }
    return out.slice(0, trials);
  }

  function start(trials: number, opts?: StartOptions) {
    // Si te pasan un mazo, úsalo en ese orden; si no, usa el mazo fijo 1..64
    const base = opts?.deck && opts.deck.length > 0 ? opts.deck : generateDeckOrdered();

    seedDeckRef.current = base;                 // guarda mazo semilla para "reiniciar" igual
    setDeck(buildDeckForTrials(trials, base));  // ajusta a 24/64 sin alterar orden
    setTotalTrials(trials);
    setCriterion(trials === 24 ? 6 : 10);       // abreviada: 6, extendida: 10 (ajústalo si quieres)
    setStarted(true);

    // reset de estado
    setTrial(0);
    setRule(null);
    setPrevRule(null);
    setStreak(0);
    setCategories(0);
    setFinished(false);
    setCorrect(0);
    setErrors(0);
    setPerseverativeErrors(0);
    setFailMaintainSet(0);
    setFeedback(null);
    setRts([]);
  }

  function classify(targetId: string) {
    if (!started || !currentCard || finished) return;
    const model = MODEL_CARDS.find((m) => m.id === targetId)!;

    const matches = {
      color: currentCard.color === model.color,
      shape: currentCard.shape === model.shape,
      count: currentCard.count === model.count,
    };

    const rt = Date.now() - trialStartRef.current;
    setRts((arr) => [...arr, rt]);

    let ok = false;
    let ruleChosenThisTrial: Rule | null = null;

    if (rule == null) {
      // 👇 bloquea repetir el mismo criterio que la categoría anterior
      ruleChosenThisTrial = pickRuleFromMatches(matches, prevRule);
      ok = ruleChosenThisTrial !== null;
    } else {
      ok = matchesByRule(currentCard, model, rule);
    }

    setFeedback({ ok, msg: ok ? "Correcto" : "Incorrecto" });
    // ... (resto igual)

    if (ok) {
      if (ruleChosenThisTrial) setRule(ruleChosenThisTrial);
      const nextStreak = streak + 1;
      setCorrect((c) => c + 1);
      setStreak(nextStreak);

      const effectiveRule = ruleChosenThisTrial ?? rule;

      if (nextStreak >= criterion) {
        setCategories((cat) => cat + 1);
        if (effectiveRule) setPrevRule(effectiveRule); // queda bloqueada para la próxima
        setRule(null);  // próxima categoría: “descubrir” con bloqueo de prevRule
        setStreak(0);
      }
    } else {
      setErrors((e) => e + 1);
      if (prevRule && matchesByRule(currentCard, model, prevRule)) {
        setPerseverativeErrors((p) => p + 1);
      } else if (streak >= 5) {
        setFailMaintainSet((f) => f + 1);
      }
      setStreak(0);
    }

    const nextTrial = trial + 1;
    if (nextTrial >= totalTrials || categories >= MAX_CATEGORIES) {
      setFinished(true);
    } else {
      setTrial(nextTrial);
    }
  }

  function restart() {
    // Reinicia manteniendo el modo actual (24 o 64) y el MISMO mazo base/orden
    const base = seedDeckRef.current ?? generateDeckOrdered();
    setDeck(buildDeckForTrials(totalTrials, base));
    setTrial(0);
    setRule(null);
    setPrevRule(null);
    setStreak(0);
    setCategories(0);
    setFinished(false);
    setCorrect(0);
    setErrors(0);
    setPerseverativeErrors(0);
    setFailMaintainSet(0);
    setFeedback(null);
    setRts([]);
  }

  return {
    // sesión
    started,
    totalTrials,
    criterion,

    // estado de juego
    trial,
    rule,
    prevRule,
    streak,
    categories,
    finished,
    correct,
    errors,
    perseverativeErrors,
    failMaintainSet,
    accuracy,
    currentCard,
    feedback,
    rts,

    // acciones
    start,     // start(trials, { deck })
    classify,
    restart,
  };
}
