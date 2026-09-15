import fs from "fs";
import path from "path";

async function main() {
  const reset = process.argv.includes("--reset");
  const dbPath = path.join(process.cwd(), "db", "nariz.db");

  if (reset) {
    for (const suffix of ["", "-journal", "-wal", "-shm"]) {
      const file = dbPath + suffix;
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
    console.log("Banco removido, recriando...");
  }

  const { getDb } = await import("../lib/db");
  const db = getDb();
  const membros = db
    .prepare("SELECT COUNT(*) as n FROM members WHERE tipo = 'membro'")
    .get() as { n: number };
  const orientadores = db
    .prepare("SELECT COUNT(*) as n FROM members WHERE tipo = 'orientador'")
    .get() as { n: number };

  console.log(`Banco pronto em ${dbPath}`);
  console.log(`Membros: ${membros.n} | Orientadores: ${orientadores.n}`);
  console.log("Usuários iniciais: coordenacao / presidencia (senha: nariz2024)");
}

main();
