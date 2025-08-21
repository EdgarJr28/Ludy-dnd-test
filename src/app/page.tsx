"use client";
import ClientOnly from "@/components/client-only";

import dynamic from "next/dynamic";
const WCSTGame = dynamic(() => import("../components/wisconsin/wisconsin"), { ssr: false });

export default function Home() {
  return (
    <ClientOnly>
      <WCSTGame />
    </ClientOnly>
  );
}
