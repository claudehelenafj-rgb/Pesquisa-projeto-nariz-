"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getDb } from "./db";
import { getSession, requireUser } from "./auth";
import type { Role } from "./types";

export interface LoginState {
  error?: string;
}

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  role: Role;
  member_id: number | null;
  must_change_password: number;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Informe usuário e senha." };
  }

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE lower(username) = ?").get(username) as
    | UserRow
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { error: "Usuário ou senha inválidos." };
  }

  let nome: string | null = null;
  if (user.member_id) {
    const member = db.prepare("SELECT nome FROM members WHERE id = ?").get(user.member_id) as
      | { nome: string }
      | undefined;
    nome = member?.nome ?? null;
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.role = user.role;
  session.memberId = user.member_id;
  session.nome = nome;
  session.mustChangePassword = Boolean(user.must_change_password);
  await session.save();

  redirect("/");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}

export interface ChangePasswordState {
  error?: string;
  success?: boolean;
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await requireUser();
  const senhaAtual = String(formData.get("senhaAtual") || "");
  const novaSenha = String(formData.get("novaSenha") || "");
  const confirmar = String(formData.get("confirmar") || "");

  if (novaSenha.length < 6) {
    return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
  }
  if (novaSenha !== confirmar) {
    return { error: "A confirmação não confere com a nova senha." };
  }

  const db = getDb();
  const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as
    | { password_hash: string }
    | undefined;
  if (!row || !bcrypt.compareSync(senhaAtual, row.password_hash)) {
    return { error: "Senha atual incorreta." };
  }

  const hash = bcrypt.hashSync(novaSenha, 10);
  db.prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?").run(
    hash,
    user.id
  );

  const session = await getSession();
  session.mustChangePassword = false;
  await session.save();

  return { success: true };
}
