"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRestricted } from "@/lib/auth";
import { MAX_COAUTORES } from "@/lib/queries/work-tracking";
import type { StatusAprovacaoTrabalho, StatusSimNao } from "@/lib/types";

const PATH = "/restrita/acompanhamento";

export async function createTrackingRowAction() {
  await requireRestricted();
  const db = getDb();
  db.prepare(`INSERT INTO work_tracking DEFAULT VALUES`).run();
  revalidatePath(PATH);
}

function toNullableId(formData: FormData, field: string): number | null {
  const raw = formData.get(field);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function updateTrackingRowAction(formData: FormData) {
  await requireRestricted();
  const id = Number(formData.get("id"));
  if (!id) return;

  const congressId = toNullableId(formData, "congressId");
  const nomeTrabalho = String(formData.get("nomeTrabalho") || "").trim() || null;
  const autorPrincipalId = toNullableId(formData, "autorPrincipalId");
  if (!autorPrincipalId) {
    throw new Error("Autor principal é obrigatório.");
  }
  const enviadoOrientador = (String(formData.get("enviadoOrientador") || "nao") || "nao") as StatusSimNao;
  const orientadorCorretorId = toNullableId(formData, "orientadorCorretorId");
  const enviadoCongresso = (String(formData.get("enviadoCongresso") || "nao") || "nao") as StatusSimNao;
  const statusAprovacao = (String(formData.get("statusAprovacao") || "aguardando") ||
    "aguardando") as StatusAprovacaoTrabalho;
  const participantes = formData.getAll("participantes").map(Number).filter((n) => n > 0);
  const coautores = formData.getAll("coautores").map(Number).filter((n) => n > 0);
  if (coautores.length > MAX_COAUTORES) {
    throw new Error(`No máximo ${MAX_COAUTORES} coautores por trabalho.`);
  }

  const removerCertificado = formData.get("removerCertificado") === "on";
  const certificado = formData.get("certificado");
  const temNovoCertificado =
    certificado instanceof File && certificado.size > 0 && certificado.name;

  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE work_tracking SET
        congress_id = ?, nome_trabalho = ?, autor_principal_id = ?,
        enviado_orientador = ?, orientador_corretor_id = ?, enviado_congresso = ?, status_aprovacao = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      congressId,
      nomeTrabalho,
      autorPrincipalId,
      enviadoOrientador,
      orientadorCorretorId,
      enviadoCongresso,
      statusAprovacao,
      id
    );

    db.prepare(`DELETE FROM work_tracking_participants WHERE tracking_id = ?`).run(id);
    const insertPart = db.prepare(
      `INSERT OR IGNORE INTO work_tracking_participants (tracking_id, member_id) VALUES (?, ?)`
    );
    for (const memberId of participantes) insertPart.run(id, memberId);

    db.prepare(`DELETE FROM work_tracking_coauthors WHERE tracking_id = ?`).run(id);
    const insertCoautor = db.prepare(
      `INSERT OR IGNORE INTO work_tracking_coauthors (tracking_id, member_id) VALUES (?, ?)`
    );
    for (const memberId of coautores) insertCoautor.run(id, memberId);

    if (removerCertificado) {
      db.prepare(
        `UPDATE work_tracking SET certificado_filename = NULL, certificado_mime = NULL, certificado_size = NULL, certificado_data = NULL WHERE id = ?`
      ).run(id);
    }
  });
  tx();

  if (temNovoCertificado && certificado instanceof File) {
    if (certificado.type !== "application/pdf" && !certificado.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("O certificado precisa ser um arquivo PDF.");
    }
    const buffer = Buffer.from(await certificado.arrayBuffer());
    db.prepare(
      `UPDATE work_tracking SET certificado_filename = ?, certificado_mime = ?, certificado_size = ?, certificado_data = ? WHERE id = ?`
    ).run(certificado.name, certificado.type || "application/pdf", buffer.length, buffer, id);
  }

  revalidatePath(PATH);
}

export async function deleteTrackingRowAction(formData: FormData) {
  await requireRestricted();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare(`DELETE FROM work_tracking WHERE id = ?`).run(id);
  revalidatePath(PATH);
}
