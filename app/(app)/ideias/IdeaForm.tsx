import { PersonSelect } from "@/components/PersonSelect";
import { STATUS_IDEIA, TEMAS_SUGERIDOS, type PersonOption } from "@/lib/types";
import type { Idea } from "@/lib/queries/ideas";

export function IdeaForm({
  action,
  members,
  orientadores,
  idea,
  submitLabel,
  showStatus = false,
}: {
  action: (formData: FormData) => void;
  members: PersonOption[];
  orientadores: PersonOption[];
  idea?: Idea;
  submitLabel: string;
  showStatus?: boolean;
}) {
  return (
    <form action={action} className="space-y-5">
      {idea && <input type="hidden" name="id" value={idea.id} />}

      <div>
        <label className="label">Título</label>
        <input name="titulo" defaultValue={idea?.titulo ?? ""} required className="input" />
      </div>

      <div>
        <label className="label">Descrição</label>
        <textarea name="descricao" defaultValue={idea?.descricao ?? ""} className="input min-h-28" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Proposta por</label>
          <PersonSelect name="propostaPor" people={members} defaultValue={idea?.proposta_por ?? null} />
        </div>
        <div>
          <label className="label">Eixo temático</label>
          <input
            name="eixoTematico"
            defaultValue={idea?.eixo_tematico ?? ""}
            list="eixos-sugeridos"
            className="input"
            placeholder="Ex.: Pediatria"
          />
          <datalist id="eixos-sugeridos">
            {TEMAS_SUGERIDOS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className="label">Orientador(a) sugerido(a) (opcional)</label>
        <PersonSelect
          name="orientadorSugerido"
          people={orientadores}
          defaultValue={idea?.orientador_sugerido ?? null}
          placeholder="Buscar orientador(a)..."
        />
      </div>

      {showStatus && (
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={idea?.status ?? "ideia"} className="input">
            {STATUS_IDEIA.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
