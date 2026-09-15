import { getDb } from "@/lib/db";
import { productionScore } from "./people";
import type { MemberExperience, PersonOption } from "@/lib/types";

export interface MemberSuggestion {
  person: PersonOption;
  motivos: string[];
  producao: number;
}

/**
 * Sugestão automática (não vinculante) de membros compatíveis com um congresso:
 * tema de interesse compatível, cidade acessível, e destaque para quem produziu
 * pouco até agora — para ajudar a distribuir oportunidades.
 */
export function getSuggestedMembers(congress: {
  area: string | null;
  cidade: string | null;
}): MemberSuggestion[] {
  const db = getDb();
  const members = db
    .prepare(`SELECT id, nome, tipo, geracao, cor FROM members WHERE tipo = 'membro'`)
    .all() as PersonOption[];

  const experiences = db.prepare(`SELECT * FROM member_experience`).all() as MemberExperience[];
  const expByMember = new Map(experiences.map((e) => [e.member_id, e]));

  const interestRows = db.prepare(`SELECT member_id, tema FROM member_interests`).all() as {
    member_id: number;
    tema: string;
  }[];
  const interestsByMember = new Map<number, string[]>();
  for (const row of interestRows) {
    const list = interestsByMember.get(row.member_id) || [];
    list.push(row.tema);
    interestsByMember.set(row.member_id, list);
  }

  const cityRows = db.prepare(`SELECT member_id, cidade FROM member_travel_cities`).all() as {
    member_id: number;
    cidade: string;
  }[];
  const citiesByMember = new Map<number, string[]>();
  for (const row of cityRows) {
    const list = citiesByMember.get(row.member_id) || [];
    list.push(row.cidade);
    citiesByMember.set(row.member_id, list);
  }

  const results: MemberSuggestion[] = [];
  for (const person of members) {
    const motivos: string[] = [];
    const interesses = interestsByMember.get(person.id) || [];
    const cidades = citiesByMember.get(person.id) || [];

    if (congress.area && interesses.some((t) => t.toLowerCase() === congress.area!.toLowerCase())) {
      motivos.push(`tema "${congress.area}" entre os interesses`);
    }
    if (congress.cidade && cidades.some((c) => c.toLowerCase() === congress.cidade!.toLowerCase())) {
      motivos.push(`${congress.cidade} é uma cidade acessível`);
    }

    if (motivos.length === 0) continue;

    const producao = productionScore(expByMember.get(person.id));
    results.push({ person, motivos, producao });
  }

  results.sort((a, b) => a.producao - b.producao);

  const lowProduction = results.length > 0 ? results[0].producao : 0;
  for (const r of results) {
    if (r.producao <= lowProduction + 1) {
      r.motivos.push("pouca produção até agora — boa oportunidade para distribuir");
    }
  }

  return results.slice(0, 10);
}
