import "server-only";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { redirect } from "next/navigation";
import { sessionOptions, type SessionData } from "./session";
import type { Role } from "./types";

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

export interface CurrentUser {
  id: number;
  username: string;
  role: Role;
  memberId: number | null;
  nome: string | null;
  mustChangePassword: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session.userId || !session.role) return null;
  return {
    id: session.userId,
    username: session.username || "",
    role: session.role,
    memberId: session.memberId ?? null,
    nome: session.nome ?? null,
    mustChangePassword: Boolean(session.mustChangePassword),
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export const RESTRICTED_ROLES: Role[] = ["coordenadora", "presidencia"];

export function canAccessRestricted(role: Role) {
  return RESTRICTED_ROLES.includes(role);
}

/**
 * Só chamar em Server Components/Pages, Server Actions ou Route Handlers —
 * garante que a rota está protegida no servidor, não apenas escondida no menu.
 */
export async function requireRole(roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/acesso-negado");
  }
  return user;
}

export async function requireRestricted(): Promise<CurrentUser> {
  return requireRole(RESTRICTED_ROLES);
}
