import Link from "next/link";
import { logoutAction } from "@/lib/auth-actions";
import { canAccessRestricted } from "@/lib/auth";
import type { CurrentUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/congressos", label: "Congressos" },
  { href: "/ideias", label: "Ideias" },
  { href: "/trabalhos", label: "Trabalhos" },
  { href: "/membros", label: "Membros" },
  { href: "/calendario", label: "Calendário" },
];

export function NavBar({ user }: { user: CurrentUser }) {
  const links = canAccessRestricted(user.role)
    ? [...NAV_LINKS, { href: "/restrita", label: "Área Restrita" }]
    : NAV_LINKS;

  return (
    <header className="sticky top-0 z-30 border-b border-brand-ink/10 bg-brand-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-coral text-base">
            🔴
          </span>
          <span className="hidden sm:inline">Projeto Nariz</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="btn-ghost">
              {link.label}
            </Link>
          ))}
        </nav>

        <form action="/busca" className="hidden md:block">
          <input
            type="search"
            name="q"
            placeholder="Buscar membro, congresso, tema..."
            className="input w-56"
          />
        </form>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="text-right text-xs leading-tight">
            <div className="font-semibold text-brand-ink">{user.nome || user.username}</div>
            <div className="text-brand-ink/50">{ROLE_LABEL[user.role]}</div>
          </div>
          <Link href="/conta/senha" className="btn-ghost" title="Trocar senha">
            ⚙️
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn-secondary">
              Sair
            </button>
          </form>
        </div>

        <details className="relative lg:hidden">
          <summary className="btn-secondary cursor-pointer list-none">☰ Menu</summary>
          <div className="absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-brand-ink/10 bg-white p-3 shadow-lg">
            <form action="/busca" className="mb-3">
              <input type="search" name="q" placeholder="Buscar..." className="input" />
            </form>
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-cream"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/conta/senha"
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-cream"
              >
                Trocar senha
              </Link>
            </nav>
            <div className="mt-3 border-t border-brand-ink/10 pt-3">
              <div className="mb-2 text-xs">
                <div className="font-semibold">{user.nome || user.username}</div>
                <div className="text-brand-ink/50">{ROLE_LABEL[user.role]}</div>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="btn-secondary w-full">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
