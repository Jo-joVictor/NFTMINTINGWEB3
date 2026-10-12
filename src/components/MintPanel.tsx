"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useQueryClient } from "@tanstack/react-query";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { useCollection } from "@/hooks/useCollection";
import { useWalletAllowance } from "@/hooks/useWalletAllowance";
import { useMint } from "@/hooks/useMint";

function Stat({ label, value, sub, align = "left" }: { label: string; value: string; sub: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1.5 text-3xl font-medium tracking-tight">{value}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{sub}</p>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-line ${className}`} />;
}

const row = "font-mono text-[11px] uppercase tracking-wider";

export function MintPanel() {
  const { data, isLoading, isError, refetch } = useCollection();
  const { isConnected, remaining } = useWalletAllowance();
  const { chainId } = useAccount();
  const qc = useQueryClient();
  const tx = useMint(() => {
    qc.invalidateQueries();
  });
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <aside id="mint" className="scroll-mt-6 space-y-6 rounded-sm border border-line bg-panel p-6 sm:p-7">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </aside>
    );
  }

  if (isError || !data) {
    return (
      <aside id="mint" className="scroll-mt-6 rounded-sm border border-line bg-panel p-6 sm:p-7">
        <p className={`${row} text-danger`}>Couldn&apos;t read the contract</p>
        <p className="mt-3 text-muted">Check your connection and try again.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-5 w-full rounded-sm border border-line px-4 py-3 text-sm hover:border-muted"
        >
          Retry
        </button>
      </aside>
    );
  }

  const { price, maxSupply, maxPerWallet, minted, remainingSupply, mintingEnabled, paused } = data;

  const statusLabel = paused
    ? "Minting is paused"
    : remainingSupply === 0n
      ? "Sold out"
      : !mintingEnabled
        ? "Minting not open yet"
        : "Public mint is live";
  const canMint = statusLabel === "Public mint is live";

  const walletLeft = isConnected && remaining !== undefined ? Number(remaining) : Number(maxPerWallet);
  const maxQty = Math.max(0, Math.min(Number(maxPerWallet), walletLeft, Number(remainingSupply)));
  const qty = Math.min(quantity, Math.max(1, maxQty));

  const pct = Number((minted * 1000n) / maxSupply) / 10;
  const total = formatEther(price * BigInt(qty));

  const walletMaxed = isConnected && remaining !== undefined && remaining === 0n;
  const wrongChain = isConnected && chainId !== sepolia.id;
  const busy = tx.phase === "wallet" || tx.phase === "confirming";
  const canClick = canMint && !walletMaxed && !busy && maxQty > 0;

  const buttonLabel =
    tx.phase === "wallet" ? "Confirm in your wallet…" : tx.phase === "confirming" ? "Minting…" : "Mint Jojo";

  return (
    <aside id="mint" className="scroll-mt-6 rounded-sm border border-line bg-panel p-6 sm:p-7">
      <div className={`flex items-center justify-between ${row}`}>
        <span className={`flex items-center gap-2 ${canMint ? "text-accent" : "text-muted"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${canMint ? "bg-accent" : "bg-muted"}`} />
          {statusLabel}
        </span>
        <span className="text-muted">Sepolia</span>
      </div>

      <h2 className="mt-5 text-3xl font-medium tracking-tight">Claim your Jojo.</h2>
      <p className="mt-2 text-muted">One of {maxSupply.toString()}. Entirely your own.</p>

      <div className="mt-7 grid grid-cols-2 gap-4 border-b border-line pb-6">
        <Stat label="Mint price" value={`${formatEther(price)} ETH`} sub="+ network gas" />
        <Stat label="Per wallet" value={`${maxPerWallet.toString()} max.`} sub="ERC-721" align="right" />
      </div>

      <div className="mt-5">
        <div className={`flex justify-between ${row}`}>
          <span className="text-muted">
            {minted.toString()} / {maxSupply.toString()} minted
          </span>
          <span className="text-accent">{pct.toFixed(1)}%</span>
        </div>
        <div
          className="mt-2.5 h-1.5 w-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={Number(maxSupply)}
          aria-valuenow={Number(minted)}
          aria-label="Mint progress"
        >
          <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className={`mt-2 ${row} text-muted`}>{remainingSupply.toString()} remaining</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center border border-line">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="h-11 w-11 text-lg text-muted transition-colors hover:text-fg disabled:opacity-30"
          >
            −
          </button>
          <span className="w-10 text-center font-mono text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(maxQty, qty + 1))}
            disabled={qty >= maxQty}
            aria-label="Increase quantity"
            className="h-11 w-11 text-lg text-muted transition-colors hover:text-fg disabled:opacity-30"
          >
            +
          </button>
        </div>
        <div className="text-right">
          <p className={`${row} text-muted`}>Total</p>
          <p className="mt-0.5 text-xl font-medium tabular-nums">{total} ETH</p>
        </div>
      </div>

      {isConnected && remaining !== undefined && (
        <p className={`mt-4 ${row} text-muted`}>
          Your allowance: <span className="text-fg">{remaining.toString()}</span> of {maxPerWallet.toString()} left
        </p>
      )}

      <div className="mt-5 space-y-2.5">
        {!isConnected || wrongChain ? (
          <>
            <ConnectWalletButton variant="panel" />
            <p className={`pt-1 text-center ${row} text-muted`}>Connect your wallet to enable minting</p>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={!canClick}
              onClick={() => tx.mint(qty, price)}
              className="w-full rounded-sm bg-accent px-4 py-3.5 text-sm font-medium text-accent-fg transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-line/60 disabled:text-muted"
            >
              {buttonLabel}
            </button>

            {tx.phase === "idle" && (
              <p className={`pt-1 text-center ${row} text-muted`}>
                {walletMaxed
                  ? "You've used your full wallet allowance"
                  : !canMint
                    ? statusLabel
                    : `${total} ETH + gas`}
              </p>
            )}

            {tx.phase === "confirming" && tx.hash && (
              <p className={`pt-1 text-center ${row} text-muted`}>
                Waiting for confirmation ·{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg underline"
                >
                  View on Etherscan ↗
                </a>
              </p>
            )}

            {tx.phase === "success" && tx.hash && (
              <div className="border border-accent/40 bg-accent/5 p-3 text-center">
                <p className="text-sm text-accent">Minted successfully 🎉</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-1 inline-block ${row} text-fg underline`}
                >
                  View transaction ↗
                </a>
              </div>
            )}

            {tx.phase === "failed" && (
              <div className="border border-danger/40 bg-danger/5 p-3 text-center">
                <p className="text-sm text-danger">{tx.errorMessage}</p>
                <button type="button" onClick={tx.reset} className={`mt-1 ${row} text-muted underline hover:text-fg`}>
                  Dismiss
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}