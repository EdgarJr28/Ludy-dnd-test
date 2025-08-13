import { FaseTest } from "@/types/juego";

export const fasesTest: FaseTest[] = [
  {
    id: 1,
    titulo: "Todas las fichas",
    escenario: "todas",
    indicaciones: [
      "Señale un circulo",
      "Señale un cuadrado",
      "Señale una figura amarilla",
      "Señale una figura roja",
      "Señale una figura negra",
      "Señale una figura verde",
      "Señale una figura blanca",
    ],
  },
  {
    id: 2,
    titulo: "Retire las figuras pequeñas",
    escenario: "sin-pequeñas",
    indicaciones: [
      "Señale el cuadrado amarillo",
      "Señale el circulo negro",
      "Señale el círculo verde",
      "Señale el círculo blanco",
    ],
  },
  {
    id: 3,
    titulo: "Todas las fichas",
    escenario: "todas",
    indicaciones: [
      "Señale el circulo blanco pequeño",
      "Señale el cuadrado amarillo grande",
      "Señale el cuadrado verde grande",
      "Señale el cuadrado pequeño negro",
    ],
  },
  {
    id: 4,
    titulo: "Retirar las figuras pequeñas",
    escenario: "sin-pequeñas",
    indicaciones: [
      "Señale el circulo rojo y el cuadrado verde",
      "Señale el cuadrado amarillo y cuadrado blanco",
      "Señale el cuadrado blanco y circulo verde",
      "Señale el circulo blanco y circulo rojo",
    ],
  },
  {
    id: 5,
    titulo: "Todas las fichas",
    escenario: "todas",
    indicaciones: [
      "Señale el circulo grande blanco y cuadrado verde grande",
      "Señale el circulo pequeño negro y cuadrado amarillo grande",
      "Señale el cuadrado grande verde y cuadrado rojo grande",
      "Señale el cuadrado rojo grande y circulo verde pequeño",
    ],
  },
  {
    id: 6,
    titulo: "Retirar las figuras pequeñas",
    escenario: "sin-pequeñas",
    indicaciones: [
/*       "Ponga el circulo rojo sobre el cuadrado verde",
      "Toque el circulo negro con el cuadrado rojo",
      "Señale el circulo negro y el cuadrado rojo",
      "Señale el circulo negro o el cuadrado rojo",
      "Coloque el cuadrado verde lejos del cuadrado amarillo",
      "Si hay un circulo blanco señale el cuadrado rojo",
      "Coloque el cuadrado verde junto al circulo amarillo", */
/*       "Señale todos los cuadrados lentamente y los circulos rápidamente",
      "Coloque el circulo rojo entre el cuadrado amarillo y el cuadrado verde", */
      "Toque todos los circulos menos el verde",
      "Señale el circulo rojo con el cuadrado blanco",
      "En lugar del cuadrado blanco señale el circulo amarillo",
      "Además del circulo amarillo señale el circulo negro",
    ],
  },
];
