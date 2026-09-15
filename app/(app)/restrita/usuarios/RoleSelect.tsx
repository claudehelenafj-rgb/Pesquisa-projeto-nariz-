"use client";

import { useRef } from "react";
import { updateUserRoleAction } from "../actions";
import { ROLE_LABEL, type Role } from "@/lib/types";

export function RoleSelect({ userId, role }: { userId: number; role: Role }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form action={updateUserRoleAction} ref={formRef}>
      <input type="hidden" name="id" value={userId} />
      <select
        name="role"
        defaultValue={role}
        className="input py-1 text-xs"
        onChange={() => formRef.current?.requestSubmit()}
      >
        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>
    </form>
  );
}
