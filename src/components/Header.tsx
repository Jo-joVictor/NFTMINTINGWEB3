import { ConnectWalletButton } from "./ConnectWalletButton";
import { AdminLink } from "./AdminLink";
import { CONTRACT_ADDRESS } from "@/lib/contract";

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path d="M13 2 24 13 13 24 2 13Z" stroke="#c8ff4d" strokeWidth="2" />
      <path d="M13 8 18 13 13 18 8 13Z" fill="#c8ff4d" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="mx-auto max-w-[1280px] px-5 sm:px-8">
      <div className="flex items-center justify-between border-b border-line py-5">
        <a href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-lg font-medium tracking-wide">JOJO NFT</span>
        </a>

        <div className="flex items-center gap-6 sm:gap-8">
          <nav className="hidden items-center gap-7 font-mono text-xs text-muted md:flex">
            <a href="/#mint" className="transition-colors hover:text-fg">Mint</a>
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-fg"
            >
              Contract ↗
            </a>
            <AdminLink />
          </nav>
          <ConnectWalletButton variant="header" />
        </div>
      </div>
    </header>
  );
}