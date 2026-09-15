import { requireRestricted } from "@/lib/auth";
import { getProductionReport } from "@/lib/queries/restricted";
import { GenerationBadge } from "@/components/GenerationBadge";
import Link from "next/link";

export default async function RelatorioPage() {
  await requireRestricted();
  const report = getProductionReport();

  const semProducao = report.filter((r) => r.total === 0);
  const sobrecarregados = [...report]
    .filter((r) => r.trabalhosAtivos >= 3)
    .sort((a, b) => b.trabalhosAtivos - a.trabalhosAtivos);

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-brand-ink">Relatório de produção</h1>
      <p className="mb-6 text-sm text-brand-ink/50">
        Quem produziu quanto, quem nunca apresentou nada e quem está com muitos trabalhos ativos ao
        mesmo tempo.
      </p>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-bold text-brand-coral">Nunca apresentaram nada ({semProducao.length})</h2>
          <div className="flex flex-wrap gap-2">
            {semProducao.map((r) => (
              <Link key={r.id} href={`/membros/${r.id}`} className="tag bg-brand-coral/10 text-brand-coral">
                {r.nome}
              </Link>
            ))}
            {semProducao.length === 0 && <p className="text-sm text-brand-ink/40">Todo mundo já produziu algo 🎉</p>}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-bold text-yellow-700">Possivelmente sobrecarregados ({sobrecarregados.length})</h2>
          <div className="flex flex-wrap gap-2">
            {sobrecarregados.map((r) => (
              <Link key={r.id} href={`/membros/${r.id}`} className="tag bg-brand-sun/20 text-yellow-700">
                {r.nome} · {r.trabalhosAtivos} trabalhos ativos
              </Link>
            ))}
            {sobrecarregados.length === 0 && (
              <p className="text-sm text-brand-ink/40">Ninguém com 3+ trabalhos ativos no momento.</p>
            )}
          </div>
        </section>
      </div>

      <section className="card overflow-x-auto p-5">
        <h2 className="mb-3 font-bold text-brand-ink">Produção completa por membro</h2>
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              <th className="py-2">Membro</th>
              <th className="py-2">Geração</th>
              <th className="py-2 text-right">Produção total</th>
              <th className="py-2 text-right">Trabalhos ativos</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r) => (
              <tr key={r.id} className="border-t border-brand-ink/5">
                <td className="py-2">
                  <Link href={`/membros/${r.id}`} className="hover:underline">
                    {r.nome}
                  </Link>
                </td>
                <td className="py-2">
                  <GenerationBadge geracao={r.geracao} cor={r.cor} />
                </td>
                <td className="py-2 text-right font-bold">{r.total}</td>
                <td className="py-2 text-right">{r.trabalhosAtivos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
