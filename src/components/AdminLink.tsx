"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useCollection } from "@/hooks/useCollection";

export function AdminLink() {
  const { address } = useAccount();
  const { data } = useCollection();

  if (!address || !data || address.toLowerCase() !== data.owner.toLowerCase()) return null;

  return (
    <Link href="/admin" className="text-accent transition-opacity hover:opacity-80">
      Admin
    </Link>
  );
}