import Link from "next/link";
import { getAllWorks } from "@/lib/queries/works";
import { getMembersOnly } from "@/lib/queries/people";
import { STATUS_TRABALHO, TIPOS_TRABALHO } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { PersonInline } from "@/components/GenerationBadge";

function daysSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr.replace(" ", "T") + "Z").getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default async function TrabalhosPage({
  searchParams,
}: {
  searchParams: { status?: string; tipo?: string; autor?: string };
}) {
  const status = searchParams.status || "";
  const tipo = searchParams.tipo || "";
  const autorId = searchParams.autor ? Number(searchParams.autor) : undefined;

  const trabalhos = getAllWorks({ status, tipo, autorId });
  const membros = getMembersOnly();

  const statusLabel = Object.fromEntries(STATUS_TRABALHO.map((s) => [s.value, s.label]));
  const tipoLabel = Object.fromEntries(TIPOS_TRABALHO.map((t) => [t.value, t.label]));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-ink">Trabalhos em andamento</h1>
        <div className="flex gap-2">
          <Link href="/api/export/trabalhos" className="btn-secondary">
            Exportar CSV
          </Link>
          <Link href="/trabalhos/novo" className="btn-primary">
            + Novo trabalho
          </Link>
        </div>
      </div>

      <form className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={status} className="input">
            <option value="">Todos</option>
            {STATUS_TRABALHO.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tipo</label>
          <select name="tipo" defaultValue={tipo} className="input">
            <option value="">Todos</option>
            {TIPOS_TRABALHO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Autor principal</label>
          <select name="autor" defaultValue={autorId ?? ""} className="input">
            <option value="">Todos</option>
            {membros.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Filtrar
        </button>
      </form>

      <div className="grid gap-3">
        {trabalhos.map((w) => {
          const parado = daysSince(w.updated_at);
          return (
            <Link
              key={w.id}
              href={`/trabalhos/${w.id}`}
              className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:shadow-md"
            >
              <div>
                <div className="font-bold text-brand-ink">{w.titulo}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-brand-ink/50">
                  <span className="tag">{tipoLabel[w.tipo] ?? w.tipo}</span>
                  {w.autor_nome && (
                    <PersonInline nome={w.autor_nome} geracao={w.autor_geracao} cor={w.autor_cor} />
                  )}
                  {(w.congresso_nome || w.revista_nome) && (
                    <span>→ {w.congresso_nome || w.revista_nome}</span>
                  )}
                  {parado > 20 && !["publicado", "apresentado"].includes(w.status) && (
                    <span className="font-semibold text-brand-coral">parado há {parado} dias</span>
                  )}
                </div>
              </div>
              <StatusBadge status={w.status} label={statusLabel[w.status] ?? w.status} />
            </Link>
          );
        })}
        {trabalhos.length === 0 && (
          <p className="text-sm text-brand-ink/50">Nenhum trabalho encontrado com esses filtros.</p>
        )}
      </div>
    </div>
  );
}
