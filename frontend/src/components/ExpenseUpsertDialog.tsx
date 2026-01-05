"use client"

import * as React from "react"

import type { Category, Expense } from "@/types/expense"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FormValue = {
  amount: number
  category_id: number
  date: string
  note?: string | null
}

export function ExpenseUpsertDialog(props: {
  open: boolean
  onOpenChange: (v: boolean) => void
  categories: Category[]
  initial: Expense | null
  defaultDate: string
  onSubmit: (v: FormValue) => Promise<void>
}) {
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [amount, setAmount] = React.useState<string>("")
  const [categoryId, setCategoryId] = React.useState<string>("")
  const [date, setDate] = React.useState<string>(props.defaultDate)
  const [note, setNote] = React.useState<string>("")

  React.useEffect(() => {
    setError(null)

    if (props.initial) {
      setAmount(String(props.initial.amount_cents / 100))
      setCategoryId(String(props.initial.category_id))
      setDate(props.initial.expense_date)
      setNote(props.initial.note ?? "")
      return
    }

    setAmount("")
    setCategoryId(props.categories[0] ? String(props.categories[0].id) : "")
    setDate(props.defaultDate)
    setNote("")
  }, [props.open, props.initial, props.categories, props.defaultDate])

  async function submit() {
    setError(null)

    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Enter a valid amount")
      return
    }

    if (!categoryId) {
      setError("Select a category")
      return
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Enter a valid date")
      return
    }

    try {
      setSaving(true)
      await props.onSubmit({
        amount: amt,
        category_id: Number(categoryId),
        date,
        note: note.trim() ? note.trim() : null,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="rounded-3xl border-white/10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <DialogHeader>
          <DialogTitle>{props.initial ? "Edit expense" : "Add expense"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">Amount</div>
            <Input
              className="rounded-2xl"
              inputMode="decimal"
              placeholder="e.g. 18.50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">Category</div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {props.categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">Date</div>
            <Input className="rounded-2xl" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">Note (optional)</div>
            <Input className="rounded-2xl" placeholder="Coffee with Sam" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error ? <div className="text-sm text-destructive">{error}</div> : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" className="rounded-2xl" onClick={() => props.onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button className="rounded-2xl" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
