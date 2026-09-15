"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRestricted } from "@/lib/auth";
import type { Role } from "@/lib/types";

// --- Atas ---
export async function createMinuteAction(formData: FormData) {
  await requireRestricted();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) throw new Error("Título é obrigatório.");
  const dataReuniao = String(formData.get("dataReuniao") || "").trim() || null;
  const conteudo = String(formData.get("conteudo") || "").trim() || null;

  const user = await requireRestricted();
  const db = getDb();
  db.prepare(
    `INSERT INTO restricted_minutes (titulo, data_reuniao, conteudo, created_by) VALUES (?, ?, ?, ?)`
  ).run(titulo, dataReuniao, conteudo, user.id);

  revalidatePath("/restrita/atas");
  redirect("/restrita/atas");
}

export async function deleteMinuteAction(formData: FormData) {
  await requireRestricted();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare(`DELETE FROM restricted_minutes WHERE id = ?`).run(id);
  revalidatePath("/restrita/atas");
  redirect("/restrita/atas");
}

// --- Notas confidenciais ---
export async function createNoteAction(formData: FormData) {
  const user = await requireRestricted();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) throw new Error("Título é obrigatório.");
  const conteudo = String(formData.get("conteudo") || "").trim() || null;

  const db = getDb();
  db.prepare(`INSERT INTO restricted_notes (titulo, conteudo, created_by) VALUES (?, ?, ?)`).run(
    titulo,
    conteudo,
    user.id
  );

  revalidatePath("/restrita/notas");
  redirect("/restrita/notas");
}

export async function deleteNoteAction(formData: FormData) {
  await requireRestricted();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare(`DELETE FROM restricted_notes WHERE id = ?`).run(id);
  revalidatePath("/restrita/notas");
  redirect("/restrita/notas");
}

// --- Dados sensíveis ---
export async function updateSensitiveDataAction(formData: FormData) {
  await requireRestricted();
  const memberId = Number(formData.get("memberId"));
  const matricula = String(formData.get("matricula") || "").trim() || null;
  const documento = String(formData.get("documento") || "").trim() || null;

  const db = getDb();
  db.prepare(`UPDATE members SET matricula = ?, documento = ? WHERE id = ?`).run(
    matricula,
    documento,
    memberId
  );

  revalidatePath("/restrita/dados-sensiveis");
}

// --- Gestão de usuários ---
export async function createUserAction(formData: FormData) {
  await requireRestricted();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const senha = String(formData.get("senha") || "");
  const role = String(formData.get("role") || "membro") as Role;
  const memberId = formData.get("memberId") ? Number(formData.get("memberId")) : null;

  if (!username || senha.length < 6) {
    throw new Error("Usuário e senha (mín. 6 caracteres) são obrigatórios.");
  }

  const db = getDb();
  db.prepare(
    `INSERT INTO users (username, password_hash, role, member_id, must_change_password)
     VALUES (?, ?, ?, ?, 1)`
  ).run(username, bcrypt.hashSync(senha, 10), role, memberId);

  revalidatePath("/restrita/usuarios");
}

export async function updateUserRoleAction(formData: FormData) {
  await requireRestricted();
  const id = Number(formData.get("id"));
  const role = String(formData.get("role") || "membro") as Role;

  const db = getDb();
  db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, id);

  revalidatePath("/restrita/usuarios");
}

export async function resetPasswordAction(formData: FormData) {
  await requireRestricted();
  const id = Number(formData.get("id"));
  const novaSenha = String(formData.get("novaSenha") || "");
  if (novaSenha.length < 6) throw new Error("Senha precisa ter pelo menos 6 caracteres.");

  const db = getDb();
  db.prepare(`UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?`).run(
    bcrypt.hashSync(novaSenha, 10),
    id
  );

  revalidatePath("/restrita/usuarios");
}

export async function deleteUserAction(formData: FormData) {
  await requireRestricted();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  revalidatePath("/restrita/usuarios");
}
