"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { StatusIdeia } from "@/lib/types";

export async function createIdeaAction(formData: FormData) {
  await requireUser();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) throw new Error("Título é obrigatório.");

  const descricao = String(formData.get("descricao") || "").trim() || null;
  const propostaPor = formData.get("propostaPor") ? Number(formData.get("propostaPor")) : null;
  const eixoTematico = String(formData.get("eixoTematico") || "").trim() || null;
  const orientadorSugerido = formData.get("orientadorSugerido")
    ? Number(formData.get("orientadorSugerido"))
    : null;

  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO ideas (titulo, descricao, proposta_por, eixo_tematico, orientador_sugerido, status)
       VALUES (?, ?, ?, ?, ?, 'ideia')`
    )
    .run(titulo, descricao, propostaPor, eixoTematico, orientadorSugerido);

  revalidatePath("/ideias");
  redirect(`/ideias/${info.lastInsertRowid}`);
}

export async function updateIdeaAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) throw new Error("Título é obrigatório.");

  const descricao = String(formData.get("descricao") || "").trim() || null;
  const propostaPor = formData.get("propostaPor") ? Number(formData.get("propostaPor")) : null;
  const eixoTematico = String(formData.get("eixoTematico") || "").trim() || null;
  const orientadorSugerido = formData.get("orientadorSugerido")
    ? Number(formData.get("orientadorSugerido"))
    : null;
  const status = String(formData.get("status") || "ideia") as StatusIdeia;

  const db = getDb();
  db.prepare(
    `UPDATE ideas SET titulo=?, descricao=?, proposta_por=?, eixo_tematico=?, orientador_sugerido=?, status=?
     WHERE id=?`
  ).run(titulo, descricao, propostaPor, eixoTematico, orientadorSugerido, status, id);

  revalidatePath("/ideias");
  revalidatePath(`/ideias/${id}`);
  redirect(`/ideias/${id}`);
}

export async function setIdeaStatusAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "ideia") as StatusIdeia;

  const db = getDb();
  db.prepare(`UPDATE ideas SET status = ? WHERE id = ?`).run(status, id);

  revalidatePath("/ideias");
  revalidatePath(`/ideias/${id}`);
}

export async function deleteIdeaAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare(`DELETE FROM ideas WHERE id = ?`).run(id);
  revalidatePath("/ideias");
  redirect("/ideias");
}

export async function joinIdeaAction(formData: FormData) {
  const user = await requireUser();
  const ideaId = Number(formData.get("ideaId"));
  if (!user.memberId) return;

  const db = getDb();
  db.prepare(`INSERT OR IGNORE INTO idea_participants (idea_id, member_id) VALUES (?, ?)`).run(
    ideaId,
    user.memberId
  );
  revalidatePath(`/ideias/${ideaId}`);
}

export async function leaveIdeaAction(formData: FormData) {
  const user = await requireUser();
  const ideaId = Number(formData.get("ideaId"));
  if (!user.memberId) return;

  const db = getDb();
  db.prepare(`DELETE FROM idea_participants WHERE idea_id = ? AND member_id = ?`).run(
    ideaId,
    user.memberId
  );
  revalidatePath(`/ideias/${ideaId}`);
}

export async function addIdeaCommentAction(formData: FormData) {
  const user = await requireUser();
  const ideaId = Number(formData.get("ideaId"));
  const texto = String(formData.get("texto") || "").trim();
  if (!texto) return;

  const db = getDb();
  db.prepare(`INSERT INTO idea_comments (idea_id, member_id, texto) VALUES (?, ?, ?)`).run(
    ideaId,
    user.memberId,
    texto
  );
  revalidatePath(`/ideias/${ideaId}`);
}

export async function convertIdeaToWorkAction(formData: FormData) {
  await requireUser();
  const ideaId = Number(formData.get("ideaId"));

  const db = getDb();
  const idea = db.prepare(`SELECT * FROM ideas WHERE id = ?`).get(ideaId) as
    | {
        id: number;
        titulo: string;
        proposta_por: number | null;
        orientador_sugerido: number | null;
      }
    | undefined;
  if (!idea) redirect("/ideias");

  const info = db
    .prepare(
      `INSERT INTO works (titulo, tipo, destino_tipo, autor_principal_id, orientador_id, status, idea_id)
       VALUES (?, 'resumo_simples', 'congresso', ?, ?, 'escrevendo', ?)`
    )
    .run(idea!.titulo, idea!.proposta_por, idea!.orientador_sugerido, idea!.id);

  revalidatePath("/trabalhos");
  redirect(`/trabalhos/${info.lastInsertRowid}`);
}
