"use client";

export function DeleteButton({
  action,
  hiddenFields,
  confirmText,
}: {
  action: (formData: FormData) => void;
  hiddenFields: Record<string, string | number>;
  confirmText: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <button type="submit" className="btn-secondary text-brand-coral">
        Excluir
      </button>
    </form>
  );
}
