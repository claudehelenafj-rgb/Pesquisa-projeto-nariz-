import { getDb } from "@/lib/db";
import type { StatusAprovacaoTrabalho, StatusSimNao } from "@/lib/types";

export const MAX_COAUTORES = 8;

export interface WorkTrackingRow {
  id: number;
  congress_id: number | null;
  congresso_nome: string | null;
  nome_trabalho: string | null;
  autor_principal_id: number | null;
  autor_principal_nome: string | null;
  autor_principal_geracao: string | null;
  autor_principal_cor: string | null;
  enviado_orientador: StatusSimNao;
  orientador_corretor_id: number | null;
  orientador_corretor_nome: string | null;
  enviado_congresso: StatusSimNao;
  status_aprovacao: StatusAprovacaoTrabalho;
  certificado_filename: string | null;
  certificado_size: number | null;
  created_at: string;
  updated_at: string;
  participantes: { id: number; nome: string; geracao: string | null; cor: string | null }[];
  coautores: { id: number; nome: string; geracao: string | null; cor: string | null }[];
}

export function getAllWorkTracking(): WorkTrackingRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT wt.id, wt.congress_id, c.nome as congresso_nome, wt.nome_trabalho,
              wt.autor_principal_id, a.nome as autor_principal_nome, a.geracao as autor_principal_geracao, a.cor as autor_principal_cor,
              wt.enviado_orientador, wt.orientador_corretor_id, oc.nome as orientador_corretor_nome,
              wt.enviado_congresso, wt.status_aprovacao,
              wt.certificado_filename, wt.certificado_size,
              wt.created_at, wt.updated_at
       FROM work_tracking wt
       LEFT JOIN congresses c ON c.id = wt.congress_id
       LEFT JOIN members a ON a.id = wt.autor_principal_id
       LEFT JOIN members oc ON oc.id = wt.orientador_corretor_id
       ORDER BY wt.created_at DESC`
    )
    .all() as Omit<WorkTrackingRow, "participantes" | "coautores">[];

  const partStmt = db.prepare(
    `SELECT m.id, m.nome, m.geracao, m.cor FROM work_tracking_participants wtp
     JOIN members m ON m.id = wtp.member_id WHERE wtp.tracking_id = ? ORDER BY m.nome`
  );
  const coautorStmt = db.prepare(
    `SELECT m.id, m.nome, m.geracao, m.cor FROM work_tracking_coauthors wtc
     JOIN members m ON m.id = wtc.member_id WHERE wtc.tracking_id = ? ORDER BY m.nome`
  );

  return rows.map((r) => ({
    ...r,
    participantes: partStmt.all(r.id) as WorkTrackingRow["participantes"],
    coautores: coautorStmt.all(r.id) as WorkTrackingRow["coautores"],
  }));
}

export function getWorkTrackingCertificado(id: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT certificado_filename, certificado_mime, certificado_data FROM work_tracking WHERE id = ?`
    )
    .get(id) as
    | { certificado_filename: string | null; certificado_mime: string | null; certificado_data: Buffer | null }
    | undefined;
}

export interface MemberProductionEntry {
  trackingId: number;
  nomeTrabalho: string | null;
  congressoNome: string | null;
  papel: "autor_principal" | "coautor";
}

export interface MemberProduction {
  id: number;
  nome: string;
  geracao: string | null;
  cor: string | null;
  comoAutorPrincipal: number;
  comoCoautor: number;
  totalTrabalhos: number;
  trabalhos: MemberProductionEntry[];
}

/** Calculado a partir da tabela de Acompanhamento de Trabalhos (work_tracking) — nunca digitado manualmente. */
export function getProductionByMember(): MemberProduction[] {
  const db = getDb();
  const membros = db
    .prepare(`SELECT id, nome, geracao, cor FROM members WHERE tipo = 'membro' ORDER BY nome`)
    .all() as { id: number; nome: string; geracao: string | null; cor: string | null }[];

  const byMember = new Map<number, MemberProduction>();
  for (const m of membros) {
    byMember.set(m.id, {
      ...m,
      comoAutorPrincipal: 0,
      comoCoautor: 0,
      totalTrabalhos: 0,
      trabalhos: [],
    });
  }

  const autorRows = db
    .prepare(
      `SELECT wt.id as tracking_id, wt.autor_principal_id as member_id, wt.nome_trabalho, c.nome as congresso_nome
       FROM work_tracking wt LEFT JOIN congresses c ON c.id = wt.congress_id
       WHERE wt.autor_principal_id IS NOT NULL`
    )
    .all() as { tracking_id: number; member_id: number; nome_trabalho: string | null; congresso_nome: string | null }[];

  const coautorRows = db
    .prepare(
      `SELECT wtc.tracking_id, wtc.member_id, wt.nome_trabalho, c.nome as congresso_nome
       FROM work_tracking_coauthors wtc
       JOIN work_tracking wt ON wt.id = wtc.tracking_id
       LEFT JOIN congresses c ON c.id = wt.congress_id`
    )
    .all() as { tracking_id: number; member_id: number; nome_trabalho: string | null; congresso_nome: string | null }[];

  for (const r of autorRows) {
    const entry = byMember.get(r.member_id);
    if (!entry) continue;
    entry.comoAutorPrincipal += 1;
    entry.trabalhos.push({
      trackingId: r.tracking_id,
      nomeTrabalho: r.nome_trabalho,
      congressoNome: r.congresso_nome,
      papel: "autor_principal",
    });
  }
  for (const r of coautorRows) {
    const entry = byMember.get(r.member_id);
    if (!entry) continue;
    entry.comoCoautor += 1;
    entry.trabalhos.push({
      trackingId: r.tracking_id,
      nomeTrabalho: r.nome_trabalho,
      congressoNome: r.congresso_nome,
      papel: "coautor",
    });
  }

  for (const entry of byMember.values()) {
    entry.totalTrabalhos = entry.comoAutorPrincipal + entry.comoCoautor;
  }

  return Array.from(byMember.values());
}
