const BADGE_CLASSES: Record<string, string> = {
  azul: "bg-geracao-azul/10 text-geracao-azul border-geracao-azul/25",
  vermelho: "bg-geracao-vermelho/10 text-geracao-vermelho border-geracao-vermelho/25",
  verde: "bg-geracao-verde/10 text-geracao-verde border-geracao-verde/25",
  amarelo: "bg-geracao-amarelo/10 text-geracao-amarelo border-geracao-amarelo/25",
};

const DOT_CLASSES: Record<string, string> = {
  azul: "bg-geracao-azul",
  vermelho: "bg-geracao-vermelho",
  verde: "bg-geracao-verde",
  amarelo: "bg-geracao-amarelo",
};

export function GenerationDot({ cor, className = "" }: { cor?: string | null; className?: string }) {
  if (!cor) return null;
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${DOT_CLASSES[cor] ?? "bg-brand-ink/30"} ${className}`}
    />
  );
}

export function GenerationBadge({
  geracao,
  cor,
}: {
  geracao?: string | null;
  cor?: string | null;
}) {
  if (!geracao) {
    return (
      <span className="badge border border-brand-plum/20 bg-brand-plum/10 text-brand-plum">
        Orientador(a)
      </span>
    );
  }
  return (
    <span
      className={`badge border ${BADGE_CLASSES[cor ?? ""] ?? "border-brand-ink/10 bg-brand-ink/5 text-brand-ink/60"}`}
    >
      <GenerationDot cor={cor} />
      {geracao}
    </span>
  );
}

export function PersonInline({
  nome,
  geracao,
  cor,
}: {
  nome: string;
  geracao?: string | null;
  cor?: string | null;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {cor ? <GenerationDot cor={cor} /> : <span className="text-xs">🎓</span>}
      {nome}
    </span>
  );
}
