"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { StatusCongresso } from "@/lib/types";

function readCongressFields(formData: FormData) {
  return {
    nome: String(formData.get("nome") || "").trim(),
    area: String(formData.get("area") || "").trim() || null,
    cidade: String(formData.get("cidade") || "").trim() || null,
    data_inicio: String(formData.get("dataInicio") || "").trim() || null,
    data_fim: String(formData.get("dataFim") || "").trim() || null,
    prazo_submissao: String(formData.get("prazoSubmissao") || "").trim() || null,
    link: String(formData.get("link") || "").trim() || null,
    valor_inscricao: String(formData.get("valorInscricao") || "").trim() || null,
    status: (String(formData.get("status") || "planejado") || "planejado") as StatusCongresso,
  };
}

export async function createCongressAction(formData: FormData) {
  await requireUser();
  const fields = readCongressFields(formData);
  if (!fields.nome) throw new Error("Nome do congresso é obrigatório.");

  const responsavelIds = formData.getAll("responsaveis").map(Number).filter(Boolean);

  const db = getDb();
  let newId = 0;
  const tx = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO congresses (nome, area, cidade, data_inicio, data_fim, prazo_submissao, link, valor_inscricao, status)
         VALUES (@nome, @area, @cidade, @data_inicio, @data_fim, @prazo_submissao, @link, @valor_inscricao, @status)`
      )
      .run(fields);
    newId = Number(info.lastInsertRowid);
    const insertResp = db.prepare(
      `INSERT OR IGNORE INTO congress_responsibles (congress_id, member_id) VALUES (?, ?)`
    );
    for (const id of responsavelIds) insertResp.run(newId, id);
  });
  tx();

  revalidatePath("/congressos");
  redirect(`/congressos/${newId}`);
}

export async function updateCongressAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const fields = readCongressFields(formData);
  if (!fields.nome) throw new Error("Nome do congresso é obrigatório.");

  const responsavelIds = formData.getAll("responsaveis").map(Number).filter(Boolean);

  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE congresses SET nome=@nome, area=@area, cidade=@cidade, data_inicio=@data_inicio,
        data_fim=@data_fim, prazo_submissao=@prazo_submissao, link=@link,
        valor_inscricao=@valor_inscricao, status=@status WHERE id=@id`
    ).run({ ...fields, id });

    db.prepare(`DELETE FROM congress_responsibles WHERE congress_id = ?`).run(id);
    const insertResp = db.prepare(
      `INSERT OR IGNORE INTO congress_responsibles (congress_id, member_id) VALUES (?, ?)`
    );
    for (const memberId of responsavelIds) insertResp.run(id, memberId);
  });
  tx();

  revalidatePath("/congressos");
  revalidatePath(`/congressos/${id}`);
  redirect(`/congressos/${id}`);
}

export async function deleteCongressAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare(`DELETE FROM congresses WHERE id = ?`).run(id);
  revalidatePath("/congressos");
  redirect("/congressos");
}
