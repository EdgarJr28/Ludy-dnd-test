"use client";

import Juego from "@/components/Juego";
import ClientOnly from "@/components/ClientOnly";
import Wisconsin from "@/components/wisconsin/wisconsin";
import dynamic from "next/dynamic";
const WCSTGame = dynamic(() => import("../components/wisconsin/wisconsin"), { ssr: false });

export default function Home() {
  return (
    <ClientOnly>
      <WCSTGame />
    </ClientOnly>
  );
}
