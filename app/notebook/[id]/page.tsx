import { Suspense } from "react"
import { NotebookPageContent } from "./notebook-content"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

// Loader component for Suspense fallback
function NotebookLoader() {
  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 text-muted-foreground">Loading notebook...</p>
    </div>
  )
}

export default async function NotebookPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <Suspense fallback={<NotebookLoader />}>
      <NotebookPageContent notebookId={id} />
    </Suspense>
  )
}
