"use client";

import { useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, nftMinterAbi } from "@/lib/contract";

const base = { address: CONTRACT_ADDRESS, abi: nftMinterAbi } as const;

export function useCollection() {
  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      { ...base, functionName: "mintPrice" },
      { ...base, functionName: "MAX_SUPPLY" },
      { ...base, functionName: "MAX_PER_WALLET" },
      { ...base, functionName: "totalMinted" },
      { ...base, functionName: "mintingEnabled" },
      { ...base, functionName: "paused" },
      { ...base, functionName: "revealed" },
      { ...base, functionName: "owner" },
    ],
    // Poll so the progress bar moves as other people mint
    query: { refetchInterval: 15_000 },
  });

  // Each entry is { status, result }; we only expose values when all succeeded
  const ok = data?.every((r) => r.status === "success");

  if (!ok) {
    return { isLoading, isError: isError || (!!data && !ok), refetch, data: null };
  }

  const [price, maxSupply, maxPerWallet, minted, mintingEnabled, paused, revealed, owner] =
    data.map((r) => r.result) as [bigint, bigint, bigint, bigint, boolean, boolean, boolean, `0x${string}`];

  return {
    isLoading: false,
    isError: false,
    refetch,
    data: {
      price,
      maxSupply,
      maxPerWallet,
      minted,
      remainingSupply: maxSupply - minted,
      mintingEnabled,
      paused,
      revealed,
      owner,
    },
  };
}