import { requireRestricted } from "@/lib/auth";
import { getMinutes } from "@/lib/queries/restricted";
import { createMinuteAction, deleteMinuteAction } from "../actions";
import { DeleteButton } from "@/components/DeleteButton";

export default async function AtasPage() {
  await requireRestricted();
  const minutes = getMinutes();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-extrabold text-brand-ink">Atas de reunião</h1>

      <form action={createMinuteAction} className="card mb-6 space-y-4 p-5">
        <div>
          <label className="label">Título</label>
          <input name="titulo" required className="input" placeholder="Ex.: Reunião geral — 15/03" />
        </div>
        <div>
          <label className="label">Data da reunião</label>
          <input type="date" name="dataReuniao" className="input" />
        </div>
        <div>
          <label className="label">Conteúdo / decisões</label>
          <textarea name="conteudo" className="input min-h-32" />
        </div>
        <button type="submit" className="btn-primary">
          Registrar ata
        </button>
      </form>

      <div className="space-y-3">
        {minutes.map((m) => (
          <details key={m.id} className="card p-4">
            <summary className="flex cursor-pointer items-center justify-between gap-2 font-semibold text-brand-ink">
              <span>
                {m.titulo} {m.data_reuniao && <span className="text-xs text-brand-ink/40">· {m.data_reuniao}</span>}
              </span>
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-sm text-brand-ink/70">{m.conteudo}</p>
            <div className="mt-3">
              <DeleteButton
                action={deleteMinuteAction}
                hiddenFields={{ id: m.id }}
                confirmText={`Excluir a ata "${m.titulo}"?`}
              />
            </div>
          </details>
        ))}
        {minutes.length === 0 && <p className="text-sm text-brand-ink/40">Nenhuma ata registrada ainda.</p>}
      </div>
    </div>
  );
}
