"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, nftMinterAbi } from "@/lib/contract";

export function useWalletAllowance() {
  const { address, isConnected } = useAccount();

  const { data: remaining, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: nftMinterAbi,
    functionName: "remainingWalletMints",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 15_000 },
  });

  return { address, isConnected, remaining, refetch };
}