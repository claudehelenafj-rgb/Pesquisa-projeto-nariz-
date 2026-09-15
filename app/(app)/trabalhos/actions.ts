"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { DestinoTrabalho, StatusTrabalho, TipoTrabalho } from "@/lib/types";

function readWorkFields(formData: FormData) {
  const destinoTipo = String(formData.get("destinoTipo") || "congresso") as DestinoTrabalho;
  return {
    titulo: String(formData.get("titulo") || "").trim(),
    tipo: String(formData.get("tipo") || "resumo_simples") as TipoTrabalho,
    destino_tipo: destinoTipo,
    congress_id:
      destinoTipo === "congresso" && formData.get("congressId")
        ? Number(formData.get("congressId"))
        : null,
    revista_nome:
      destinoTipo === "revista" ? String(formData.get("revistaNome") || "").trim() || null : null,
    autor_principal_id: formData.get("autorPrincipal") ? Number(formData.get("autorPrincipal")) : null,
    orientador_id: formData.get("orientador") ? Number(formData.get("orientador")) : null,
    prazo_submissao: String(formData.get("prazoSubmissao") || "").trim() || null,
    status: String(formData.get("status") || "escrevendo") as StatusTrabalho,
    link: String(formData.get("link") || "").trim() || null,
  };
}

export async function createWorkAction(formData: FormData) {
  await requireUser();
  const fields = readWorkFields(formData);
  if (!fields.titulo) throw new Error("Título é obrigatório.");

  const coautorIds = formData.getAll("coautores").map(Number).filter(Boolean);

  const db = getDb();
  let newId = 0;
  const tx = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO works (titulo, tipo, destino_tipo, congress_id, revista_nome, autor_principal_id,
          orientador_id, prazo_submissao, status, link)
         VALUES (@titulo, @tipo, @destino_tipo, @congress_id, @revista_nome, @autor_principal_id,
          @orientador_id, @prazo_submissao, @status, @link)`
      )
      .run(fields);
    newId = Number(info.lastInsertRowid);
    const insertCoautor = db.prepare(
      `INSERT OR IGNORE INTO work_coauthors (work_id, member_id) VALUES (?, ?)`
    );
    for (const id of coautorIds) insertCoautor.run(newId, id);
  });
  tx();

  revalidatePath("/trabalhos");
  redirect(`/trabalhos/${newId}`);
}

export async function updateWorkAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const fields = readWorkFields(formData);
  if (!fields.titulo) throw new Error("Título é obrigatório.");

  const coautorIds = formData.getAll("coautores").map(Number).filter(Boolean);

  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE works SET titulo=@titulo, tipo=@tipo, destino_tipo=@destino_tipo, congress_id=@congress_id,
        revista_nome=@revista_nome, autor_principal_id=@autor_principal_id, orientador_id=@orientador_id,
        prazo_submissao=@prazo_submissao, status=@status, link=@link, updated_at=datetime('now')
       WHERE id=@id`
    ).run({ ...fields, id });

    db.prepare(`DELETE FROM work_coauthors WHERE work_id = ?`).run(id);
    const insertCoautor = db.prepare(
      `INSERT OR IGNORE INTO work_coauthors (work_id, member_id) VALUES (?, ?)`
    );
    for (const memberId of coautorIds) insertCoautor.run(id, memberId);
  });
  tx();

  revalidatePath("/trabalhos");
  revalidatePath(`/trabalhos/${id}`);
  redirect(`/trabalhos/${id}`);
}

export async function deleteWorkAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare(`DELETE FROM works WHERE id = ?`).run(id);
  revalidatePath("/trabalhos");
  redirect("/trabalhos");
}
