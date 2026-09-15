import Link from "next/link";
import { getCalendarItems } from "@/lib/queries/dashboard";

const TIPO_ICON: Record<string, string> = {
  submissao_congresso: "📝",
  evento_congresso: "🎪",
  submissao_trabalho: "📄",
};

function urgencyClasses(dias: number) {
  if (dias < 0) return "border-brand-ink/10 opacity-50";
  if (dias <= 7) return "border-brand-coral bg-brand-coral/5";
  if (dias <= 30) return "border-brand-sun bg-brand-sun/10";
  return "border-brand-ink/10";
}

export default async function CalendarioPage() {
  const items = getCalendarItems();
  const futuros = items.filter((i) => i.diasRestantes >= 0);
  const passados = items.filter((i) => i.diasRestantes < 0).slice(-10);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-extrabold text-brand-ink">Calendário</h1>
      <p className="mb-6 text-sm text-brand-ink/50">
        Prazos de submissão e datas de congressos. Destaque em{" "}
        <span className="font-semibold text-brand-coral">vermelho</span> para até 7 dias e{" "}
        <span className="font-semibold text-yellow-700">amarelo</span> para até 30 dias.
      </p>

      <div className="space-y-3">
        {futuros.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`card flex items-center justify-between gap-3 border-l-4 p-4 transition hover:shadow-md ${urgencyClasses(item.diasRestantes)}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{TIPO_ICON[item.tipo]}</span>
              <div>
                <div className="font-semibold text-brand-ink">{item.titulo}</div>
                <div className="text-xs text-brand-ink/50">{item.data}</div>
              </div>
            </div>
            <span className="text-sm font-bold text-brand-ink/60">
              {item.diasRestantes === 0 ? "hoje" : `em ${item.diasRestantes}d`}
            </span>
          </Link>
        ))}
        {futuros.length === 0 && (
          <p className="text-sm text-brand-ink/40">Nenhum prazo futuro cadastrado.</p>
        )}
      </div>

      {passados.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-ink/40">
            Já passaram
          </h2>
          <div className="space-y-2">
            {passados.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="card flex items-center justify-between gap-3 p-3 text-sm opacity-50 transition hover:opacity-80"
              >
                <span>
                  {TIPO_ICON[item.tipo]} {item.titulo}
                </span>
                <span>{item.data}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
