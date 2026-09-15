"use client";

import { useState } from "react";
import { PersonSelect, PersonMultiSelect } from "@/components/PersonSelect";
import { STATUS_TRABALHO, TIPOS_TRABALHO, type PersonOption } from "@/lib/types";
import type { WorkWithRelations } from "@/lib/queries/works";
import type { CongressOption } from "@/lib/queries/congresses";

interface CongressWithPrazo extends CongressOption {
  prazo_submissao: string | null;
}

export function WorkForm({
  action,
  membros,
  orientadores,
  congressos,
  work,
  coautorIds = [],
  submitLabel,
}: {
  action: (formData: FormData) => void;
  membros: PersonOption[];
  orientadores: PersonOption[];
  congressos: CongressWithPrazo[];
  work?: WorkWithRelations;
  coautorIds?: number[];
  submitLabel: string;
}) {
  const [destino, setDestino] = useState<"congresso" | "revista">(work?.destino_tipo ?? "congresso");
  const [prazo, setPrazo] = useState(work?.prazo_submissao ?? "");

  return (
    <form action={action} className="space-y-5">
      {work && <input type="hidden" name="id" value={work.id} />}

      <div>
        <label className="label">Título</label>
        <input name="titulo" defaultValue={work?.titulo ?? ""} required className="input" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Tipo</label>
          <select name="tipo" defaultValue={work?.tipo ?? "resumo_simples"} className="input">
            {TIPOS_TRABALHO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={work?.status ?? "escrevendo"} className="input">
            {STATUS_TRABALHO.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Destino</label>
        <div className="mb-2 flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="destinoTipo"
              value="congresso"
              checked={destino === "congresso"}
              onChange={() => setDestino("congresso")}
            />
            Congresso
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="destinoTipo"
              value="revista"
              checked={destino === "revista"}
              onChange={() => setDestino("revista")}
            />
            Revista
          </label>
        </div>
        {destino === "congresso" ? (
          <select
            name="congressId"
            defaultValue={work?.congress_id ?? ""}
            className="input"
            onChange={(e) => {
              const congress = congressos.find((c) => c.id === Number(e.target.value));
              if (congress?.prazo_submissao) setPrazo(congress.prazo_submissao);
            }}
          >
            <option value="">Selecione o congresso...</option>
            {congressos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="revistaNome"
            defaultValue={work?.revista_nome ?? ""}
            className="input"
            placeholder="Nome da revista"
          />
        )}
      </div>

      <div>
        <label className="label">Prazo de submissão</label>
        <input
          type="date"
          name="prazoSubmissao"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
          className="input"
        />
        <p className="mt-1 text-xs text-brand-ink/40">
          Herdado do congresso ao selecioná-lo — pode ser editado livremente.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Autor principal</label>
          <PersonSelect name="autorPrincipal" people={membros} defaultValue={work?.autor_principal_id ?? null} />
        </div>
        <div>
          <label className="label">Orientador(a)</label>
          <PersonSelect
            name="orientador"
            people={orientadores}
            defaultValue={work?.orientador_id ?? null}
            placeholder="Buscar orientador(a)..."
          />
        </div>
      </div>

      <div>
        <label className="label">Coautores</label>
        <PersonMultiSelect name="coautores" people={membros} defaultValues={coautorIds} />
      </div>

      <div>
        <label className="label">Link (Drive, PDF, certificado...)</label>
        <input name="link" defaultValue={work?.link ?? ""} className="input" placeholder="https://..." />
      </div>

      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
