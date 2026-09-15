"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireUser, canAccessRestricted } from "@/lib/auth";
import type { InteresseIC, StatusMembro } from "@/lib/types";

async function assertCanEdit(memberId: number) {
  const user = await requireUser();
  const allowed = user.memberId === memberId || canAccessRestricted(user.role);
  if (!allowed) {
    throw new Error("Você não tem permissão para editar este perfil.");
  }
  return user;
}

const EXPERIENCE_FIELDS = [
  "apresent_autor_local",
  "apresent_coautor_local",
  "apresent_autor_nacional",
  "apresent_coautor_nacional",
  "resumos_anais",
  "capitulos_livro",
  "artigos_revista",
  "organizacao_eventos",
] as const;

export async function updateProfileAction(formData: FormData) {
  const memberId = Number(formData.get("memberId"));
  await assertCanEdit(memberId);

  const db = getDb();
  const curso = String(formData.get("curso") || "").trim() || null;
  const semestre = String(formData.get("semestre") || "").trim() || null;
  const status = (String(formData.get("status") || "") || null) as StatusMembro | null;
  const dataEntrada = String(formData.get("dataEntrada") || "").trim() || null;
  const interesseIc = (String(formData.get("interesseIc") || "") || null) as InteresseIC | null;
  const obsDisponibilidade = String(formData.get("obsDisponibilidade") || "").trim() || null;

  const temas = formData.getAll("temas").map(String).filter(Boolean);
  const cidades = formData.getAll("cidades").map(String).filter(Boolean);

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE members SET curso = ?, semestre = ?, status = ?, data_entrada = ?, interesse_ic = ?, obs_disponibilidade = ?
       WHERE id = ?`
    ).run(curso, semestre, status, dataEntrada, interesseIc, obsDisponibilidade, memberId);

    db.prepare(`DELETE FROM member_interests WHERE member_id = ?`).run(memberId);
    const insertInterest = db.prepare(
      `INSERT OR IGNORE INTO member_interests (member_id, tema) VALUES (?, ?)`
    );
    for (const tema of temas) insertInterest.run(memberId, tema);

    db.prepare(`DELETE FROM member_travel_cities WHERE member_id = ?`).run(memberId);
    const insertCity = db.prepare(
      `INSERT OR IGNORE INTO member_travel_cities (member_id, cidade) VALUES (?, ?)`
    );
    for (const cidade of cidades) insertCity.run(memberId, cidade);

    const experienceValues = EXPERIENCE_FIELDS.map((field) => {
      const raw = Number(formData.get(field));
      return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;
    });
    db.prepare(
      `UPDATE member_experience SET
        apresent_autor_local = ?, apresent_coautor_local = ?,
        apresent_autor_nacional = ?, apresent_coautor_nacional = ?,
        resumos_anais = ?, capitulos_livro = ?, artigos_revista = ?, organizacao_eventos = ?
       WHERE member_id = ?`
    ).run(...experienceValues, memberId);
  });
  tx();

  revalidatePath(`/membros/${memberId}`);
}

export async function addCongressHistoryAction(formData: FormData) {
  const memberId = Number(formData.get("memberId"));
  await assertCanEdit(memberId);

  const tipo = String(formData.get("tipo") || "ja_foi");
  const ano = String(formData.get("ano") || "").trim() || null;
  const congressIdRaw = String(formData.get("congressId") || "");
  const nomeLivre = String(formData.get("nomeLivre") || "").trim() || null;

  if (!congressIdRaw && !nomeLivre) return;

  const db = getDb();
  db.prepare(
    `INSERT INTO member_congress_history (member_id, congress_id, nome_livre, tipo, ano)
     VALUES (?, ?, ?, ?, ?)`
  ).run(memberId, congressIdRaw ? Number(congressIdRaw) : null, congressIdRaw ? null : nomeLivre, tipo, ano);

  revalidatePath(`/membros/${memberId}`);
}

export async function removeCongressHistoryAction(formData: FormData) {
  const memberId = Number(formData.get("memberId"));
  await assertCanEdit(memberId);
  const historyId = Number(formData.get("historyId"));

  const db = getDb();
  db.prepare(`DELETE FROM member_congress_history WHERE id = ? AND member_id = ?`).run(
    historyId,
    memberId
  );

  revalidatePath(`/membros/${memberId}`);
}
