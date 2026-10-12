import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Jojo NFT",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
    "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [sepolia], // Sepolia only
  transports: {
    // http(undefined) falls back to the chain's public RPC
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || undefined),
  },
  ssr: true, // required for Next.js App Router to avoid hydration mismatches
});