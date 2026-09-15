"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PersonOption } from "@/lib/types";
import { GenerationDot } from "./GenerationBadge";

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function useFilteredPeople(people: PersonOption[], query: string, excludeIds: Set<number>) {
  return useMemo(() => {
    const q = normalize(query.trim());
    return people
      .filter((p) => !excludeIds.has(p.id))
      .filter((p) => (q ? normalize(p.nome).includes(q) : true))
      .slice(0, 40);
  }, [people, query, excludeIds]);
}

function OptionRow({ person }: { person: PersonOption }) {
  return (
    <span className="flex items-center gap-2">
      {person.cor ? <GenerationDot cor={person.cor} /> : <span className="text-xs">🎓</span>}
      <span>{person.nome}</span>
      {person.geracao && <span className="text-xs text-brand-ink/40">{person.geracao}</span>}
    </span>
  );
}

interface PersonSelectProps {
  name: string;
  people: PersonOption[];
  defaultValue?: number | null;
  placeholder?: string;
  required?: boolean;
  emptyLabel?: string;
}

/** Select único de pessoa, com busca — nunca aceita nome digitado livremente. */
export function PersonSelect({
  name,
  people,
  defaultValue = null,
  placeholder = "Buscar por nome...",
  required = false,
  emptyLabel = "Nenhuma pessoa selecionada",
}: PersonSelectProps) {
  const [selectedId, setSelectedId] = useState<number | null>(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = people.find((p) => p.id === selectedId) || null;
  const excludeIds = useMemo(() => new Set<number>(), []);
  const options = useFilteredPeople(people, query, excludeIds);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name={name} value={selectedId ?? ""} required={required} />
      {selected ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-ink/15 bg-white px-3 py-2 text-sm">
          <OptionRow person={selected} />
          <button
            type="button"
            className="text-xs font-semibold text-brand-ink/40 hover:text-brand-coral"
            onClick={() => {
              setSelectedId(null);
              setQuery("");
              setOpen(true);
            }}
          >
            trocar
          </button>
        </div>
      ) : (
        <input
          type="text"
          className="input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      )}
      {open && !selected && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-brand-ink/10 bg-white py-1 shadow-lg">
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-brand-ink/40">{emptyLabel}</p>
          )}
          {options.map((p) => (
            <button
              type="button"
              key={p.id}
              className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-brand-cream"
              onClick={() => {
                setSelectedId(p.id);
                setQuery("");
                setOpen(false);
              }}
            >
              <OptionRow person={p} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PersonMultiSelectProps {
  name: string;
  people: PersonOption[];
  defaultValues?: number[];
  placeholder?: string;
}

/** Multi-select de pessoas (chips), com busca — nunca aceita nome digitado livremente. */
export function PersonMultiSelect({
  name,
  people,
  defaultValues = [],
  placeholder = "Adicionar pessoa...",
}: PersonMultiSelectProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(defaultValues);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const excludeIds = useMemo(() => new Set(selectedIds), [selectedIds]);
  const options = useFilteredPeople(people, query, excludeIds);
  const selectedPeople = selectedIds
    .map((id) => people.find((p) => p.id === id))
    .filter((p): p is PersonOption => Boolean(p));

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-brand-ink/15 bg-white p-2">
        {selectedPeople.map((p) => (
          <span
            key={p.id}
            className="flex items-center gap-1.5 rounded-full bg-brand-cream px-2.5 py-1 text-xs font-medium"
          >
            <OptionRow person={p} />
            <button
              type="button"
              className="text-brand-ink/40 hover:text-brand-coral"
              onClick={() => setSelectedIds((ids) => ids.filter((i) => i !== p.id))}
              aria-label={`Remover ${p.nome}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="min-w-[10rem] flex-1 border-none px-1 py-1 text-sm outline-none"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-brand-ink/10 bg-white py-1 shadow-lg">
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-brand-ink/40">Nenhuma pessoa encontrada</p>
          )}
          {options.map((p) => (
            <button
              type="button"
              key={p.id}
              className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-brand-cream"
              onClick={() => {
                setSelectedIds((ids) => [...ids, p.id]);
                setQuery("");
              }}
            >
              <OptionRow person={p} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
