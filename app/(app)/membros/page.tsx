import Link from "next/link";
import { getDb } from "@/lib/db";
import { GenerationBadge } from "@/components/GenerationBadge";
import type { Member } from "@/lib/types";

function ExportCsvLink({ params }: { params: string }) {
  return (
    <Link href={`/api/export/membros${params}`} className="btn-secondary">
      Exportar CSV
    </Link>
  );
}

export default async function MembrosPage({
  searchParams,
}: {
  searchParams: { geracao?: string; status?: string; tipo?: string };
}) {
  const db = getDb();
  const geracao = searchParams.geracao || "";
  const status = searchParams.status || "";
  const tipo = searchParams.tipo || "membro";

  const geracoes = db
    .prepare(
      `SELECT DISTINCT geracao FROM members WHERE geracao IS NOT NULL ORDER BY geracao`
    )
    .all() as { geracao: string }[];

  let sql = `SELECT * FROM members WHERE tipo = ?`;
  const args: (string | number)[] = [tipo];
  if (geracao) {
    sql += ` AND geracao = ?`;
    args.push(geracao);
  }
  if (status) {
    sql += ` AND status = ?`;
    args.push(status);
  }
  sql += ` ORDER BY ${tipo === "orientador" ? "nome" : "geracao, nome"}`;

  const membros = db.prepare(sql).all(...args) as Member[];

  const qs = new URLSearchParams();
  if (geracao) qs.set("geracao", geracao);
  if (status) qs.set("status", status);
  if (tipo) qs.set("tipo", tipo);
  const paramsStr = qs.toString() ? `?${qs.toString()}` : "";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-ink">Membros</h1>
        <ExportCsvLink params={paramsStr} />
      </div>

      <form className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label">Tipo</label>
          <select name="tipo" defaultValue={tipo} className="input">
            <option value="membro">Membros</option>
            <option value="orientador">Orientadores</option>
          </select>
        </div>
        <div>
          <label className="label">Geração</label>
          <select name="geracao" defaultValue={geracao} className="input">
            <option value="">Todas</option>
            {geracoes.map((g) => (
              <option key={g.geracao} value={g.geracao}>
                {g.geracao}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={status} className="input">
            <option value="">Todos</option>
            <option value="efetivo">Efetivo</option>
            <option value="afetivo">Afetivo</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Filtrar
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {membros.map((m) => (
          <Link
            key={m.id}
            href={`/membros/${m.id}`}
            className="card flex flex-col gap-2 p-4 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-ink">{m.nome}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <GenerationBadge geracao={m.geracao} cor={m.cor} />
              {m.curso && <span className="text-xs text-brand-ink/50">{m.curso}</span>}
              {m.semestre && <span className="text-xs text-brand-ink/50">{m.semestre}º sem.</span>}
            </div>
            {m.status && (
              <span className="text-xs font-medium text-brand-ink/40">
                {m.status === "efetivo" ? "Efetivo" : "Afetivo"}
              </span>
            )}
          </Link>
        ))}
        {membros.length === 0 && (
          <p className="text-sm text-brand-ink/50">Nenhuma pessoa encontrada com esses filtros.</p>
        )}
      </div>
    </div>
  );
}
