export type Category = {
  id: number
  name: string
  color: string
  icon: string
}

export type Expense = {
  id: number
  amount_cents: number
  expense_date: string // YYYY-MM-DD
  note: string | null
  category_id: number
  category_name: string
  category_color: string
  category_icon: string
}

export type DashboardTotals = {
  this_month_cents: number
  last_month_cents: number
  delta_cents: number
  delta_pct: number | null
}

export type DashboardByCategory = {
  id: number
  name: string
  color: string
  icon: string
  total_cents: number
}

export type DashboardOverTime = {
  day: string // YYYY-MM-DD
  total_cents: number
}

export type DashboardResponse = {
  month: string
  prev_month: string
  totals: DashboardTotals
  by_category: DashboardByCategory[]
  over_time: DashboardOverTime[]
}
