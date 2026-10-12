"use client";

import { useEffect, useState } from "react";
import { useNftMetadata } from "@/hooks/useNftMetadata";
import { GATEWAYS, ipfsToHttp } from "@/lib/ipfs";

export function ArtworkCard() {
  const { revealed, metadata, isLoading, isError, refetch } = useNftMetadata();
  const [gateway, setGateway] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setGateway(0);
    setLoaded(false);
    setBroken(false);
  }, [metadata?.image]);

  function handleImageError() {
    if (gateway < GATEWAYS.length - 1) setGateway((g) => g + 1);
    else setBroken(true);
  }

  const failed = isError || broken;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-line bg-panel lg:aspect-auto lg:min-h-[560px]">
      {isLoading && <div className="absolute inset-0 animate-pulse bg-line/60" />}

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-danger">
            Couldn&apos;t load the artwork
          </p>
          <button
            type="button"
            onClick={() => {
              setBroken(false);
              setGateway(0);
              refetch();
            }}
            className="border border-line px-4 py-2 text-sm hover:border-muted"
          >
            Retry
          </button>
        </div>
      )}

      {metadata?.image && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${metadata.image}-${gateway}`}
          src={ipfsToHttp(metadata.image, gateway)}
          alt={metadata.name}
          onLoad={() => setLoaded(true)}
          onError={handleImageError}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 border border-line/80 bg-bg/80 p-4 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
            Jojo NFT / Shared artwork
          </p>
          {metadata ? (
            <p className="mt-1 truncate text-lg">{metadata.name}</p>
          ) : (
            <div className="mt-2 h-5 w-40 animate-pulse bg-line" />
          )}
        </div>
        <p className="hidden shrink-0 text-right font-mono text-[11px] uppercase leading-relaxed tracking-wider text-muted sm:block">
          Status / {revealed ? "Revealed" : "Sealed"}
          <br />
          Standard / ERC-721
        </p>
      </div>
    </div>
  );
}