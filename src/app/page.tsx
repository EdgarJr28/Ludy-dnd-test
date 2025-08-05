"use client";

import Juego from "@/components/Juego";
import ClientOnly from "@/components/ClientOnly";

export default function Home() {
  return (
    <ClientOnly>
      <Juego />
    </ClientOnly>
  );
}
