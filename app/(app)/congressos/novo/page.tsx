import { getMembersOnly } from "@/lib/queries/people";
import { createCongressAction } from "../actions";
import CongressForm from "../CongressForm";

export default async function NovoCongressoPage() {
  const members = getMembersOnly();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-extrabold text-brand-ink">Novo congresso</h1>
      <div className="card p-6">
        <CongressForm action={createCongressAction} members={members} submitLabel="Criar congresso" />
      </div>
    </div>
  );
}
