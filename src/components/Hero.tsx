"use client";

import { useCollection } from "@/hooks/useCollection";

export function Hero() {
  const { data } = useCollection();

  return (
    <section className="pt-6 pb-10 sm:pt-8 sm:pb-12">
      <div className="flex items-start justify-between font-mono text-[11px] uppercase tracking-wider">
        <span className="text-accent">
          Genesis collection / {data ? data.maxSupply.toString() : "—"} editions
        </span>
        <span className="hidden text-muted sm:block">Sepolia testnet</span>
      </div>

      <h1 className="mt-5 text-[clamp(3.25rem,11.5vw,9.5rem)] font-medium uppercase leading-[0.88] tracking-tight">
        Beyond
        <br />
        the veil.
      </h1>

      <div className="mt-6 flex items-end justify-between gap-6">
        <p className="max-w-md text-base text-muted">
          {data?.revealed
            ? "The veil has lifted. Every Jojo now shows its true form."
            : "One artwork, hidden until the owner lifts the veil. Mint yours now and watch it change."}
        </p>
        <a
          href="#mint"
          className="hidden shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:text-fg sm:block"
        >
          Scroll to mint ↓
        </a>
      </div>
    </section>
  );
}