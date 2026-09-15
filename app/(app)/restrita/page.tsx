import Link from "next/link";
import { requireRestricted } from "@/lib/auth";
import { getMinutes, getNotes, getAllUsers } from "@/lib/queries/restricted";

const SECTIONS = [
  { href: "/restrita/atas", label: "Atas de reunião", icon: "📋", desc: "Decisões administrativas" },
  { href: "/restrita/notas", label: "Notas confidenciais", icon: "🔒", desc: "Anotações internas" },
  { href: "/restrita/dados-sensiveis", label: "Dados sensíveis", icon: "🪪", desc: "Matrícula e documentos" },
  { href: "/restrita/relatorio", label: "Relatório de produção", icon: "📈", desc: "Quem produziu quanto" },
  { href: "/restrita/usuarios", label: "Gestão de usuários", icon: "👤", desc: "Login e nível de acesso" },
];

export default async function RestritaPage() {
  await requireRestricted();
  const minutes = getMinutes();
  const notes = getNotes();
  const users = getAllUsers();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Área Restrita</h1>
      <p className="mb-6 text-sm text-brand-ink/50">
        Visível apenas para coordenação e presidência.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card flex items-start gap-3 p-4 transition hover:shadow-md">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="font-bold text-brand-ink">{s.label}</div>
              <div className="text-xs text-brand-ink/50">{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold text-brand-coral">{minutes.length}</div>
          <div className="text-xs text-brand-ink/50">atas registradas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold text-brand-coral">{notes.length}</div>
          <div className="text-xs text-brand-ink/50">notas confidenciais</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold text-brand-coral">{users.length}</div>
          <div className="text-xs text-brand-ink/50">usuários cadastrados</div>
        </div>
      </div>
    </div>
  );
}
