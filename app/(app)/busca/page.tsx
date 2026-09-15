import Link from "next/link";
import React from "react";
import { requireUser } from "@/lib/auth";
import { globalSearch } from "@/lib/queries/search";
import { GenerationBadge } from "@/components/GenerationBadge";

export default async function BuscaPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireUser();
  const q = (searchParams.q || "").trim();
  const results = q.length >= 2 ? globalSearch(q) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Busca</h1>
      <form className="mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por membro, congresso, tema..."
          className="input"
          autoFocus
        />
      </form>

      {!results && <p className="text-sm text-brand-ink/50">Digite pelo menos 2 caracteres para buscar.</p>}

      {results && (
        <div className="space-y-6">
          <ResultSection title="Membros">
            {results.membros.map((m) => (
              <Link key={m.id} href={`/membros/${m.id}`} className="card flex items-center gap-2 p-3 hover:shadow-md">
                {m.nome}
                <GenerationBadge geracao={m.geracao} cor={m.cor} />
              </Link>
            ))}
          </ResultSection>

          <ResultSection title="Congressos">
            {results.congressos.map((c) => (
              <Link key={c.id} href={`/congressos/${c.id}`} className="card p-3 hover:shadow-md">
                <span className="font-semibold">{c.nome}</span>
                {c.area && <span className="ml-2 tag">{c.area}</span>}
                {c.cidade && <span className="ml-2 text-xs text-brand-ink/40">{c.cidade}</span>}
              </Link>
            ))}
          </ResultSection>

          <ResultSection title="Ideias">
            {results.ideias.map((i) => (
              <Link key={i.id} href={`/ideias/${i.id}`} className="card p-3 hover:shadow-md">
                <span className="font-semibold">{i.titulo}</span>
                {i.eixo_tematico && <span className="ml-2 tag">{i.eixo_tematico}</span>}
              </Link>
            ))}
          </ResultSection>

          <ResultSection title="Trabalhos">
            {results.trabalhos.map((t) => (
              <Link key={t.id} href={`/trabalhos/${t.id}`} className="card p-3 hover:shadow-md">
                {t.titulo}
              </Link>
            ))}
          </ResultSection>

          {results.membros.length === 0 &&
            results.congressos.length === 0 &&
            results.ideias.length === 0 &&
            results.trabalhos.length === 0 && (
              <p className="text-sm text-brand-ink/50">Nenhum resultado para &ldquo;{q}&rdquo;.</p>
            )}
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-ink/40">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
