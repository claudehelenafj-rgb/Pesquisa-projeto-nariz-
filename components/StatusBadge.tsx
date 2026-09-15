const PALETTES: Record<string, string> = {
  // congressos
  planejado: "bg-brand-ink/5 text-brand-ink/60",
  confirmado: "bg-brand-teal/10 text-brand-teal",
  em_andamento: "bg-brand-sun/20 text-yellow-700",
  concluido: "bg-brand-plum/10 text-brand-plum",
  // ideias
  ideia: "bg-brand-ink/5 text-brand-ink/60",
  em_avaliacao: "bg-brand-sun/20 text-yellow-700",
  aprovada: "bg-brand-teal/10 text-brand-teal",
  descartada: "bg-brand-coral/10 text-brand-coral",
  // trabalhos
  escrevendo: "bg-brand-ink/5 text-brand-ink/60",
  revisao: "bg-brand-sun/20 text-yellow-700",
  submetido: "bg-brand-plum/10 text-brand-plum",
  aprovado: "bg-brand-teal/10 text-brand-teal",
  apresentado: "bg-blue-100 text-blue-700",
  publicado: "bg-green-100 text-green-700",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`badge ${PALETTES[status] ?? "bg-brand-ink/5 text-brand-ink/60"}`}>
      {label}
    </span>
  );
}
