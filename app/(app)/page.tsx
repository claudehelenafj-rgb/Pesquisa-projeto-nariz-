import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getCalendarItems,
  getWorksStatusCounts,
  getStalledWorks,
  getNewIdeasThisWeek,
  getProductionByGeneration,
  getCounts,
} from "@/lib/queries/dashboard";
import { STATUS_TRABALHO } from "@/lib/types";
import { GenerationBarChart } from "@/components/GenerationBarChart";

export default async function DashboardPage() {
  const user = await requireUser();
  const proximosPrazos = getCalendarItems().filter((i) => i.diasRestantes >= 0).slice(0, 6);
  const statusCounts = getWorksStatusCounts();
  const parados = getStalledWorks(20).slice(0, 5);
  const novasIdeias = getNewIdeasThisWeek();
  const producao = getProductionByGeneration();
  const counts = getCounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-ink">Olá, {user.nome || user.username} 👋</h1>
        <p className="text-sm text-brand-ink/50">Visão geral da pesquisa do Projeto Nariz.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Membros" value={counts.membros} href="/membros" />
        <StatCard label="Congressos" value={counts.congressos} href="/congressos" />
        <StatCard label="Ideias" value={counts.ideias} href="/ideias" />
        <StatCard label="Trabalhos" value={counts.trabalhos} href="/trabalhos" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-brand-ink">⏰ Próximos prazos</h2>
            <Link href="/calendario" className="text-xs font-semibold text-brand-coral">
              ver calendário
            </Link>
          </div>
          <ul className="space-y-2">
            {proximosPrazos.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-2 rounded-xl bg-brand-cream px-3 py-2 text-sm hover:bg-brand-cream/70"
                >
                  <span className="truncate">{item.titulo}</span>
                  <span
                    className={`shrink-0 font-bold ${item.diasRestantes <= 7 ? "text-brand-coral" : item.diasRestantes <= 30 ? "text-yellow-700" : "text-brand-ink/40"}`}
                  >
                    {item.diasRestantes === 0 ? "hoje" : `${item.diasRestantes}d`}
                  </span>
                </Link>
              </li>
            ))}
            {proximosPrazos.length === 0 && (
              <p className="text-sm text-brand-ink/40">Nenhum prazo futuro cadastrado.</p>
            )}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-bold text-brand-ink">📊 Trabalhos por status</h2>
          <ul className="space-y-2">
            {STATUS_TRABALHO.map((s) => (
              <li key={s.value} className="flex items-center justify-between text-sm">
                <span className="text-brand-ink/70">{s.label}</span>
                <span className="font-bold text-brand-ink">{statusCounts[s.value]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-brand-ink">💡 Ideias novas da semana</h2>
            <Link href="/ideias" className="text-xs font-semibold text-brand-coral">
              ver banco de ideias
            </Link>
          </div>
          <ul className="space-y-2">
            {novasIdeias.map((idea) => (
              <li key={idea.id}>
                <Link
                  href={`/ideias/${idea.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl bg-brand-cream px-3 py-2 text-sm hover:bg-brand-cream/70"
                >
                  <span className="truncate">{idea.titulo}</span>
                  {idea.eixo_tematico && <span className="tag shrink-0">{idea.eixo_tematico}</span>}
                </Link>
              </li>
            ))}
            {novasIdeias.length === 0 && (
              <p className="text-sm text-brand-ink/40">Nenhuma ideia nova nos últimos 7 dias.</p>
            )}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-bold text-brand-ink">🧑‍🤝‍🧑 Produção por geração</h2>
          <GenerationBarChart data={producao} />
        </section>
      </div>

      {parados.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-3 font-bold text-brand-ink">🐢 Trabalhos parados há mais de 20 dias</h2>
          <ul className="space-y-2">
            {parados.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/trabalhos/${w.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl bg-brand-coral/5 px-3 py-2 text-sm hover:bg-brand-coral/10"
                >
                  <span className="truncate">{w.titulo}</span>
                  <span className="shrink-0 font-bold text-brand-coral">{w.dias} dias parado</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card p-4 text-center transition hover:shadow-md">
      <div className="text-2xl font-extrabold text-brand-coral">{value}</div>
      <div className="text-xs font-medium text-brand-ink/50">{label}</div>
    </Link>
  );
}
