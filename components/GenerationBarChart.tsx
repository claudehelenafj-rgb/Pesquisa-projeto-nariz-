import type { GenerationProduction } from "@/lib/queries/dashboard";

const BAR_CLASSES: Record<string, string> = {
  azul: "bg-geracao-azul",
  vermelho: "bg-geracao-vermelho",
  verde: "bg-geracao-verde",
  amarelo: "bg-geracao-amarelo",
};

export function GenerationBarChart({ data }: { data: GenerationProduction[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));

  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.geracao} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs font-medium text-brand-ink/60">{d.geracao}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-brand-ink/5">
            <div
              className={`h-full rounded-full ${BAR_CLASSES[d.cor] ?? "bg-brand-ink/30"}`}
              style={{ width: `${Math.max(4, (d.total / max) * 100)}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-bold text-brand-ink/70">{d.total}</span>
        </div>
      ))}
      {data.length === 0 && <p className="text-sm text-brand-ink/40">Sem dados de produção ainda.</p>}
    </div>
  );
}
