import { requireUser } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <NavBar user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t border-brand-ink/10 py-4 text-center text-xs text-brand-ink/40">
        Projeto Nariz — Humanização e Palhaçoterapia · Unifor · uso interno
      </footer>
    </div>
  );
}
