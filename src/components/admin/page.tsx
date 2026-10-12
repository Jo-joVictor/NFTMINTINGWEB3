import { Header } from "@/components/Header";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = { title: "Admin — Jojo NFT" };

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] px-5 pb-16 sm:px-8">
        <AdminDashboard />
      </main>
    </>
  );
}