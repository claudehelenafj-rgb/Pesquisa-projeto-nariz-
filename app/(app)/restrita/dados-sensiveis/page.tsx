import { requireRestricted } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { updateSensitiveDataAction } from "../actions";
import { GenerationBadge } from "@/components/GenerationBadge";
import type { Member } from "@/lib/types";

export default async function DadosSensiveisPage() {
  await requireRestricted();
  const db = getDb();
  const membros = db
    .prepare(`SELECT * FROM members WHERE tipo = 'membro' ORDER BY geracao, nome`)
    .all() as Member[];

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-brand-ink">Dados cadastrais sensíveis</h1>
      <p className="mb-6 text-sm text-brand-ink/50">
        Matrícula e documentos — visíveis apenas nesta área restrita.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              <th className="px-3">Membro</th>
              <th className="px-3">Matrícula</th>
              <th className="px-3">Documento</th>
              <th className="px-3"></th>
            </tr>
          </thead>
          <tbody>
            {membros.map((m) => (
              <tr key={m.id} className="card">
                <td className="rounded-l-2xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    {m.nome}
                    <GenerationBadge geracao={m.geracao} cor={m.cor} />
                  </div>
                </td>
                <td className="px-3 py-2" colSpan={3}>
                  <form action={updateSensitiveDataAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="memberId" value={m.id} />
                    <input
                      name="matricula"
                      defaultValue={m.matricula ?? ""}
                      placeholder="Matrícula"
                      className="input w-40"
                    />
                    <input
                      name="documento"
                      defaultValue={m.documento ?? ""}
                      placeholder="Documento"
                      className="input w-40"
                    />
                    <button type="submit" className="btn-ghost text-brand-coral">
                      Salvar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
