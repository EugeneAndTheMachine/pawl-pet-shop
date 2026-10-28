/** Full-page placeholder while the code of a page opened directly (e.g. a shared /checkout link) downloads */
export function AppLoading() {
  return (
    <div className="flex min-h-dvh flex-col" role="status" aria-label="Loading Pawl">
      <div className="h-16 bg-accent shadow-md" />
      <div className="grid flex-1 place-items-center">
        <span className="size-10 animate-spin rounded-full border-4 border-brand border-r-transparent" aria-hidden="true" />
      </div>
    </div>
  )
}
