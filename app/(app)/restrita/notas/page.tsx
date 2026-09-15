import { requireRestricted } from "@/lib/auth";
import { getNotes } from "@/lib/queries/restricted";
import { createNoteAction, deleteNoteAction } from "../actions";
import { DeleteButton } from "@/components/DeleteButton";

export default async function NotasPage() {
  await requireRestricted();
  const notes = getNotes();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-extrabold text-brand-ink">Notas confidenciais</h1>

      <form action={createNoteAction} className="card mb-6 space-y-4 p-5">
        <div>
          <label className="label">Título</label>
          <input name="titulo" required className="input" />
        </div>
        <div>
          <label className="label">Conteúdo</label>
          <textarea name="conteudo" className="input min-h-32" />
        </div>
        <button type="submit" className="btn-primary">
          Salvar nota
        </button>
      </form>

      <div className="space-y-3">
        {notes.map((n) => (
          <details key={n.id} className="card p-4">
            <summary className="flex cursor-pointer items-center justify-between gap-2 font-semibold text-brand-ink">
              <span>{n.titulo}</span>
              <span className="text-xs text-brand-ink/40">{n.created_at}</span>
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-sm text-brand-ink/70">{n.conteudo}</p>
            <div className="mt-3">
              <DeleteButton
                action={deleteNoteAction}
                hiddenFields={{ id: n.id }}
                confirmText={`Excluir a nota "${n.titulo}"?`}
              />
            </div>
          </details>
        ))}
        {notes.length === 0 && <p className="text-sm text-brand-ink/40">Nenhuma nota registrada ainda.</p>}
      </div>
    </div>
  );
}
