"use client";

import { useMemo, useState } from "react";

interface TagInputProps {
  name: string;
  defaultValues?: string[];
  suggestions?: string[];
  placeholder?: string;
}

/** Tags livres (tema de interesse, eixo temático, etc.) com sugestões, mas aceita qualquer texto. */
export function TagInput({
  name,
  defaultValues = [],
  suggestions = [],
  placeholder = "Digite e pressione Enter...",
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultValues);
  const [text, setText] = useState("");

  const remainingSuggestions = useMemo(
    () => suggestions.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())),
    [suggestions, tags]
  );

  function addTag(raw: string) {
    const value = raw.trim();
    if (!value) return;
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setText("");
      return;
    }
    setTags((prev) => [...prev, value]);
    setText("");
  }

  return (
    <div>
      {tags.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-brand-ink/15 bg-white p-2">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
            <button
              type="button"
              className="ml-1.5 text-brand-teal/60 hover:text-brand-coral"
              onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
              aria-label={`Remover ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="min-w-[10rem] flex-1 border-none px-1 py-1 text-sm outline-none"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(text);
            } else if (e.key === "Backspace" && !text && tags.length > 0) {
              setTags((prev) => prev.slice(0, -1));
            }
          }}
        />
      </div>
      {remainingSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border border-brand-ink/10 px-2.5 py-1 text-xs text-brand-ink/50 hover:border-brand-teal hover:text-brand-teal"
              onClick={() => addTag(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
