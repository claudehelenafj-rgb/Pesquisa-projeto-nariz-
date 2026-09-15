import { notFound } from "next/navigation";
import { requireUser, canAccessRestricted } from "@/lib/auth";
import {
  getPersonById,
  getMemberExperience,
  getMemberInterests,
  getMemberTravelCities,
  getMemberCongressHistory,
  productionScore,
} from "@/lib/queries/people";
import { getCongressOptions } from "@/lib/queries/congresses";
import { GenerationBadge } from "@/components/GenerationBadge";
import ProfileForm from "./ProfileForm";
import { CongressHistory } from "./CongressHistory";

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const memberId = Number(params.id);
  const member = getPersonById(memberId);
  if (!member) notFound();

  const canEdit = user.memberId === member.id || canAccessRestricted(user.role);
  const isOrientador = member.tipo === "orientador";

  const experience = !isOrientador ? getMemberExperience(member.id) : undefined;
  const temas = !isOrientador ? getMemberInterests(member.id) : [];
  const cidades = !isOrientador ? getMemberTravelCities(member.id) : [];
  const history = getMemberCongressHistory(member.id);
  const congressOptions = getCongressOptions();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream text-xl font-extrabold text-brand-ink">
          {member.nome.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-brand-ink">{member.nome}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <GenerationBadge geracao={member.geracao} cor={member.cor} />
            {member.curso && <span className="text-sm text-brand-ink/50">{member.curso}</span>}
          </div>
        </div>
        {!isOrientador && experience && (
          <div className="rounded-xl bg-brand-teal/10 px-3 py-2 text-center">
            <div className="text-lg font-extrabold text-brand-teal">
              {productionScore(experience)}
            </div>
            <div className="text-[11px] text-brand-teal/70">produções</div>
          </div>
        )}
      </div>

      {isOrientador ? (
        <p className="text-sm text-brand-ink/50">
          Orientador(a) — sem ficha de membro. Veja o histórico de congressos e trabalhos
          orientados nas respectivas seções.
        </p>
      ) : canEdit ? (
        <ProfileForm
          member={member}
          experience={experience!}
          temas={temas}
          cidades={cidades}
        />
      ) : (
        <ReadOnlyProfile member={member} experience={experience} temas={temas} cidades={cidades} />
      )}

      <CongressHistory
        memberId={member.id}
        history={history}
        congressOptions={congressOptions}
        canEdit={canEdit}
      />
    </div>
  );
}

function ReadOnlyProfile({
  member,
  experience,
  temas,
  cidades,
}: {
  member: ReturnType<typeof getPersonById>;
  experience: ReturnType<typeof getMemberExperience>;
  temas: string[];
  cidades: string[];
}) {
  if (!member) return null;
  return (
    <div className="space-y-6">
      <section className="card p-5">
        <h2 className="mb-3 font-bold text-brand-ink">Dados gerais</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-brand-ink/40">Semestre</dt>
            <dd>{member.semestre || "—"}</dd>
          </div>
          <div>
            <dt className="text-brand-ink/40">Status</dt>
            <dd>{member.status === "efetivo" ? "Efetivo" : "Afetivo"}</dd>
          </div>
          <div>
            <dt className="text-brand-ink/40">Entrada</dt>
            <dd>{member.data_entrada || "—"}</dd>
          </div>
          <div>
            <dt className="text-brand-ink/40">Interesse em IC</dt>
            <dd>
              {member.interesse_ic === "sim"
                ? "Sim"
                : member.interesse_ic === "nao_prioridade"
                  ? "Não é prioridade"
                  : member.interesse_ic === "nao"
                    ? "Não"
                    : "—"}
            </dd>
          </div>
        </dl>
      </section>
      <section className="card p-5">
        <h2 className="mb-2 font-bold text-brand-ink">Temas de interesse</h2>
        <div className="flex flex-wrap gap-1.5">
          {temas.length === 0 && <p className="text-sm text-brand-ink/40">Nenhum tema informado.</p>}
          {temas.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </section>
      {experience && (
        <section className="card p-5">
          <h2 className="mb-2 font-bold text-brand-ink">Experiência científica</h2>
          <p className="text-sm text-brand-ink/60">
            {experience.apresent_autor_local + experience.apresent_coautor_local} apresentações
            locais/regionais · {experience.apresent_autor_nacional + experience.apresent_coautor_nacional}{" "}
            nacionais/internacionais · {experience.resumos_anais} resumos em anais ·{" "}
            {experience.capitulos_livro} capítulos · {experience.artigos_revista} artigos ·{" "}
            {experience.organizacao_eventos} organizações de evento
          </p>
        </section>
      )}
      <section className="card p-5">
        <h2 className="mb-2 font-bold text-brand-ink">Disponibilidade de viagem</h2>
        <div className="flex flex-wrap gap-1.5">
          {cidades.length === 0 && <p className="text-sm text-brand-ink/40">Nenhuma cidade informada.</p>}
          {cidades.map((c) => (
            <span key={c} className="tag">
              {c}
            </span>
          ))}
        </div>
        {member.obs_disponibilidade && (
          <p className="mt-2 text-sm text-brand-ink/60">{member.obs_disponibilidade}</p>
        )}
      </section>
    </div>
  );
}
