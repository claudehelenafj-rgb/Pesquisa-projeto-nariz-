import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getIdeaById, getIdeaComments } from "@/lib/queries/ideas";
import { getMembersOnly, getOrientadoresOnly } from "@/lib/queries/people";
import { IdeaForm } from "../IdeaForm";
import { DeleteButton } from "@/components/DeleteButton";
import { PersonInline } from "@/components/GenerationBadge";
import {
  updateIdeaAction,
  deleteIdeaAction,
  joinIdeaAction,
  leaveIdeaAction,
  addIdeaCommentAction,
  convertIdeaToWorkAction,
} from "../actions";

export default async function IdeaDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const id = Number(params.id);
  const idea = getIdeaById(id);
  if (!idea) notFound();

  const members = getMembersOnly();
  const orientadores = getOrientadoresOnly();
  const comments = getIdeaComments(id);
  const jaParticipa = idea.participantes.some((p) => p.id === user.memberId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-brand-ink">{idea.titulo}</h1>
        <DeleteButton
          action={deleteIdeaAction}
          hiddenFields={{ id }}
          confirmText={`Excluir a ideia "${idea.titulo}"?`}
        />
      </div>

      {idea.status === "aprovada" && (
        <form action={convertIdeaToWorkAction} className="card flex items-center justify-between p-4">
          <input type="hidden" name="ideaId" value={idea.id} />
          <div>
            <p className="font-semibold text-brand-ink">Ideia aprovada 🎉</p>
            <p className="text-sm text-brand-ink/50">Converta em um trabalho para começar a escrever.</p>
          </div>
          <button type="submit" className="btn-primary">
            Converter em Trabalho
          </button>
        </form>
      )}

      <div className="card p-6">
        <IdeaForm
          action={updateIdeaAction}
          members={members}
          orientadores={orientadores}
          idea={idea}
          submitLabel="Salvar alterações"
          showStatus
        />
      </div>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-brand-ink">Participantes ({idea.participantes.length})</h2>
          <form action={jaParticipa ? leaveIdeaAction : joinIdeaAction}>
            <input type="hidden" name="ideaId" value={idea.id} />
            <button type="submit" className={jaParticipa ? "btn-secondary" : "btn-primary"}>
              {jaParticipa ? "Não quero mais participar" : "Quero participar"}
            </button>
          </form>
        </div>
        <div className="flex flex-wrap gap-2">
          {idea.participantes.map((p) => (
            <span key={p.id} className="tag">
              <PersonInline nome={p.nome} geracao={p.geracao} cor={p.cor} />
            </span>
          ))}
          {idea.participantes.length === 0 && (
            <p className="text-sm text-brand-ink/40">Ninguém se vinculou ainda.</p>
          )}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-brand-ink">Comentários</h2>
        <div className="mb-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-brand-cream p-3 text-sm">
              <div className="mb-1 flex items-center justify-between text-xs text-brand-ink/40">
                <span className="font-semibold text-brand-ink/70">{c.autor_nome || "Alguém"}</span>
                <span>{c.created_at}</span>
              </div>
              {c.texto}
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-brand-ink/40">Nenhum comentário ainda.</p>}
        </div>
        <form action={addIdeaCommentAction} className="flex gap-2">
          <input type="hidden" name="ideaId" value={idea.id} />
          <input name="texto" required className="input flex-1" placeholder="Escreva um comentário..." />
          <button type="submit" className="btn-secondary">
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}
