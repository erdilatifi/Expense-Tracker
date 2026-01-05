import type { Category, DashboardResponse, Expense } from "@/types/expense"

type ApiOk<T> = { ok: true; data: T }
type ApiErr = { ok: false; error: string }
export type ApiResponse<T> = ApiOk<T> | ApiErr

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.ok) {
    const msg = "ok" in json && json.ok ? "Request failed" : json.error
    throw new Error(msg)
  }
  return json.data
}

export const api = {
  categories: {
    list: () => request<Category[]>("/categories.php"),
  },
  expenses: {
    list: (params?: { month?: string; limit?: number }) => {
      const sp = new URLSearchParams()
      if (params?.month) sp.set("month", params.month)
      if (params?.limit) sp.set("limit", String(params.limit))
      const qs = sp.toString() ? `?${sp.toString()}` : ""
      return request<Expense[]>(`/expenses.php${qs}`)
    },
    create: (body: { amount: number; category_id: number; date: string; note?: string | null }) =>
      request<{ id: number }>("/expenses.php", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: number, body: { amount: number; category_id: number; date: string; note?: string | null }) =>
      request<void>(`/expenses.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    remove: (id: number) =>
      request<void>(`/expenses.php?id=${id}`, {
        method: "DELETE",
      }),
  },
  dashboard: {
    get: (month: string) => request<DashboardResponse>(`/dashboard.php?month=${encodeURIComponent(month)}`),
  },
}

export function centsToMoney(cents: number): string {
  const v = cents / 100
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" })
}

export function monthNow(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
