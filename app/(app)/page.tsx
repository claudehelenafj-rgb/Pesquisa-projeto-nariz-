import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-ink">Olá, {user.nome || user.username} 👋</h1>
      <p className="mt-2 text-sm text-brand-ink/60">Dashboard em construção — próxima etapa.</p>
    </div>
  );
}
