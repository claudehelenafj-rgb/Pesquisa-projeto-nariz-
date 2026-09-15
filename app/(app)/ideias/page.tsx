import Link from "next/link";
import { getAllIdeas, getDistinctEixos } from "@/lib/queries/ideas";
import { STATUS_IDEIA } from "@/lib/types";
import { PersonInline } from "@/components/GenerationBadge";
import { IdeaStatusSelect } from "./IdeaStatusSelect";

export default async function IdeiasPage({
  searchParams,
}: {
  searchParams: { eixo?: string };
}) {
  const eixo = searchParams.eixo || "";
  const ideias = getAllIdeas(eixo || undefined);
  const eixos = getDistinctEixos();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-ink">Banco de Ideias</h1>
        <div className="flex gap-2">
          <Link href="/api/export/ideias" className="btn-secondary">
            Exportar CSV
          </Link>
          <Link href="/ideias/nova" className="btn-primary">
            + Nova ideia
          </Link>
        </div>
      </div>

      <form className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label">Eixo temático</label>
          <select name="eixo" defaultValue={eixo} className="input">
            <option value="">Todos</option>
            {eixos.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Filtrar
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-4">
        {STATUS_IDEIA.map((col) => (
          <div key={col.value} className="flex flex-col gap-3">
            <h2 className="rounded-full bg-brand-ink/5 px-3 py-1.5 text-center text-sm font-bold text-brand-ink/70">
              {col.label} · {ideias.filter((i) => i.status === col.value).length}
            </h2>
            <div className="flex flex-1 flex-col gap-3">
              {ideias
                .filter((i) => i.status === col.value)
                .map((idea) => (
                  <div key={idea.id} className="card p-4">
                    <Link href={`/ideias/${idea.id}`} className="font-bold text-brand-ink hover:underline">
                      {idea.titulo}
                    </Link>
                    {idea.eixo_tematico && <div className="mt-1 tag">{idea.eixo_tematico}</div>}
                    {idea.proposta_por_nome && (
                      <div className="mt-2 text-xs text-brand-ink/50">
                        <PersonInline
                          nome={idea.proposta_por_nome}
                          geracao={idea.proposta_por_geracao}
                          cor={idea.proposta_por_cor}
                        />
                      </div>
                    )}
                    {idea.participantes.length > 0 && (
                      <div className="mt-2 text-xs text-brand-ink/40">
                        {idea.participantes.length} participante(s)
                      </div>
                    )}
                    <div className="mt-3">
                      <IdeaStatusSelect ideaId={idea.id} status={idea.status} />
                    </div>
                  </div>
                ))}
              {ideias.filter((i) => i.status === col.value).length === 0 && (
                <p className="text-center text-xs text-brand-ink/30">Vazio</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
