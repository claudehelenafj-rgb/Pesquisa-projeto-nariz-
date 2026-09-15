import ChangePasswordForm from "./ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-extrabold text-brand-ink">Trocar senha</h1>
      <div className="card p-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
