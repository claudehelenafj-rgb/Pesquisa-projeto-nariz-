import { getDb } from "@/lib/db";
import type { StatusTrabalho } from "@/lib/types";

export interface CalendarItem {
  id: string;
  tipo: "submissao_congresso" | "evento_congresso" | "submissao_trabalho";
  titulo: string;
  data: string;
  href: string;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCalendarItems(): (CalendarItem & { diasRestantes: number })[] {
  const db = getDb();

  const congressDeadlines = db
    .prepare(
      `SELECT id, nome, prazo_submissao FROM congresses WHERE prazo_submissao IS NOT NULL AND prazo_submissao != ''`
    )
    .all() as { id: number; nome: string; prazo_submissao: string }[];

  const congressEvents = db
    .prepare(
      `SELECT id, nome, data_inicio FROM congresses WHERE data_inicio IS NOT NULL AND data_inicio != ''`
    )
    .all() as { id: number; nome: string; data_inicio: string }[];

  const workDeadlines = db
    .prepare(
      `SELECT id, titulo, prazo_submissao FROM works
       WHERE prazo_submissao IS NOT NULL AND prazo_submissao != ''
       AND status NOT IN ('apresentado', 'publicado')`
    )
    .all() as { id: number; titulo: string; prazo_submissao: string }[];

  const items: CalendarItem[] = [
    ...congressDeadlines.map((c) => ({
      id: `cs-${c.id}`,
      tipo: "submissao_congresso" as const,
      titulo: `Submissão · ${c.nome}`,
      data: c.prazo_submissao,
      href: `/congressos/${c.id}`,
    })),
    ...congressEvents.map((c) => ({
      id: `ce-${c.id}`,
      tipo: "evento_congresso" as const,
      titulo: `Evento · ${c.nome}`,
      data: c.data_inicio,
      href: `/congressos/${c.id}`,
    })),
    ...workDeadlines.map((w) => ({
      id: `ws-${w.id}`,
      tipo: "submissao_trabalho" as const,
      titulo: `Prazo do trabalho · ${w.titulo}`,
      data: w.prazo_submissao,
      href: `/trabalhos/${w.id}`,
    })),
  ];

  return items
    .map((item) => ({ ...item, diasRestantes: daysUntil(item.data) }))
    .sort((a, b) => a.data.localeCompare(b.data));
}

export function getWorksStatusCounts(): Record<StatusTrabalho, number> {
  const db = getDb();
  const rows = db.prepare(`SELECT status, COUNT(*) as n FROM works GROUP BY status`).all() as {
    status: StatusTrabalho;
    n: number;
  }[];
  const base: Record<StatusTrabalho, number> = {
    escrevendo: 0,
    revisao: 0,
    submetido: 0,
    aprovado: 0,
    apresentado: 0,
    publicado: 0,
  };
  for (const r of rows) base[r.status] = r.n;
  return base;
}

export function getStalledWorks(daysThreshold = 20) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, titulo, status, updated_at FROM works
       WHERE status NOT IN ('apresentado', 'publicado')
       ORDER BY updated_at ASC`
    )
    .all() as { id: number; titulo: string; status: string; updated_at: string }[];

  return rows
    .map((w) => {
      const diff = Date.now() - new Date(w.updated_at.replace(" ", "T") + "Z").getTime();
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      return { ...w, dias };
    })
    .filter((w) => w.dias >= daysThreshold)
    .sort((a, b) => b.dias - a.dias);
}

export function getNewIdeasThisWeek() {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, titulo, eixo_tematico, created_at FROM ideas
       WHERE created_at >= datetime('now', '-7 days')
       ORDER BY created_at DESC`
    )
    .all() as { id: number; titulo: string; eixo_tematico: string | null; created_at: string }[];
}

export interface GenerationProduction {
  geracao: string;
  cor: string;
  total: number;
}

export function getProductionByGeneration(): GenerationProduction[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT m.geracao, m.cor,
        SUM(e.apresent_autor_local + e.apresent_coautor_local + e.apresent_autor_nacional +
            e.apresent_coautor_nacional + e.resumos_anais + e.capitulos_livro +
            e.artigos_revista + e.organizacao_eventos) as total
       FROM members m
       JOIN member_experience e ON e.member_id = m.id
       WHERE m.geracao IS NOT NULL
       GROUP BY m.geracao, m.cor
       ORDER BY m.geracao`
    )
    .all() as { geracao: string; cor: string; total: number | null }[];
  return rows.map((r) => ({ geracao: r.geracao, cor: r.cor, total: r.total ?? 0 }));
}

export function getCounts() {
  const db = getDb();
  const membros = (db.prepare(`SELECT COUNT(*) as n FROM members WHERE tipo='membro'`).get() as { n: number }).n;
  const congressos = (db.prepare(`SELECT COUNT(*) as n FROM congresses`).get() as { n: number }).n;
  const ideias = (db.prepare(`SELECT COUNT(*) as n FROM ideas`).get() as { n: number }).n;
  const trabalhos = (db.prepare(`SELECT COUNT(*) as n FROM works`).get() as { n: number }).n;
  return { membros, congressos, ideias, trabalhos };
}
