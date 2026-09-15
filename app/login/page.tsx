import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-coral text-2xl">
            🔴
          </div>
          <h1 className="text-2xl font-extrabold text-brand-ink">Projeto Nariz</h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            Sistema interno de organização de pesquisa
          </p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-brand-ink/40">
          Acesso restrito aos membros do grupo. Em caso de dúvida, procure a coordenação.
        </p>
      </div>
    </main>
  );
}
