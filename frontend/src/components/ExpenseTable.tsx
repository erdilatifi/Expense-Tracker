"use client"

import * as React from "react"

import type { Expense } from "@/types/expense"
import { centsToMoney } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ExpenseTable(props: {
  rows: Expense[]
  onEdit: (row: Expense) => void
  onDelete: (row: Expense) => Promise<void>
}) {
  const [busyId, setBusyId] = React.useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pendingDelete, setPendingDelete] = React.useState<Expense | null>(null)

  function notePreview(note: string): string {
    const trimmed = note.trim()
    if (trimmed.length <= 7) return trimmed
    return `${trimmed.slice(0, 7)}...`
  }

  return (
    <TooltipProvider>
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10">
            <TableHead className="hidden text-muted-foreground md:table-cell">Date</TableHead>
            <TableHead className="text-muted-foreground">Category</TableHead>
            <TableHead className="hidden text-muted-foreground md:table-cell">Note</TableHead>
            <TableHead className="text-right text-muted-foreground">Amount</TableHead>
            <TableHead className="w-[96px] text-right text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.rows.length === 0 ? (
            <TableRow className="border-white/10">
              <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                No expenses for this month yet.
              </TableCell>
            </TableRow>
          ) : (
            props.rows.map((row) => (
              <TableRow key={row.id} className="border-white/10">
                <TableCell className="hidden font-medium md:table-cell">{row.expense_date}</TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: row.category_color }} />
                      <span className="truncate">{row.category_name}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground md:hidden">
                      <span className="tabular-nums">{row.expense_date}</span>
                      {row.note ? (
                        <>
                          <span className="mx-2 opacity-50">•</span>
                          {row.note.length > 15 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block max-w-[180px] truncate">{notePreview(row.note)}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[320px] rounded-2xl border-white/10 bg-background/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/75">
                                {row.note}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="inline-block max-w-[180px] truncate">{notePreview(row.note)}</span>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-[420px] text-muted-foreground md:table-cell">
                  {row.note ? (
                    row.note.length > 7 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block max-w-[420px] truncate">{notePreview(row.note)}</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[480px] rounded-2xl border-white/10 bg-background/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/75">
                          {row.note}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="block max-w-[420px] truncate">{notePreview(row.note)}</span>
                    )
                  ) : (
                    <span>—</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{centsToMoney(row.amount_cents)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      className="h-8 rounded-xl px-2 md:px-2"
                      onClick={() => props.onEdit(row)}
                      disabled={busyId === row.id}
                    >
                      <span className="hidden md:inline">Edit</span>
                      <Pencil className="h-4 w-4 md:hidden" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 rounded-xl px-2 text-destructive hover:text-destructive"
                      onClick={async () => {
                        setPendingDelete(row)
                        setConfirmOpen(true)
                      }}
                      disabled={busyId === row.id}
                    >
                      <span className="hidden md:inline">Delete</span>
                      <Trash2 className="h-4 w-4 md:hidden" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-3xl border-white/10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can’t be undone. The expense will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!pendingDelete) return
                try {
                  setBusyId(pendingDelete.id)
                  await props.onDelete(pendingDelete)
                } finally {
                  setBusyId(null)
                  setPendingDelete(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  )
}
