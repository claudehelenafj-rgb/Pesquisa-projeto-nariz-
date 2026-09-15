import Link from "next/link";
import { getAllCongresses, getDistinctCongressValues } from "@/lib/queries/congresses";
import { getMembersOnly } from "@/lib/queries/people";
import { STATUS_CONGRESSO } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { GenerationDot } from "@/components/GenerationBadge";

export default async function CongressosPage({
  searchParams,
}: {
  searchParams: { status?: string; cidade?: string; area?: string; responsavel?: string };
}) {
  const status = searchParams.status || "";
  const cidade = searchParams.cidade || "";
  const area = searchParams.area || "";
  const responsavelId = searchParams.responsavel ? Number(searchParams.responsavel) : undefined;

  const congressos = getAllCongresses({ status, cidade, area, responsavelId });
  const { cidades, areas } = getDistinctCongressValues();
  const members = getMembersOnly();

  const statusLabel = Object.fromEntries(STATUS_CONGRESSO.map((s) => [s.value, s.label]));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-ink">Congressos</h1>
        <Link href="/congressos/novo" className="btn-primary">
          + Novo congresso
        </Link>
      </div>

      <form className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={status} className="input">
            <option value="">Todos</option>
            {STATUS_CONGRESSO.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Cidade</label>
          <select name="cidade" defaultValue={cidade} className="input">
            <option value="">Todas</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Área temática</label>
          <select name="area" defaultValue={area} className="input">
            <option value="">Todas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Responsável</label>
          <select name="responsavel" defaultValue={responsavelId ?? ""} className="input">
            <option value="">Todos</option>
            {members.map((m) => (
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
        {congressos.map((c) => (
          <Link
            key={c.id}
            href={`/congressos/${c.id}`}
            className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:shadow-md"
          >
            <div>
              <div className="font-bold text-brand-ink">{c.nome}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-brand-ink/50">
                {c.area && <span className="tag">{c.area}</span>}
                {c.cidade && <span>📍 {c.cidade}</span>}
                {c.prazo_submissao && <span>⏰ submissão até {c.prazo_submissao}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {c.responsaveis.slice(0, 5).map((r) => (
                  <span
                    key={r.id}
                    title={r.nome}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand-cream text-[10px] font-bold"
                  >
                    <GenerationDot cor={r.cor} />
                  </span>
                ))}
              </div>
              <StatusBadge status={c.status} label={statusLabel[c.status] ?? c.status} />
            </div>
          </Link>
        ))}
        {congressos.length === 0 && (
          <p className="text-sm text-brand-ink/50">Nenhum congresso encontrado com esses filtros.</p>
        )}
      </div>
    </div>
  );
}
