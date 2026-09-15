import { getDb } from "@/lib/db";
import type { DestinoTrabalho, StatusTrabalho, TipoTrabalho } from "@/lib/types";

export interface Work {
  id: number;
  titulo: string;
  tipo: TipoTrabalho;
  destino_tipo: DestinoTrabalho;
  congress_id: number | null;
  revista_nome: string | null;
  autor_principal_id: number | null;
  orientador_id: number | null;
  prazo_submissao: string | null;
  status: StatusTrabalho;
  link: string | null;
  idea_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkWithRelations extends Work {
  autor_nome: string | null;
  autor_geracao: string | null;
  autor_cor: string | null;
  orientador_nome: string | null;
  congresso_nome: string | null;
  coautores: { id: number; nome: string; geracao: string | null; cor: string | null }[];
}

function attachRelations(rows: Work[]): WorkWithRelations[] {
  const db = getDb();
  const coautoresStmt = db.prepare(
    `SELECT m.id, m.nome, m.geracao, m.cor FROM work_coauthors wc
     JOIN members m ON m.id = wc.member_id WHERE wc.work_id = ? ORDER BY m.nome`
  );
  return rows.map((r) => ({
    ...r,
    coautores: coautoresStmt.all(r.id) as WorkWithRelations["coautores"],
  })) as WorkWithRelations[];
}

export function getAllWorks(filters?: { status?: string; tipo?: string; autorId?: number }) {
  const db = getDb();
  let sql = `
    SELECT w.*, a.nome as autor_nome, a.geracao as autor_geracao, a.cor as autor_cor,
           o.nome as orientador_nome, c.nome as congresso_nome
    FROM works w
    LEFT JOIN members a ON a.id = w.autor_principal_id
    LEFT JOIN members o ON o.id = w.orientador_id
    LEFT JOIN congresses c ON c.id = w.congress_id
  `;
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (filters?.status) {
    where.push(`w.status = ?`);
    args.push(filters.status);
  }
  if (filters?.tipo) {
    where.push(`w.tipo = ?`);
    args.push(filters.tipo);
  }
  if (filters?.autorId) {
    where.push(`w.autor_principal_id = ?`);
    args.push(filters.autorId);
  }
  if (where.length) sql += ` WHERE ` + where.join(" AND ");
  sql += ` ORDER BY w.updated_at DESC`;

  const rows = db.prepare(sql).all(...args) as (Work & {
    autor_nome: string | null;
    autor_geracao: string | null;
    autor_cor: string | null;
    orientador_nome: string | null;
    congresso_nome: string | null;
  })[];

  return attachRelations(rows);
}

export function getWorkById(id: number): WorkWithRelations | undefined {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT w.*, a.nome as autor_nome, a.geracao as autor_geracao, a.cor as autor_cor,
              o.nome as orientador_nome, c.nome as congresso_nome
       FROM works w
       LEFT JOIN members a ON a.id = w.autor_principal_id
       LEFT JOIN members o ON o.id = w.orientador_id
       LEFT JOIN congresses c ON c.id = w.congress_id
       WHERE w.id = ?`
    )
    .get(id) as
    | (Work & {
        autor_nome: string | null;
        autor_geracao: string | null;
        autor_cor: string | null;
        orientador_nome: string | null;
        congresso_nome: string | null;
      })
    | undefined;
  if (!row) return undefined;
  return attachRelations([row])[0];
}

export function getWorkCoauthorIds(workId: number): number[] {
  const db = getDb();
  const rows = db.prepare(`SELECT member_id FROM work_coauthors WHERE work_id = ?`).all(workId) as {
    member_id: number;
  }[];
  return rows.map((r) => r.member_id);
}
