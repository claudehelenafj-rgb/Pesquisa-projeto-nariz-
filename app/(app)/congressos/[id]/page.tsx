import { notFound } from "next/navigation";
import { getCongressById, getCongressResponsibleIds, getCongressParticipantIds } from "@/lib/queries/congresses";
import { getMembersOnly } from "@/lib/queries/people";
import { getSuggestedMembers } from "@/lib/queries/suggestions";
import { updateCongressAction, deleteCongressAction } from "../actions";
import CongressForm from "../CongressForm";
import { DeleteButton } from "@/components/DeleteButton";
import { PersonInline } from "@/components/GenerationBadge";

export default async function CongressoDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const congress = getCongressById(id);
  if (!congress) notFound();

  const members = getMembersOnly();
  const responsavelIds = getCongressResponsibleIds(id);
  const participanteIds = getCongressParticipantIds(id);
  const suggestions = getSuggestedMembers(congress);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-brand-ink">{congress.nome}</h1>
        <DeleteButton
          action={deleteCongressAction}
          hiddenFields={{ id }}
          confirmText={`Excluir o congresso "${congress.nome}"? Esta ação não pode ser desfeita.`}
        />
      </div>

      <div className="card p-6">
        <CongressForm
          action={updateCongressAction}
          members={members}
          congress={congress}
          responsavelIds={responsavelIds}
          participanteIds={participanteIds}
          submitLabel="Salvar alterações"
        />
      </div>

      {suggestions.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-1 font-bold text-brand-ink">💡 Sugestão de membros compatíveis</h2>
          <p className="mb-4 text-xs text-brand-ink/50">
            Sugestão automática com base em tema de interesse, cidade acessível e distribuição de
            oportunidades — a escolha final continua manual.
          </p>
          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li
                key={s.person.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-cream px-3 py-2 text-sm"
              >
                <PersonInline nome={s.person.nome} geracao={s.person.geracao} cor={s.person.cor} />
                <span className="flex flex-wrap gap-1.5">
                  {s.motivos.map((m) => (
                    <span key={m} className="tag">
                      {m}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
