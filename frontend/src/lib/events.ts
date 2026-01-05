export const EXPENSES_CHANGED_EVENT = "expenses:changed"

export function emitExpensesChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(EXPENSES_CHANGED_EVENT))
}

export function onExpensesChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  const listener = () => handler()
  window.addEventListener(EXPENSES_CHANGED_EVENT, listener)
  return () => window.removeEventListener(EXPENSES_CHANGED_EVENT, listener)
}
