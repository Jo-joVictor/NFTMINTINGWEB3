"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" />
      <path d="M16 13h2" />
    </svg>
  );
}

type Variant = "header" | "panel";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const styles: Record<Variant, string> = {
  header:
    "border border-line bg-panel px-4 py-2.5 text-sm text-fg hover:border-muted",
  panel:
    "w-full bg-accent px-4 py-3.5 text-sm text-accent-fg hover:brightness-95",
};

export function ConnectWalletButton({ variant = "header" }: { variant?: Variant }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        // `mounted` avoids a hydration mismatch: the server can't know wallet state
        const connected = mounted && account && chain;
        const cls = `${base} ${styles[variant]}`;

        if (!mounted) {
          return <div aria-hidden className={`${cls} opacity-0 pointer-events-none`}>Connect wallet</div>;
        }

        if (!connected) {
          return (
            <button type="button" onClick={openConnectModal} className={cls}>
              Connect wallet <WalletIcon />
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className={`${base} ${
                variant === "panel" ? "w-full px-4 py-3.5" : "px-4 py-2.5"
              } bg-danger text-sm text-accent-fg hover:brightness-95`}
            >
              Wrong network — switch to Sepolia
            </button>
          );
        }

        return (
          <button type="button" onClick={openAccountModal} className={cls}>
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-[13px]">{account.displayName}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}