import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkById, getWorkCoauthorIds } from "@/lib/queries/works";
import { getMembersOnly, getOrientadoresOnly } from "@/lib/queries/people";
import { getCongressOptionsWithPrazo } from "@/lib/queries/congresses";
import { updateWorkAction, deleteWorkAction } from "../actions";
import { WorkForm } from "../WorkForm";
import { DeleteButton } from "@/components/DeleteButton";

export default async function WorkDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const work = getWorkById(id);
  if (!work) notFound();

  const membros = getMembersOnly();
  const orientadores = getOrientadoresOnly();
  const congressos = getCongressOptionsWithPrazo();
  const coautorIds = getWorkCoauthorIds(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-brand-ink">{work.titulo}</h1>
        <DeleteButton
          action={deleteWorkAction}
          hiddenFields={{ id }}
          confirmText={`Excluir o trabalho "${work.titulo}"?`}
        />
      </div>

      {work.idea_id && (
        <p className="text-xs text-brand-ink/40">
          Originado da ideia{" "}
          <Link href={`/ideias/${work.idea_id}`} className="underline">
            #{work.idea_id}
          </Link>
        </p>
      )}

      <div className="card p-6">
        <WorkForm
          action={updateWorkAction}
          membros={membros}
          orientadores={orientadores}
          congressos={congressos}
          work={work}
          coautorIds={coautorIds}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  );
}
