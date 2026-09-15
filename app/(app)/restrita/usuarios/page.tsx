import { requireRestricted } from "@/lib/auth";
import { getAllUsers } from "@/lib/queries/restricted";
import { getAllPeople } from "@/lib/queries/people";
import { createUserAction, deleteUserAction } from "../actions";
import { PersonSelect } from "@/components/PersonSelect";
import { DeleteButton } from "@/components/DeleteButton";
import { RoleSelect } from "./RoleSelect";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { ROLE_LABEL } from "@/lib/types";

export default async function UsuariosPage() {
  await requireRestricted();
  const users = getAllUsers();
  const people = getAllPeople();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-extrabold text-brand-ink">Gestão de usuários</h1>

      <form action={createUserAction} className="card mb-6 grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="label">Usuário (login)</label>
          <input name="username" required className="input" placeholder="ex.: joao.silva" />
        </div>
        <div>
          <label className="label">Senha temporária</label>
          <input name="senha" type="text" minLength={6} required className="input" />
        </div>
        <div>
          <label className="label">Nível de acesso</label>
          <select name="role" defaultValue="membro" className="input">
            <option value="membro">Membro</option>
            <option value="coordenadora">Coordenadora</option>
            <option value="presidencia">Presidência</option>
          </select>
        </div>
        <div>
          <label className="label">Vincular a pessoa (opcional)</label>
          <PersonSelect name="memberId" people={people} />
        </div>
        <button type="submit" className="btn-primary sm:col-span-2">
          Criar usuário
        </button>
      </form>

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="font-semibold text-brand-ink">{u.username}</div>
              <div className="text-xs text-brand-ink/50">
                {u.member_nome || "sem pessoa vinculada"} · {ROLE_LABEL[u.role]}
                {u.must_change_password ? " · precisa trocar senha" : ""}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RoleSelect userId={u.id} role={u.role} />
              <ResetPasswordForm userId={u.id} />
              <DeleteButton
                action={deleteUserAction}
                hiddenFields={{ id: u.id }}
                confirmText={`Excluir o usuário "${u.username}"?`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
