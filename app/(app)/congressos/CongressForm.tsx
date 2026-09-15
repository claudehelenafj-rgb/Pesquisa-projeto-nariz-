"use client";

import { PersonMultiSelect } from "@/components/PersonSelect";
import { STATUS_CONGRESSO, type PersonOption } from "@/lib/types";
import type { Congress } from "@/lib/queries/congresses";

interface CongressFormProps {
  action: (formData: FormData) => void;
  members: PersonOption[];
  congress?: Congress;
  responsavelIds?: number[];
  participanteIds?: number[];
  submitLabel: string;
}

export default function CongressForm({
  action,
  members,
  congress,
  responsavelIds = [],
  participanteIds = [],
  submitLabel,
}: CongressFormProps) {
  return (
    <form action={action} className="space-y-5">
      {congress && <input type="hidden" name="id" value={congress.id} />}

      <div>
        <label className="label">Nome do congresso</label>
        <input name="nome" defaultValue={congress?.nome ?? ""} required className="input" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Tema / área</label>
          <input name="area" defaultValue={congress?.area ?? ""} className="input" placeholder="Ex.: Pediatria" />
        </div>
        <div>
          <label className="label">Cidade</label>
          <input name="cidade" defaultValue={congress?.cidade ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Início do evento</label>
          <input type="date" name="dataInicio" defaultValue={congress?.data_inicio ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Fim do evento</label>
          <input type="date" name="dataFim" defaultValue={congress?.data_fim ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Prazo de submissão de resumo</label>
          <input
            type="date"
            name="prazoSubmissao"
            defaultValue={congress?.prazo_submissao ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={congress?.status ?? "planejado"} className="input">
            {STATUS_CONGRESSO.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Link</label>
          <input name="link" defaultValue={congress?.link ?? ""} className="input" placeholder="https://..." />
        </div>
        <div>
          <label className="label">Valor de inscrição (opcional)</label>
          <input name="valorInscricao" defaultValue={congress?.valor_inscricao ?? ""} className="input" />
        </div>
      </div>

      <div>
        <label className="label">Responsáveis</label>
        <PersonMultiSelect name="responsaveis" people={members} defaultValues={responsavelIds} />
      </div>

      <div>
        <label className="label">Participantes vinculados</label>
        <p className="mb-2 text-xs text-brand-ink/40">Membros que vão a este congresso.</p>
        <PersonMultiSelect name="participantes" people={members} defaultValues={participanteIds} />
      </div>

      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
