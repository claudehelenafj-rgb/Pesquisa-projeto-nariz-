import { getDb } from "@/lib/db";
import type { StatusCongresso } from "@/lib/types";

export interface CongressOption {
  id: number;
  nome: string;
}

export function getCongressOptions(): CongressOption[] {
  const db = getDb();
  return db
    .prepare(`SELECT id, nome FROM congresses ORDER BY prazo_submissao IS NULL, prazo_submissao`)
    .all() as CongressOption[];
}

export function getCongressOptionsWithPrazo(): (CongressOption & { prazo_submissao: string | null })[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, nome, prazo_submissao FROM congresses ORDER BY prazo_submissao IS NULL, prazo_submissao`
    )
    .all() as (CongressOption & { prazo_submissao: string | null })[];
}

export interface Congress {
  id: number;
  nome: string;
  area: string | null;
  cidade: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  prazo_submissao: string | null;
  link: string | null;
  valor_inscricao: string | null;
  status: StatusCongresso;
  created_at: string;
}

export function getCongressById(id: number): Congress | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM congresses WHERE id = ?`).get(id) as Congress | undefined;
}

export function getCongressResponsibleIds(congressId: number): number[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT member_id FROM congress_responsibles WHERE congress_id = ?`)
    .all(congressId) as { member_id: number }[];
  return rows.map((r) => r.member_id);
}

export interface CongressWithResponsibles extends Congress {
  responsaveis: { id: number; nome: string; geracao: string | null; cor: string | null }[];
}

export function getAllCongresses(filters?: {
  status?: string;
  cidade?: string;
  area?: string;
  responsavelId?: number;
}): CongressWithResponsibles[] {
  const db = getDb();
  let sql = `SELECT DISTINCT c.* FROM congresses c`;
  const args: (string | number)[] = [];
  const where: string[] = [];

  if (filters?.responsavelId) {
    sql += ` JOIN congress_responsibles cr ON cr.congress_id = c.id AND cr.member_id = ?`;
    args.push(filters.responsavelId);
  }
  if (filters?.status) {
    where.push(`c.status = ?`);
    args.push(filters.status);
  }
  if (filters?.cidade) {
    where.push(`c.cidade = ?`);
    args.push(filters.cidade);
  }
  if (filters?.area) {
    where.push(`c.area = ?`);
    args.push(filters.area);
  }
  if (where.length) sql += ` WHERE ` + where.join(" AND ");
  sql += ` ORDER BY c.prazo_submissao IS NULL, c.prazo_submissao`;

  const congresses = db.prepare(sql).all(...args) as Congress[];

  const respStmt = db.prepare(
    `SELECT m.id, m.nome, m.geracao, m.cor FROM congress_responsibles cr
     JOIN members m ON m.id = cr.member_id WHERE cr.congress_id = ? ORDER BY m.nome`
  );

  return congresses.map((c) => ({
    ...c,
    responsaveis: respStmt.all(c.id) as CongressWithResponsibles["responsaveis"],
  }));
}

export function getDistinctCongressValues() {
  const db = getDb();
  const cidades = (
    db.prepare(`SELECT DISTINCT cidade FROM congresses WHERE cidade IS NOT NULL AND cidade != '' ORDER BY cidade`).all() as {
      cidade: string;
    }[]
  ).map((r) => r.cidade);
  const areas = (
    db.prepare(`SELECT DISTINCT area FROM congresses WHERE area IS NOT NULL AND area != '' ORDER BY area`).all() as {
      area: string;
    }[]
  ).map((r) => r.area);
  return { cidades, areas };
}
