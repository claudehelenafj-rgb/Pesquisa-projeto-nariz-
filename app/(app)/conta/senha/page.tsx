import { requireUser } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-extrabold text-brand-ink">Trocar senha</h1>
      {user.mustChangePassword && (
        <p className="mb-4 rounded-xl bg-brand-sun/20 px-3 py-2 text-sm text-yellow-800">
          Você está usando uma senha provisória. Defina uma senha nova para continuar usando o
          sistema.
        </p>
      )}
      <div className="card p-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
