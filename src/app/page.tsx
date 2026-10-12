import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ArtworkCard } from "@/components/ArtworkCard";
import { MintPanel } from "@/components/MintPanel";
import { WalletPanel } from "@/components/WalletPanel";
import { StatsStrip } from "@/components/StatsStrip";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <Hero />
        <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
          <ArtworkCard />
          <MintPanel />
        </div>
        <WalletPanel />
        <StatsStrip />
      </main>
    </>
  );
}