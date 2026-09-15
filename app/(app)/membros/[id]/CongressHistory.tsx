import { addCongressHistoryAction, removeCongressHistoryAction } from "../actions";
import type { CongressHistoryRow } from "@/lib/queries/people";
import type { CongressOption } from "@/lib/queries/congresses";

export function CongressHistory({
  memberId,
  history,
  congressOptions,
  canEdit,
}: {
  memberId: number;
  history: CongressHistoryRow[];
  congressOptions: CongressOption[];
  canEdit: boolean;
}) {
  const jaFoi = history.filter((h) => h.tipo === "ja_foi");
  const pretendeIr = history.filter((h) => h.tipo === "pretende_ir");

  return (
    <section className="card p-5">
      <h2 className="mb-3 font-bold text-brand-ink">Congressos</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-brand-ink/70">Já foi</h3>
          <HistoryList items={jaFoi} memberId={memberId} canEdit={canEdit} />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-brand-ink/70">Pretende ir</h3>
          <HistoryList items={pretendeIr} memberId={memberId} canEdit={canEdit} />
        </div>
      </div>

      {canEdit && (
        <form action={addCongressHistoryAction} className="mt-5 grid gap-3 border-t border-brand-ink/10 pt-4 sm:grid-cols-[1fr_1fr_6rem_auto]">
          <input type="hidden" name="memberId" value={memberId} />
          <select name="congressId" className="input" defaultValue="">
            <option value="">— Evento fora do sistema —</option>
            {congressOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <input name="nomeLivre" className="input" placeholder="Nome do evento (se não estiver na lista)" />
          <input name="ano" className="input" placeholder="Ano" />
          <select name="tipo" className="input">
            <option value="ja_foi">Já foi</option>
            <option value="pretende_ir">Pretende ir</option>
          </select>
          <button type="submit" className="btn-secondary sm:col-span-4">
            Adicionar
          </button>
        </form>
      )}
    </section>
  );
}

function HistoryList({
  items,
  memberId,
  canEdit,
}: {
  items: CongressHistoryRow[];
  memberId: number;
  canEdit: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-brand-ink/40">Nada registrado ainda.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
          <span>
            {item.congresso_nome || item.nome_livre}
            {item.ano && <span className="text-brand-ink/40"> · {item.ano}</span>}
          </span>
          {canEdit && (
            <form action={removeCongressHistoryAction}>
              <input type="hidden" name="memberId" value={memberId} />
              <input type="hidden" name="historyId" value={item.id} />
              <button type="submit" className="text-xs text-brand-ink/30 hover:text-brand-coral">
                remover
              </button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
