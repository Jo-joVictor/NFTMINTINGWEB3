"use client";

import { formatEther } from "viem";
import { useCollection } from "@/hooks/useCollection";

export function StatsStrip() {
  const { data } = useCollection();

  const items = [
    `${data ? data.maxSupply.toString() : "—"} editions`,
    `${data ? formatEther(data.price) : "—"} ETH / public mint`,
    "Art stored on IPFS",
    data?.revealed ? "Collection revealed" : "Reveal announced by owner",
  ];

  return (
    <footer className="mt-12 border-t border-line py-6">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-wider text-muted sm:flex sm:justify-between">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </footer>
  );
}