"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { friendlyError } from "@/lib/errors";

type Phase = "idle" | "wallet" | "confirming" | "success" | "failed";

export function useAdminTx() {
  const qc = useQueryClient();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const reverted = receipt.data?.status === "reverted";
  const succeeded = receipt.isSuccess && !reverted;

  useEffect(() => {
    if (succeeded) qc.invalidateQueries();
  }, [succeeded, qc]);

  let phase: Phase = "idle";
  if (isPending) phase = "wallet";
  else if (error || reverted || receipt.isError) phase = "failed";
  else if (succeeded) phase = "success";
  else if (hash) phase = "confirming";

  const errorMessage = error
    ? friendlyError(error)
    : reverted || receipt.isError
      ? "The transaction failed on-chain."
      : null;

  function send(fn: (w: typeof writeContract) => void) {
    reset();
    fn(writeContract);
  }

  return { send, reset, phase, hash, errorMessage, busy: phase === "wallet" || phase === "confirming" };
}

export type AdminTx = ReturnType<typeof useAdminTx>;