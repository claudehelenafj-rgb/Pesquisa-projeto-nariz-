import Link from "next/link";

export default function AcessoNegadoPage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">🚫</div>
      <h1 className="text-2xl font-extrabold text-brand-ink">Acesso não autorizado</h1>
      <p className="max-w-md text-sm text-brand-ink/60">
        Esta área é restrita à coordenação e presidência do Projeto Nariz. Se você acredita que
        deveria ter acesso, fale com a coordenação.
      </p>
      <Link href="/" className="btn-secondary">
        Voltar ao início
      </Link>
    </main>
  );
}
