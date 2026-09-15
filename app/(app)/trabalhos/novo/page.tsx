import { getMembersOnly, getOrientadoresOnly } from "@/lib/queries/people";
import { getCongressOptionsWithPrazo } from "@/lib/queries/congresses";
import { createWorkAction } from "../actions";
import { WorkForm } from "../WorkForm";

export default async function NovoTrabalhoPage() {
  const membros = getMembersOnly();
  const orientadores = getOrientadoresOnly();
  const congressos = getCongressOptionsWithPrazo();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-extrabold text-brand-ink">Novo trabalho</h1>
      <div className="card p-6">
        <WorkForm
          action={createWorkAction}
          membros={membros}
          orientadores={orientadores}
          congressos={congressos}
          submitLabel="Criar trabalho"
        />
      </div>
    </div>
  );
}
