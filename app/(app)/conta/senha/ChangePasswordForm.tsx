"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePasswordAction, type ChangePasswordState } from "@/lib/auth-actions";

const initialState: ChangePasswordState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar nova senha"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="senhaAtual">
          Senha atual
        </label>
        <input id="senhaAtual" name="senhaAtual" type="password" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="novaSenha">
          Nova senha
        </label>
        <input id="novaSenha" name="novaSenha" type="password" required minLength={6} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="confirmar">
          Confirmar nova senha
        </label>
        <input id="confirmar" name="confirmar" type="password" required minLength={6} className="input" />
      </div>
      {state.error && (
        <p className="rounded-xl bg-brand-coral/10 px-3 py-2 text-sm font-medium text-brand-coral">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl bg-brand-teal/10 px-3 py-2 text-sm font-medium text-brand-teal">
          Senha atualizada com sucesso.
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
