"use client";

import { useState } from "react";
import { updateProfileAction } from "../actions";
import { TagInput } from "@/components/TagInput";
import { TEMAS_SUGERIDOS } from "@/lib/types";
import type { Member, MemberExperience } from "@/lib/types";

const EXPERIENCE_LABELS: { field: keyof MemberExperience; label: string }[] = [
  { field: "apresent_autor_local", label: "Apresentações como autor(a) — local/regional" },
  { field: "apresent_coautor_local", label: "Apresentações como coautor(a) — local/regional" },
  { field: "apresent_autor_nacional", label: "Apresentações como autor(a) — nacional/internacional" },
  { field: "apresent_coautor_nacional", label: "Apresentações como coautor(a) — nacional/internacional" },
  { field: "resumos_anais", label: "Resumos publicados em anais" },
  { field: "capitulos_livro", label: "Capítulos de livro/ebook" },
  { field: "artigos_revista", label: "Artigos em revista" },
  { field: "organizacao_eventos", label: "Organização de eventos" },
];

export default function ProfileForm({
  member,
  experience,
  temas,
  cidades,
}: {
  member: Member;
  experience: MemberExperience;
  temas: string[];
  cidades: string[];
}) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (formData) => {
        await updateProfileAction(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }}
      className="space-y-6"
    >
      <input type="hidden" name="memberId" value={member.id} />

      <section className="card p-5">
        <h2 className="mb-4 font-bold text-brand-ink">Dados gerais</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Curso</label>
            <input name="curso" defaultValue={member.curso ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Semestre</label>
            <input name="semestre" defaultValue={member.semestre ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={member.status ?? "efetivo"} className="input">
              <option value="efetivo">Efetivo</option>
              <option value="afetivo">Afetivo</option>
            </select>
          </div>
          <div>
            <label className="label">Data de entrada</label>
            <input
              type="date"
              name="dataEntrada"
              defaultValue={member.data_entrada ?? ""}
              className="input"
            />
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-2 font-bold text-brand-ink">Temas de interesse de pesquisa</h2>
        <p className="mb-3 text-xs text-brand-ink/50">
          Digite um tema e pressione Enter, ou escolha uma sugestão.
        </p>
        <TagInput name="temas" defaultValues={temas} suggestions={TEMAS_SUGERIDOS} />
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-brand-ink">Iniciação Científica</h2>
        <div className="flex flex-wrap gap-4">
          {[
            { value: "sim", label: "Sim, tenho interesse" },
            { value: "nao_prioridade", label: "Não é prioridade agora" },
            { value: "nao", label: "Não tenho interesse" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="interesseIc"
                value={opt.value}
                defaultChecked={member.interesse_ic === opt.value}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-brand-ink">Experiência científica</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXPERIENCE_LABELS.map(({ field, label }) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input
                type="number"
                min={0}
                name={field}
                defaultValue={experience[field]}
                className="input"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-2 font-bold text-brand-ink">Disponibilidade de viagem</h2>
        <p className="mb-3 text-xs text-brand-ink/50">
          Cidades onde tem facilidade de ir (rede de apoio, família).
        </p>
        <TagInput name="cidades" defaultValues={cidades} placeholder="Nome da cidade..." />
        <div className="mt-4">
          <label className="label">Observações / limitações</label>
          <textarea
            name="obsDisponibilidade"
            defaultValue={member.obs_disponibilidade ?? ""}
            className="input min-h-24"
            placeholder="Ex.: em internato até dez/2026, custo de viagem é limitante..."
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">
          Salvar alterações
        </button>
        {saved && <span className="text-sm font-medium text-brand-teal">Salvo!</span>}
      </div>
    </form>
  );
}
