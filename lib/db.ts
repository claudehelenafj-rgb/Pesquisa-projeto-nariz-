import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { MEMBROS } from "../data/membros";
import { ORIENTADORES } from "../data/orientadores";
import type { Role } from "./types";

const DB_DIR = path.join(process.cwd(), "db");
const DB_PATH = path.join(DB_DIR, "nariz.db");

declare global {
  // eslint-disable-next-line no-var
  var __narizDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seedIfEmpty(db);
  seedInitialAccounts(db);
  return db;
}

export function getDb(): Database.Database {
  if (!global.__narizDb) {
    global.__narizDb = createConnection();
  }
  return global.__narizDb;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'membro' CHECK (tipo IN ('membro','orientador')),
      geracao TEXT,
      cor TEXT,
      curso TEXT,
      semestre TEXT,
      status TEXT DEFAULT 'efetivo' CHECK (status IN ('efetivo','afetivo')),
      data_entrada TEXT,
      interesse_ic TEXT CHECK (interesse_ic IN ('sim','nao_prioridade','nao')),
      obs_disponibilidade TEXT,
      matricula TEXT,
      documento TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS member_interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      tema TEXT NOT NULL,
      UNIQUE(member_id, tema)
    );

    CREATE TABLE IF NOT EXISTS member_travel_cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      cidade TEXT NOT NULL,
      UNIQUE(member_id, cidade)
    );

    CREATE TABLE IF NOT EXISTS member_experience (
      member_id INTEGER PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
      apresent_autor_local INTEGER NOT NULL DEFAULT 0,
      apresent_coautor_local INTEGER NOT NULL DEFAULT 0,
      apresent_autor_nacional INTEGER NOT NULL DEFAULT 0,
      apresent_coautor_nacional INTEGER NOT NULL DEFAULT 0,
      resumos_anais INTEGER NOT NULL DEFAULT 0,
      capitulos_livro INTEGER NOT NULL DEFAULT 0,
      artigos_revista INTEGER NOT NULL DEFAULT 0,
      organizacao_eventos INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS member_congress_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      congress_id INTEGER REFERENCES congresses(id) ON DELETE SET NULL,
      nome_livre TEXT,
      tipo TEXT NOT NULL CHECK (tipo IN ('ja_foi','pretende_ir')),
      ano TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('membro','coordenadora','presidencia')),
      member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
      must_change_password INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS congresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      area TEXT,
      cidade TEXT,
      data_inicio TEXT,
      data_fim TEXT,
      prazo_submissao TEXT,
      link TEXT,
      valor_inscricao TEXT,
      status TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('planejado','confirmado','em_andamento','concluido')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS congress_responsibles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      congress_id INTEGER NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      UNIQUE(congress_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      proposta_por INTEGER REFERENCES members(id) ON DELETE SET NULL,
      eixo_tematico TEXT,
      orientador_sugerido INTEGER REFERENCES members(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'ideia' CHECK (status IN ('ideia','em_avaliacao','aprovada','descartada')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS idea_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      UNIQUE(idea_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS idea_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
      member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
      texto TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      tipo TEXT NOT NULL,
      destino_tipo TEXT NOT NULL CHECK (destino_tipo IN ('congresso','revista')),
      congress_id INTEGER REFERENCES congresses(id) ON DELETE SET NULL,
      revista_nome TEXT,
      autor_principal_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
      orientador_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
      prazo_submissao TEXT,
      status TEXT NOT NULL DEFAULT 'escrevendo',
      link TEXT,
      idea_id INTEGER REFERENCES ideas(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS work_coauthors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      UNIQUE(work_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS restricted_minutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      data_reuniao TEXT,
      conteudo TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS restricted_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      conteudo TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_members_tipo ON members(tipo);
    CREATE INDEX IF NOT EXISTS idx_works_status ON works(status);
    CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
  `);
}

function seedIfEmpty(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as n FROM members").get() as { n: number };
  if (count.n > 0) return;

  const insertMember = db.prepare(`
    INSERT INTO members (nome, tipo, geracao, cor, status)
    VALUES (@nome, @tipo, @geracao, @cor, @status)
  `);
  const insertExperience = db.prepare(`
    INSERT INTO member_experience (member_id) VALUES (?)
  `);

  const seedTx = db.transaction(() => {
    for (const m of MEMBROS as { nome: string; geracao: string; cor: string }[]) {
      const info = insertMember.run({
        nome: m.nome,
        tipo: "membro",
        geracao: m.geracao,
        cor: m.cor,
        status: "efetivo",
      });
      insertExperience.run(info.lastInsertRowid);
    }
    for (const nome of ORIENTADORES as string[]) {
      insertMember.run({
        nome,
        tipo: "orientador",
        geracao: null,
        cor: null,
        status: null,
      });
    }

    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, role, member_id, must_change_password)
      VALUES (?, ?, ?, NULL, 1)
    `);
    insertUser.run("coordenacao", bcrypt.hashSync("nariz2024", 10), "coordenadora");
    insertUser.run("presidencia", bcrypt.hashSync("nariz2024", 10), "presidencia");
  });

  seedTx();
}

interface InitialAccount {
  username: string;
  nome: string;
  geracao: string;
  role: Role;
  senhaProvisoria: string;
}

// Contas nominais iniciais, vinculadas a membros já existentes no roster.
// Idempotente: só insere quem ainda não tem login (por username). As senhas
// são provisórias — must_change_password=1 obriga a troca no primeiro acesso
// (reforçado em middleware.ts).
const INITIAL_ACCOUNTS: InitialAccount[] = [
  {
    username: "helena.xopivitos",
    nome: "Helena Aben-Athar Ponte",
    geracao: "Xopivitos",
    role: "coordenadora",
    senhaProvisoria: "TpKw4gKehP",
  },
  {
    username: "amanda.xeblekivis",
    nome: "Amanda de Alevir",
    geracao: "Xeblekivis",
    role: "presidencia",
    senhaProvisoria: "X4uQjYuGTk",
  },
  {
    username: "luana.xeblekivis",
    nome: "Luana Osterno Luna",
    geracao: "Xeblekivis",
    role: "presidencia",
    senhaProvisoria: "AEhPyr3thi",
  },
  {
    username: "livia.xermigulhas",
    nome: "Lívia",
    geracao: "Xermigulhas",
    role: "membro",
    senhaProvisoria: "UFdCrbf89g",
  },
  {
    username: "stela.xermigulhas",
    nome: "Stela",
    geracao: "Xermigulhas",
    role: "membro",
    senhaProvisoria: "dHjecnLbAU",
  },
  {
    username: "lena.xopivitos",
    nome: "Lena Rodrigues Picanço",
    geracao: "Xopivitos",
    role: "membro",
    senhaProvisoria: "XmGh3SP8FQ",
  },
  {
    username: "iasmin.xeblekivis",
    nome: "Iasmin Diniz Teixeira de Paula",
    geracao: "Xeblekivis",
    role: "membro",
    senhaProvisoria: "Lc6jXiHP3s",
  },
];

function seedInitialAccounts(db: Database.Database) {
  const findUser = db.prepare(`SELECT id FROM users WHERE username = ?`);
  const findMember = db.prepare(
    `SELECT id FROM members WHERE nome = ? AND geracao = ? AND tipo = 'membro'`
  );
  const insertUser = db.prepare(
    `INSERT INTO users (username, password_hash, role, member_id, must_change_password)
     VALUES (?, ?, ?, ?, 1)`
  );

  for (const acc of INITIAL_ACCOUNTS) {
    if (findUser.get(acc.username)) continue;

    const member = findMember.get(acc.nome, acc.geracao) as { id: number } | undefined;
    if (!member) {
      // eslint-disable-next-line no-console
      console.warn(
        `[projeto-nariz] seed: membro "${acc.nome}" (${acc.geracao}) não encontrado — login "${acc.username}" não foi criado.`
      );
      continue;
    }

    insertUser.run(acc.username, bcrypt.hashSync(acc.senhaProvisoria, 10), acc.role, member.id);
  }
}
