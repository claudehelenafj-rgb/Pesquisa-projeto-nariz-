import type { SessionOptions } from "iron-session";
import type { Role } from "./types";

export interface SessionData {
  userId?: number;
  username?: string;
  role?: Role;
  memberId?: number | null;
  nome?: string | null;
  mustChangePassword?: boolean;
}

const FALLBACK_DEV_SECRET = "projeto-nariz-dev-secret-troque-em-producao-32ch";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || FALLBACK_DEV_SECRET,
  cookieName: "nariz_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
  },
};

if (!process.env.SESSION_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    "[projeto-nariz] SESSION_SECRET não definido — usando segredo padrão de desenvolvimento. Defina SESSION_SECRET em produção (ver .env.example)."
  );
}
