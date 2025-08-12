export type Escenario = "todas" | "sin-pequeñas";

export interface FaseTest {
  id: number;
  titulo: string;
  escenario: Escenario;
  indicaciones: string[];
}


export const colorEsToEn: Record<string, string> = {
  rojo: "red",
  verde: "green",
  azul: "blue",
  amarillo: "yellow",
  blanco: "white",
  negro: "black",
};