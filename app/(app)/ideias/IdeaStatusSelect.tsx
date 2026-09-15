"use client";

import { useRef } from "react";
import { setIdeaStatusAction } from "./actions";
import { STATUS_IDEIA } from "@/lib/types";
import type { StatusIdeia } from "@/lib/types";

export function IdeaStatusSelect({ ideaId, status }: { ideaId: number; status: StatusIdeia }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={setIdeaStatusAction} ref={formRef}>
      <input type="hidden" name="id" value={ideaId} />
      <select
        name="status"
        defaultValue={status}
        className="input py-1 text-xs"
        onChange={() => formRef.current?.requestSubmit()}
      >
        {STATUS_IDEIA.map((s) => (
          <option key={s.value} value={s.value}>
            mover para: {s.label}
          </option>
        ))}
      </select>
    </form>
  );
}
