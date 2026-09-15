import Link from "next/link";
import { requireRestricted } from "@/lib/auth";
import { getProductionByMember } from "@/lib/queries/work-tracking";
import { GenerationBadge } from "@/components/GenerationBadge";

export default async function ProducaoPorMembroPage({
  searchParams,
}: {
  searchParams: { ordem?: string };
}) {
  await requireRestricted();

  const ordem = searchParams.ordem === "asc" ? "asc" : "desc";
  const dados = getProductionByMember().sort((a, b) =>
    ordem === "asc" ? a.totalTrabalhos - b.totalTrabalhos : b.totalTrabalhos - a.totalTrabalhos
  );
  const semTrabalhos = dados.filter((d) => d.totalTrabalhos === 0).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-xl font-extrabold text-brand-ink">Produção por membro</h1>
      <p className="mb-6 text-sm text-brand-ink/50">
        Calculado automaticamente a partir da tabela de{" "}
        <Link href="/restrita/acompanhamento" className="underline">
          Acompanhamento de Trabalhos por Congresso
        </Link>{" "}
        — não é um campo digitado manualmente. {semTrabalhos} membro(s) ainda sem nenhum trabalho.
      </p>

      <div className="card overflow-x-auto p-5">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              <th className="py-2">Membro</th>
              <th className="py-2 text-right">
                <Link href={`?ordem=${ordem === "desc" ? "asc" : "desc"}`} className="hover:underline">
                  Total de trabalhos {ordem === "desc" ? "▾" : "▴"}
                </Link>
              </th>
              <th className="py-2 text-right">Como autor principal</th>
              <th className="py-2 text-right">Como coautor</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {dados.map((m) => (
              <tr key={m.id} className="border-t border-brand-ink/5 align-top">
                <td className="py-2">
                  <Link href={`/membros/${m.id}`} className="flex items-center gap-2 hover:underline">
                    {m.nome}
                    <GenerationBadge geracao={m.geracao} cor={m.cor} />
                  </Link>
                </td>
                <td className="py-2 text-right font-bold text-brand-ink">{m.totalTrabalhos}</td>
                <td className="py-2 text-right text-brand-ink/60">{m.comoAutorPrincipal}</td>
                <td className="py-2 text-right text-brand-ink/60">{m.comoCoautor}</td>
                <td className="py-2 text-right">
                  {m.trabalhos.length > 0 && (
                    <details>
                      <summary className="cursor-pointer text-xs font-semibold text-brand-teal">
                        ver trabalhos
                      </summary>
                      <ul className="mt-2 space-y-1 text-left text-xs text-brand-ink/60">
                        {m.trabalhos.map((t) => (
                          <li key={`${t.trackingId}-${t.papel}`}>
                            {t.nomeTrabalho || "(sem nome)"}
                            {t.congressoNome && <span className="text-brand-ink/40"> · {t.congressoNome}</span>}{" "}
                            <span className="tag">
                              {t.papel === "autor_principal" ? "autor principal" : "coautor"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dados.length === 0 && (
          <p className="text-sm text-brand-ink/40">Nenhum membro cadastrado.</p>
        )}
      </div>
    </div>
  );
}
