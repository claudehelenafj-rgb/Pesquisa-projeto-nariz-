import { getDb } from "@/lib/db";
import type { Role } from "@/lib/types";

export interface Minute {
  id: number;
  titulo: string;
  data_reuniao: string | null;
  conteudo: string | null;
  created_at: string;
}

export function getMinutes(): Minute[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM restricted_minutes ORDER BY data_reuniao DESC, created_at DESC`).all() as Minute[];
}

export function getMinuteById(id: number): Minute | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM restricted_minutes WHERE id = ?`).get(id) as Minute | undefined;
}

export interface Note {
  id: number;
  titulo: string;
  conteudo: string | null;
  created_at: string;
}

export function getNotes(): Note[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM restricted_notes ORDER BY created_at DESC`).all() as Note[];
}

export function getNoteById(id: number): Note | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM restricted_notes WHERE id = ?`).get(id) as Note | undefined;
}

export interface UserRow {
  id: number;
  username: string;
  role: Role;
  member_id: number | null;
  member_nome: string | null;
  must_change_password: number;
  created_at: string;
}

export function getAllUsers(): UserRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT u.id, u.username, u.role, u.member_id, m.nome as member_nome, u.must_change_password, u.created_at
       FROM users u LEFT JOIN members m ON m.id = u.member_id
       ORDER BY u.created_at DESC`
    )
    .all() as UserRow[];
}

export interface ProductionReportRow {
  id: number;
  nome: string;
  geracao: string | null;
  cor: string | null;
  total: number;
  trabalhosAtivos: number;
}

export function getProductionReport(): ProductionReportRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT m.id, m.nome, m.geracao, m.cor,
        (e.apresent_autor_local + e.apresent_coautor_local + e.apresent_autor_nacional +
         e.apresent_coautor_nacional + e.resumos_anais + e.capitulos_livro +
         e.artigos_revista + e.organizacao_eventos) as total
       FROM members m
       JOIN member_experience e ON e.member_id = m.id
       WHERE m.tipo = 'membro'
       ORDER BY total DESC`
    )
    .all() as { id: number; nome: string; geracao: string | null; cor: string | null; total: number }[];

  const activeWorksStmt = db.prepare(
    `SELECT COUNT(*) as n FROM works WHERE status NOT IN ('apresentado','publicado')
     AND (autor_principal_id = ? OR id IN (SELECT work_id FROM work_coauthors WHERE member_id = ?))`
  );

  return rows.map((r) => ({
    ...r,
    trabalhosAtivos: (activeWorksStmt.get(r.id, r.id) as { n: number }).n,
  }));
}
