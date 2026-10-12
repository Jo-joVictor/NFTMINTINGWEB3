"use client";

import { useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, nftMinterAbi } from "@/lib/contract";
import { friendlyError } from "@/lib/errors";

export type MintPhase = "idle" | "wallet" | "confirming" | "success" | "failed";

export function useMint(onSuccess: () => void) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const reverted = receipt.data?.status === "reverted";
  const succeeded = receipt.isSuccess && !reverted;

  useEffect(() => {
    if (succeeded) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [succeeded]);

  let phase: MintPhase = "idle";
  if (isPending) phase = "wallet";
  else if (error || reverted || receipt.isError) phase = "failed";
  else if (succeeded) phase = "success";
  else if (hash) phase = "confirming";

  const errorMessage = error
    ? friendlyError(error)
    : reverted || receipt.isError
      ? "The transaction failed on-chain. You weren't charged for the mint."
      : null;

  function mint(quantity: number, price: bigint) {
    reset();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: nftMinterAbi,
      functionName: "mint",
      args: [BigInt(quantity)],
      value: price * BigInt(quantity), // contract requires the exact amount
    });
  }

  return { mint, reset, phase, hash, errorMessage };
}