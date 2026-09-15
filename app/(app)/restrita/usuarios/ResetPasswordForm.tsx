"use client";

import { useState } from "react";
import { resetPasswordAction } from "../actions";

export function ResetPasswordForm({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="btn-ghost text-xs" onClick={() => setOpen(true)}>
        Redefinir senha
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await resetPasswordAction(formData);
        setOpen(false);
      }}
      className="flex items-center gap-1.5"
    >
      <input type="hidden" name="id" value={userId} />
      <input
        type="text"
        name="novaSenha"
        placeholder="Nova senha"
        minLength={6}
        required
        className="input w-32 py-1 text-xs"
      />
      <button type="submit" className="btn-ghost text-xs text-brand-teal">
        Salvar
      </button>
      <button type="button" className="btn-ghost text-xs" onClick={() => setOpen(false)}>
        Cancelar
      </button>
    </form>
  );
}
