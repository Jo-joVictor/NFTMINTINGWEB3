"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";
import { formatEther, parseEther } from "viem";
import { ConnectWalletButton } from "../ConnectWalletButton";
import { useCollection } from "@/hooks/useCollection";
import { useAdminTx, type AdminTx } from "@/hooks/useAdminTx";
import { fetchMetadata } from "@/hooks/useNftMetadata";
import { CONTRACT_ADDRESS, nftMinterAbi, REVEALED_METADATA_URI } from "@/lib/contract";
import { GATEWAYS, ipfsToHttp } from "@/lib/ipfs";

type Data = NonNullable<ReturnType<typeof useCollection>["data"]>;

const btn = "rounded-sm px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40";
const primary = `${btn} bg-accent text-accent-fg hover:brightness-95`;
const outline = `${btn} border border-line text-fg hover:border-muted`;
const danger = `${btn} bg-danger text-accent-fg hover:brightness-95`;
const input = "w-full border border-line bg-bg px-3 py-3 font-mono text-sm outline-none focus:border-accent";
const row = "font-mono text-[11px] uppercase tracking-wider";
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function Card({ title, desc, children, className = "" }: { title: string; desc: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-sm border border-line bg-panel p-6 ${className}`}>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-muted">{desc}</p>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: "accent" | "danger" }) {
  return (
    <div className="rounded-sm border border-line bg-panel p-5">
      <p className={`${row} text-muted`}>{label}</p>
      <p className={`mt-2 text-2xl font-medium tabular-nums ${tone === "accent" ? "text-accent" : tone === "danger" ? "text-danger" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function TxStatus({ tx, successText }: { tx: AdminTx; successText: string }) {
  if (tx.phase === "idle") return null;
  const link = tx.hash && (
    <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="underline">
      View on Etherscan ↗
    </a>
  );
  if (tx.phase === "wallet") return <p className={`${row} text-muted`}>Confirm in your wallet…</p>;
  if (tx.phase === "confirming") return <p className={`${row} text-muted`}>Waiting for confirmation · {link}</p>;
  if (tx.phase === "success")
    return (
      <p className={`${row} text-accent`}>
        {successText} · {link}
      </p>
    );
  return (
    <div className="border border-danger/40 bg-danger/5 p-3">
      <p className="text-sm text-danger">{tx.errorMessage}</p>
      <button type="button" onClick={tx.reset} className={`${row} mt-1 text-muted underline hover:text-fg`}>
        Dismiss
      </button>
    </div>
  );
}

function MintingCard({ data }: { data: Data }) {
  const tx = useAdminTx();
  return (
    <Card title="Public minting" desc={`Opens or closes the public mint. Currently ${data.mintingEnabled ? "open" : "closed"}.`}>
      <button
        type="button"
        disabled={tx.busy}
        className={data.mintingEnabled ? outline : primary}
        onClick={() =>
          tx.send((w) =>
            w({ address: CONTRACT_ADDRESS, abi: nftMinterAbi, functionName: "setMintingEnabled", args: [!data.mintingEnabled] }),
          )
        }
      >
        {data.mintingEnabled ? "Disable minting" : "Enable minting"}
      </button>
      <TxStatus tx={tx} successText="Minting status updated" />
    </Card>
  );
}

function PauseCard({ data }: { data: Data }) {
  const tx = useAdminTx();
  const fn = data.paused ? "unpause" : "pause";
  return (
    <Card title="Emergency pause" desc="Pausing blocks all minting immediately. Withdraw and reveal still work.">
      <button
        type="button"
        disabled={tx.busy}
        className={data.paused ? primary : danger}
        onClick={() => tx.send((w) => w({ address: CONTRACT_ADDRESS, abi: nftMinterAbi, functionName: fn }))}
      >
        {data.paused ? "Unpause contract" : "Pause contract"}
      </button>
      <TxStatus tx={tx} successText={data.paused ? "Unpaused" : "Paused"} />
    </Card>
  );
}

function PriceCard({ data }: { data: Data }) {
  const tx = useAdminTx();
  const [value, setValue] = useState("");

  let parsed: bigint | null = null;
  try {
    if (value.trim()) parsed = parseEther(value.trim());
  } catch {
    parsed = null;
  }
  const valid = parsed !== null && parsed > 0n && parsed !== data.price;

  return (
    <Card title="Mint price" desc={`Current price: ${formatEther(data.price)} ETH per NFT.`}>
      <div className="flex gap-2">
        <input
          className={input}
          inputMode="decimal"
          placeholder={formatEther(data.price)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="New mint price in ETH"
        />
        <span className="flex items-center font-mono text-sm text-muted">ETH</span>
      </div>
      {value.trim() && parsed === null && <p className="text-sm text-danger">Enter a valid ETH amount.</p>}
      <button
        type="button"
        disabled={!valid || tx.busy}
        className={primary}
        onClick={() =>
          tx.send((w) => w({ address: CONTRACT_ADDRESS, abi: nftMinterAbi, functionName: "setMintPrice", args: [parsed!] }))
        }
      >
        Update price
      </button>
      <TxStatus tx={tx} successText="Price updated" />
    </Card>
  );
}

function WithdrawCard({ balance, owner }: { balance: bigint; owner: string }) {
  const tx = useAdminTx();
  return (
    <Card title="Withdraw proceeds" desc={`Contract balance: ${formatEther(balance)} ETH. Funds go to the owner address ${short(owner)}.`}>
      <button
        type="button"
        disabled={balance === 0n || tx.busy}
        className={primary}
        onClick={() => tx.send((w) => w({ address: CONTRACT_ADDRESS, abi: nftMinterAbi, functionName: "withdraw" }))}
      >
        {balance === 0n ? "Nothing to withdraw" : `Withdraw ${formatEther(balance)} ETH`}
      </button>
      <TxStatus tx={tx} successText="Withdrawn" />
    </Card>
  );
}

function RevealCard({ data }: { data: Data }) {
  const tx = useAdminTx();
  const [uri, setUri] = useState(REVEALED_METADATA_URI);
  const [gw, setGw] = useState(0);
  const [img, setImg] = useState<"loading" | "ok" | "bad">("loading");
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const clean = uri.trim();
  const valid = /^ipfs:\/\/\S+$/.test(clean);

  const preview = useQuery({
    queryKey: ["reveal-preview", clean],
    queryFn: () => fetchMetadata(clean),
    enabled: valid && !data.revealed,
    retry: false,
    staleTime: Infinity,
  });

  const ready = valid && preview.isSuccess && !!preview.data.image && img === "ok";

  if (data.revealed) {
    return (
      <Card className="mt-5" title="Reveal collection" desc="The collection is already revealed. This can't be changed.">
        <TxStatus tx={tx} successText="Collection revealed" />
      </Card>
    );
  }

  return (
    <Card className="mt-5 border-danger/30" title="Reveal collection" desc="Replaces the hidden artwork on every token. This can only be done once.">
      <div className="border border-danger/40 bg-danger/5 p-4 text-sm">
        <p className="font-medium text-danger">Irreversible.</p>
        <p className="mt-1 text-muted">
          The contract has no function to change the revealed URI afterwards. That is why the preview below must load before
          you can continue.
        </p>
      </div>

      <label className={`block ${row} text-muted`} htmlFor="reveal-uri">
        Revealed metadata URI
      </label>
      <input
        id="reveal-uri"
        className={input}
        value={uri}
        onChange={(e) => {
          setUri(e.target.value);
          setGw(0);
          setImg("loading");
        }}
        placeholder="ipfs://…"
      />

      <div className="flex gap-4 border border-line bg-bg p-3">
        <div className="relative h-24 w-24 shrink-0 bg-line/50">
          {preview.isSuccess && preview.data.image && img !== "bad" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${clean}-${gw}`}
              src={ipfsToHttp(preview.data.image, gw)}
              alt="Reveal preview"
              onLoad={() => setImg("ok")}
              onError={() => (gw < GATEWAYS.length - 1 ? setGw(gw + 1) : setImg("bad"))}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {preview.isFetching && <div className="absolute inset-0 animate-pulse bg-line" />}
        </div>
        <div className="min-w-0 text-sm">
          {!valid && <p className="text-danger">URI must start with ipfs://</p>}
          {valid && preview.isFetching && <p className="text-muted">Loading metadata from IPFS…</p>}
          {valid && preview.isError && <p className="text-danger">Couldn&apos;t load this metadata. Don&apos;t reveal until it loads.</p>}
          {preview.isSuccess && (
            <>
              <p className="truncate font-medium">{preview.data.name}</p>
              <p className="mt-1 line-clamp-2 text-muted">{preview.data.description || "No description"}</p>
              {!preview.data.image && <p className="mt-1 text-danger">Metadata has no image field.</p>}
              {img === "bad" && <p className="mt-1 text-danger">The image failed to load.</p>}
              {img === "ok" && <p className={`mt-1 ${row} text-accent`}>Preview OK</p>}
            </>
          )}
        </div>
      </div>

      <button type="button" disabled={!ready || tx.busy} className={danger} onClick={() => setOpen(true)}>
        Reveal collection…
      </button>
      <TxStatus tx={tx} successText="Collection revealed" />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md border border-danger/50 bg-panel p-6">
            <h4 className="text-xl font-medium">Reveal the collection?</h4>
            <p className="mt-3 text-sm text-muted">
              This calls <span className="font-mono text-fg">reveal()</span> once and permanently sets this URI for every token:
            </p>
            <p className="mt-2 break-all border border-line bg-bg p-2 font-mono text-xs">{clean}</p>
            <p className="mt-3 text-sm text-danger">There is no undo.</p>

            <label htmlFor="confirm-reveal" className={`mt-5 block ${row} text-muted`}>
              Type REVEAL to confirm
            </label>
            <input
              id="confirm-reveal"
              className={`${input} mt-2`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
            />

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className={`${outline} flex-1`}
                onClick={() => {
                  setOpen(false);
                  setTyped("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={typed !== "REVEAL" || tx.busy}
                className={`${danger} flex-1`}
                onClick={() => {
                  tx.send((w) => w({ address: CONTRACT_ADDRESS, abi: nftMinterAbi, functionName: "reveal", args: [clean] }));
                  setOpen(false);
                  setTyped("");
                }}
              >
                Reveal permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function Dashboard({ data }: { data: Data }) {
  const { data: bal } = useBalance({ address: CONTRACT_ADDRESS, query: { refetchInterval: 15_000 } });
  const balance = bal?.value ?? 0n;
  const state = data.paused ? "Paused" : data.mintingEnabled ? "Live" : "Closed";

  return (
    <div className="pt-8">
      <p className={`${row} text-accent`}>Owner dashboard</p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight sm:text-5xl">Control room</h1>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Contract balance" value={`${formatEther(balance)} ETH`} />
        <Tile label="Mint price" value={`${formatEther(data.price)} ETH`} />
        <Tile label="Minted" value={`${data.minted.toString()} / ${data.maxSupply.toString()}`} />
        <Tile
          label="State"
          value={`${state}${data.revealed ? " · Revealed" : ""}`}
          tone={state === "Live" ? "accent" : state === "Paused" ? "danger" : undefined}
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <MintingCard data={data} />
        <PauseCard data={data} />
        <PriceCard data={data} />
        <WithdrawCard balance={balance} owner={data.owner} />
      </div>

      <RevealCard data={data} />
    </div>
  );
}

function Gate({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-sm border border-line bg-panel p-8 text-center">
      <h1 className="text-2xl font-medium">{title}</h1>
      <div className="mt-3 space-y-4 text-muted">{children}</div>
    </div>
  );
}

export function AdminDashboard() {
  const { address, isConnected, isConnecting, isReconnecting, chainId } = useAccount();
  const { data, isLoading, isError, refetch } = useCollection();

  if (isConnecting || isReconnecting || isLoading) {
    return <div className="mt-16 h-64 animate-pulse rounded-sm bg-panel" />;
  }

  if (!isConnected || !address) {
    return (
      <Gate title="Owner access">
        <p>Connect the contract owner wallet to continue.</p>
        <ConnectWalletButton variant="panel" />
      </Gate>
    );
  }

  if (isError || !data) {
    return (
      <Gate title="Couldn't read the contract">
        <button type="button" onClick={() => refetch()} className={outline}>
          Retry
        </button>
      </Gate>
    );
  }

  if (address.toLowerCase() !== data.owner.toLowerCase()) {
    return (
      <Gate title="Not authorized">
        <p>This area is for the contract owner only.</p>
        <p className="font-mono text-xs">
          Connected: {short(address)}
          <br />
          Owner: {short(data.owner)}
        </p>
      </Gate>
    );
  }

  if (chainId !== sepolia.id) {
    return (
      <Gate title="Wrong network">
        <p>Switch to Sepolia to manage the contract.</p>
        <ConnectWalletButton variant="panel" />
      </Gate>
    );
  }

  return <Dashboard data={data} />;
}