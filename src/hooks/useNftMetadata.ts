"use client";

import { useQuery } from "@tanstack/react-query";
import { useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, nftMinterAbi } from "@/lib/contract";
import { GATEWAYS, ipfsToHttp } from "@/lib/ipfs";

const base = { address: CONTRACT_ADDRESS, abi: nftMinterAbi } as const;

export type Metadata = { name: string; description: string; image: string };

export async function fetchMetadata(uri: string): Promise<Metadata> {
  let lastError: unknown;
  for (let i = 0; i < GATEWAYS.length; i++) {
    try {
      const res = await fetch(ipfsToHttp(uri, i), { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return {
        name: json.name ?? "Jojo NFT",
        description: json.description ?? "",
        image: json.image ?? "",
      };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

export function useNftMetadata() {
  const { data } = useReadContracts({
    contracts: [
      { ...base, functionName: "revealed" },
      { ...base, functionName: "hiddenMetadataURI" },
      { ...base, functionName: "revealedMetadataURI" },
    ],
    query: { refetchInterval: 15_000 },
  });

  const revealed = data?.[0].result as boolean | undefined;
  const hiddenUri = data?.[1].result as string | undefined;
  const revealedUri = data?.[2].result as string | undefined;
  const uri = revealed ? revealedUri : hiddenUri;

  const query = useQuery({
    queryKey: ["nft-metadata", uri],
    queryFn: () => fetchMetadata(uri!),
    enabled: !!uri,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    revealed: !!revealed,
    metadata: query.data,
    isLoading: !uri || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}