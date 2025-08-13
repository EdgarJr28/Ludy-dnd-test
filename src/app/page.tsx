"use client";

import TokenTestCore from "@/components/token-test-view";
import ClientOnly from "@/components/client-only";

export default function Home() {
  return (
    <ClientOnly>
      <TokenTestCore />
    </ClientOnly>
  );
}
