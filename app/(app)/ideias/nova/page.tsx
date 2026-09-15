import { getMembersOnly, getOrientadoresOnly } from "@/lib/queries/people";
import { createIdeaAction } from "../actions";
import { IdeaForm } from "../IdeaForm";

export default async function NovaIdeiaPage() {
  const members = getMembersOnly();
  const orientadores = getOrientadoresOnly();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-extrabold text-brand-ink">Nova ideia</h1>
      <div className="card p-6">
        <IdeaForm
          action={createIdeaAction}
          members={members}
          orientadores={orientadores}
          submitLabel="Adicionar ideia"
        />
      </div>
    </div>
  );
}
