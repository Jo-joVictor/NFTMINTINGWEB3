"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { useNftMetadata } from "@/hooks/useNftMetadata";
import { useWalletNfts } from "@/hooks/useWalletNfts";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { GATEWAYS, ipfsToHttp } from "@/lib/ipfs";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-medium tabular-nums">{value}</p>
    </div>
  );
}

function Thumb({ id, image, name }: { id: bigint; image?: string; name?: string }) {
  const [gw, setGw] = useState(0);
  const [bad, setBad] = useState(false);
  return (
    <figure className="overflow-hidden border border-line bg-bg">
      <div className="relative aspect-square bg-line/40">
        {image && !bad && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={gw}
            src={ipfsToHttp(image, gw)}
            alt={name ?? `Jojo #${id}`}
            onError={() => (gw < GATEWAYS.length - 1 ? setGw(gw + 1) : setBad(true))}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
      <figcaption className="flex items-center justify-between px-3 py-2 font-mono text-[11px] uppercase tracking-wider">
        <span>#{id.toString()}</span>
        <a
          href={`https://sepolia.etherscan.io/nft/${CONTRACT_ADDRESS}/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-fg"
        >
          Etherscan ↗
        </a>
      </figcaption>
    </figure>
  );
}

export function WalletPanel() {
  const w = useWalletNfts();
  const { data: col } = useCollection();
  const { metadata } = useNftMetadata();

  if (!w.isConnected || !w.address) return null;

  const cap = col?.maxPerWallet.toString() ?? "—";

  return (
    <section className="mt-5 rounded-sm border border-line bg-panel p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider">
        <span className="text-accent">Your wallet</span>
        <a
          href={`https://sepolia.etherscan.io/address/${w.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-fg"
        >
          {short(w.address)} ↗
        </a>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 border-b border-line pb-6">
        <Stat label="Minted by you" value={`${w.mintedByYou?.toString() ?? "—"} / ${cap}`} />
        <Stat label="Mints left" value={w.allowanceLeft?.toString() ?? "—"} />
        <Stat label="Held now" value={w.balance?.toString() ?? "—"} />
      </div>

      <div className="mt-6">
        {w.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {[0, 1].map((i) => (
              <div key={i} className="aspect-square animate-pulse bg-line/60" />
            ))}
          </div>
        ) : w.owned.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted">You don&apos;t hold any Jojo yet.</p>
            <a href="#mint" className="mt-2 inline-block font-mono text-[11px] uppercase tracking-wider text-accent">
              Mint one ↑
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {w.owned.map((id) => (
              <Thumb key={`${id}-${metadata?.image}`} id={id} image={metadata?.image} name={metadata?.name} />
            ))}
          </div>
        )}
        <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted">
          Minted counts toward your cap even if you transfer an NFT away.
        </p>
      </div>
    </section>
  );
}