"use client";

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, nftMinterAbi } from "@/lib/contract";
import { useCollection } from "./useCollection";

const base = { address: CONTRACT_ADDRESS, abi: nftMinterAbi } as const;

export function useWalletNfts() {
  const { address, isConnected } = useAccount();
  const { data: col } = useCollection();
  const minted = col ? Number(col.minted) : 0;
  const user = address as `0x${string}`;

  const stats = useReadContracts({
    contracts: [
      { ...base, functionName: "balanceOf", args: [user] },
      { ...base, functionName: "walletMintCount", args: [user] },
      { ...base, functionName: "remainingWalletMints", args: [user] },
    ],
    query: { enabled: !!address, refetchInterval: 15_000 },
  });

  const [balance, mintedByYou, allowanceLeft] = (stats.data ?? []).map((r) =>
    r.status === "success" ? (r.result as bigint) : undefined,
  );

  const ids = useMemo(() => Array.from({ length: minted }, (_, i) => BigInt(i + 1)), [minted]);
  const hasBalance = (balance ?? 0n) > 0n;

  const owners = useReadContracts({
    contracts: ids.map((id) => ({ ...base, functionName: "ownerOf" as const, args: [id] as const })),
    query: { enabled: !!address && hasBalance && minted > 0 },
  });

  const owned = (owners.data ?? []).flatMap((r, i) =>
    r.status === "success" && (r.result as string).toLowerCase() === address?.toLowerCase() ? [ids[i]] : [],
  );

  return {
    address,
    isConnected,
    balance,
    mintedByYou,
    allowanceLeft,
    owned,
    isLoading: stats.isLoading || (hasBalance && owners.isLoading),
  };
}