import { requireRestricted } from "@/lib/auth";
import { getAllWorkTracking, MAX_COAUTORES } from "@/lib/queries/work-tracking";
import { getAllCongresses } from "@/lib/queries/congresses";
import { getMembersOnly, getOrientadoresOnly } from "@/lib/queries/people";
import { PersonSelect, PersonMultiSelect } from "@/components/PersonSelect";
import { DeleteButton } from "@/components/DeleteButton";
import { STATUS_APROVACAO_TRABALHO } from "@/lib/types";
import {
  createTrackingRowAction,
  updateTrackingRowAction,
  deleteTrackingRowAction,
} from "./actions";

export default async function AcompanhamentoPage() {
  await requireRestricted();

  const rows = getAllWorkTracking();
  const congressos = getAllCongresses();
  const membros = getMembersOnly();
  const orientadores = getOrientadoresOnly();

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-brand-ink">
            Acompanhamento de trabalhos por congresso
          </h1>
          <p className="text-sm text-brand-ink/50">
            Tabela totalmente editável, visível apenas para coordenação e presidência.
          </p>
        </div>
        <form action={createTrackingRowAction}>
          <button type="submit" className="btn-primary">
            + Nova linha
          </button>
        </form>
      </div>

      {congressos.length === 0 && (
        <p className="mt-4 rounded-xl bg-brand-sun/20 px-3 py-2 text-sm text-yellow-800">
          Nenhum congresso cadastrado ainda — cadastre pelo menos um em{" "}
          <a href="/congressos/novo" className="underline">
            Congressos
          </a>{" "}
          antes de preencher esta tabela.
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1500px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-ink/40">
              <th className="px-2 py-1">Congresso</th>
              <th className="px-2 py-1">Participantes que vão</th>
              <th className="px-2 py-1">Nome do trabalho</th>
              <th className="px-2 py-1">Autor principal</th>
              <th className="px-2 py-1">Coautores (máx. {MAX_COAUTORES})</th>
              <th className="px-2 py-1">Enviado p/ orientador</th>
              <th className="px-2 py-1">Orientador que corrigiu</th>
              <th className="px-2 py-1">Enviado p/ congresso</th>
              <th className="px-2 py-1">Aprovado</th>
              <th className="px-2 py-1">Certificado</th>
              <th className="px-2 py-1">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const formId = `tracking-${row.id}`;
              return (
                <tr key={row.id} className="align-top">
                  <td className="rounded-l-2xl bg-white px-2 py-2">
                    <form id={formId} action={updateTrackingRowAction} className="hidden" />
                    <input type="hidden" name="id" value={row.id} form={formId} />
                    <select
                      name="congressId"
                      defaultValue={row.congress_id ?? ""}
                      form={formId}
                      className="input w-48"
                    >
                      <option value="">— selecione —</option>
                      {congressos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="bg-white px-2 py-2">
                    <div className="w-56">
                      <PersonMultiSelect
                        name="participantes"
                        people={membros}
                        defaultValues={row.participantes.map((p) => p.id)}
                        formId={formId}
                      />
                    </div>
                  </td>

                  <td className="bg-white px-2 py-2">
                    <input
                      type="text"
                      name="nomeTrabalho"
                      defaultValue={row.nome_trabalho ?? ""}
                      form={formId}
                      className="input w-48"
                      placeholder="Nome do trabalho"
                    />
                  </td>

                  <td className="bg-white px-2 py-2">
                    <div className="w-48">
                      <PersonSelect
                        name="autorPrincipalId"
                        people={membros}
                        defaultValue={row.autor_principal_id}
                        formId={formId}
                        placeholder="Autor principal..."
                        required
                      />
                    </div>
                  </td>

                  <td className="bg-white px-2 py-2">
                    <div className="w-56">
                      <PersonMultiSelect
                        name="coautores"
                        people={membros}
                        defaultValues={row.coautores.map((c) => c.id)}
                        formId={formId}
                        max={MAX_COAUTORES}
                        placeholder="Adicionar coautor..."
                      />
                    </div>
                  </td>

                  <td className="bg-white px-2 py-2">
                    <select
                      name="enviadoOrientador"
                      defaultValue={row.enviado_orientador}
                      form={formId}
                      className="input w-32"
                    >
                      <option value="nao">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </td>

                  <td className="bg-white px-2 py-2">
                    <div className="w-48">
                      <PersonSelect
                        name="orientadorCorretorId"
                        people={orientadores}
                        defaultValue={row.orientador_corretor_id}
                        formId={formId}
                        placeholder="Orientador(a)..."
                      />
                    </div>
                  </td>

                  <td className="bg-white px-2 py-2">
                    <select
                      name="enviadoCongresso"
                      defaultValue={row.enviado_congresso}
                      form={formId}
                      className="input w-32"
                    >
                      <option value="nao">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </td>

                  <td className="bg-white px-2 py-2">
                    <select
                      name="statusAprovacao"
                      defaultValue={row.status_aprovacao}
                      form={formId}
                      className="input w-40"
                    >
                      {STATUS_APROVACAO_TRABALHO.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="bg-white px-2 py-2">
                    <div className="w-40 space-y-1">
                      {row.certificado_filename && (
                        <div className="flex items-center gap-2 text-xs">
                          <a
                            href={`/api/restrita/certificado/${row.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-teal underline"
                          >
                            visualizar
                          </a>
                          <a
                            href={`/api/restrita/certificado/${row.id}?download=1`}
                            className="text-brand-teal underline"
                          >
                            baixar
                          </a>
                        </div>
                      )}
                      <input
                        type="file"
                        name="certificado"
                        accept="application/pdf"
                        form={formId}
                        className="w-full text-xs"
                      />
                      {row.certificado_filename && (
                        <label className="flex items-center gap-1.5 text-xs text-brand-ink/50">
                          <input type="checkbox" name="removerCertificado" form={formId} />
                          remover certificado
                        </label>
                      )}
                    </div>
                  </td>

                  <td className="rounded-r-2xl bg-white px-2 py-2">
                    <div className="flex flex-col items-start gap-1.5">
                      <button type="submit" form={formId} className="btn-ghost text-brand-teal">
                        Salvar
                      </button>
                      <DeleteButton
                        action={deleteTrackingRowAction}
                        hiddenFields={{ id: row.id }}
                        confirmText={`Excluir esta linha (${row.nome_trabalho || "sem nome"})?`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="mt-3 text-sm text-brand-ink/40">
            Nenhuma linha ainda — clique em &ldquo;+ Nova linha&rdquo; para começar.
          </p>
        )}
      </div>
    </div>
  );
}
