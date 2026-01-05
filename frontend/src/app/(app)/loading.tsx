export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse rounded-xl bg-white/10" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-96 animate-pulse rounded-2xl bg-white/10" />
      </div>
    </div>
  )
}
