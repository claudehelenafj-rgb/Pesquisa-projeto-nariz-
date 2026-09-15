# Projeto Nariz — Sistema interno de organização de pesquisa

Sistema interno (não indexável, com login) para o grupo de extensão e pesquisa em
Humanização e Palhaçoterapia (Unifor). Centraliza a gestão da produção científica do
grupo: interesses de pesquisa, congressos, banco de ideias, trabalhos em andamento e
prazos.

## Stack

- **Next.js 14** (App Router, Server Actions, Server Components)
- **SQLite** local via `better-sqlite3` (sem serviço externo)
- **Tailwind CSS** para estilo
- **iron-session** (cookie assinado) + **bcryptjs** para autenticação
- Sem dependências de UI externas — os selects com busca, tags e kanban são componentes
  próprios em `components/`

> Nota sobre a versão do Next.js: o `npm audit` acusa CVEs abertos na linha do Next 14
> (a maioria só corrigida no Next 15+). Como este é um sistema interno, atrás de login,
> sem indexação e sem exposição pública ampla, optei por manter o Next 14 (build mais
> previsível para um projeto deste tamanho) na versão de patch mais recente (14.2.35).
> Se o projeto crescer ou passar a ser exposto publicamente, vale planejar a migração
> para o Next 15/16.

## Como rodar

```bash
npm install
cp .env.example .env.local   # defina SESSION_SECRET (ver instruções no arquivo)
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). No primeiro acesso, o banco SQLite
é criado automaticamente em `db/nariz.db` e populado com os membros e orientadores
pré-cadastrados (`data/membros.js` e `data/orientadores.js`).

Para recriar o banco do zero a qualquer momento:

```bash
npm run seed -- --reset
```

### Usuários iniciais

| Usuário | Senha | Nível |
|---|---|---|
| `coordenacao` | `nariz2024` | Coordenadora |
| `presidencia` | `nariz2024` | Presidência |

Essas contas não estão vinculadas a uma pessoa específica do roster. Após o primeiro
login, troque a senha (ícone ⚙️ no menu) e use **Área Restrita → Gestão de usuários**
para criar logins reais vinculados aos membros do grupo e definir o nível de acesso de
cada um.

## Estrutura

```
data/membros.js         # roster de membros por geração (editável) — fonte da verdade
data/orientadores.js    # lista de orientadores (editável)
data/geracoes.js        # rotação de cores azul → vermelho → verde → amarelo
lib/db.ts               # conexão SQLite + schema + seed automático
lib/auth.ts              # sessão, getCurrentUser/requireUser/requireRole (bloqueio no servidor)
middleware.ts            # camada extra de bloqueio (sessão + /restrita) antes de chegar à rota
app/(app)/               # todas as páginas autenticadas (layout com menu)
app/(app)/restrita/      # área restrita a coordenadora/presidência
app/api/export/          # exportação CSV
```

### Adicionando uma nova geração de membros

Edite `data/membros.js` e adicione um novo objeto ao array `GERACOES_BASE` (nome +
lista de nomes). A cor é aplicada automaticamente pela rotação azul → vermelho → verde
→ amarelo (`data/geracoes.js`), seguindo a ordem das gerações já existentes. Depois
rode `npm run seed` (só insere o que ainda não existe) ou `npm run seed -- --reset`
para recomeçar do zero.

### Controle de acesso

Três níveis — Membro, Coordenadora, Presidência — definidos em `lib/types.ts`. Rotas
restritas (`/restrita/**`) são bloqueadas em duas camadas:

1. `middleware.ts`: decodifica o cookie de sessão (sem tocar no banco) e redireciona
   antes mesmo de a rota renderizar.
2. `requireRestricted()` (`lib/auth.ts`), chamado no topo de cada página/Server Action
   da área restrita: é a verificação autoritativa, no servidor.

Um usuário sem permissão que tentar acessar a URL diretamente é redirecionado para
`/acesso-negado`.

### Por que "select com busca" em todo campo de pessoa

Os componentes `PersonSelect` / `PersonMultiSelect` (`components/PersonSelect.tsx`)
garantem que nomes de membros/orientadores são sempre escolhidos de uma lista — nunca
digitados livremente — evitando duplicidade e erro de digitação nos vínculos
(responsáveis de congresso, autor/coautores/orientador de trabalho, participantes de
ideia etc.).

## Funcionalidades

- **Autenticação e perfis**: login com senha (hash bcrypt), três níveis de acesso.
- **Perfil de membro**: dados gerais, temas de interesse, interesse em IC, experiência
  científica (contadores), disponibilidade de viagem, histórico de congressos.
- **Congressos**: cadastro completo, responsáveis múltiplos, filtros, e **sugestão
  automática** de membros compatíveis (tema de interesse, cidade acessível, priorizando
  quem produziu menos até agora).
- **Banco de Ideias**: quadro kanban (Ideia → Em avaliação → Aprovada → Descartada),
  "quero participar", comentários, conversão em Trabalho com um clique.
- **Trabalhos em andamento**: tipo, destino (congresso ou revista, com prazo herdado do
  congresso), autor/coautores/orientador, pipeline de status.
- **Calendário e alertas**: linha do tempo de prazos com destaque para até 7 e 30 dias;
  dashboard com trabalhos parados há mais de 20 dias.
- **Dashboard**: próximos prazos, trabalhos por status, ideias novas da semana,
  produção por geração (gráfico com as cores de cada geração).
- **Área Restrita** (coordenadora/presidência): atas de reunião, notas confidenciais,
  dados cadastrais sensíveis (matrícula/documento — nunca exibidos fora daqui),
  relatório de produção (quem nunca produziu, quem está sobrecarregado), gestão de
  usuários.
- **Busca global** (`/busca`) por membro, congresso, tema/eixo temático e trabalho.
- **Exportação CSV** em Membros, Congressos, Ideias e Trabalhos.
- Não indexável: `robots.txt` bloqueia tudo e cada página envia `noindex, nofollow`.

## Scripts

```bash
npm run dev     # ambiente de desenvolvimento
npm run build   # build de produção
npm run start   # servir o build de produção
npm run lint    # eslint
npm run seed    # garante que o banco existe e está semeado (usa --reset para recomeçar)
```
