import { Badge } from "@/components/ui/badge"

export default function ApiLayerPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Architecture</Badge>
        <h1 className="text-4xl font-bold tracking-tight">API Layer</h1>
        <p className="text-xl text-muted-foreground">
          REST API documentation and endpoints overview.
        </p>
      </div>

      {/* Base URL */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Base URL</h2>
        <div className="p-4 rounded-lg bg-muted font-mono text-sm">
          <p>Development: http://localhost:8000/api/v1</p>
          <p>Production: https://your-domain.com/api/v1</p>
        </div>
      </section>

      {/* Authentication */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Authentication</h2>
        <p className="text-muted-foreground">
          All endpoints (except /health) require authentication via Supabase JWT token.
        </p>
        <div className="p-4 rounded-lg bg-muted font-mono text-sm">
          <pre className="overflow-x-auto">{`Authorization: Bearer <JWT_TOKEN>`}</pre>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Rate Limiting</h2>
        <div className="p-4 rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Endpoint Type</th>
                <th className="text-left py-2">Limit</th>
                <th className="text-left py-2">Window</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Global</td>
                <td className="py-2">100 requests</td>
                <td className="py-2">per minute per IP</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Chat Messages</td>
                <td className="py-2">20 requests</td>
                <td className="py-2">per minute per IP</td>
              </tr>
              <tr>
                <td className="py-2">Document Uploads</td>
                <td className="py-2">10 requests</td>
                <td className="py-2">per hour per IP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Main Endpoints */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Main Endpoints</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Health Checks</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>GET /health - Full system health</li>
              <li>GET /health/liveness - Liveness probe</li>
              <li>GET /health/readiness - Readiness probe</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Notebooks</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>GET /notebooks - List user's notebooks</li>
              <li>POST /notebooks - Create notebook</li>
              <li>GET /notebooks/[id] - Get notebook</li>
              <li>PATCH /notebooks/[id] - Update notebook</li>
              <li>DELETE /notebooks/[id] - Delete notebook</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Documents</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>POST /documents/upload - Upload document</li>
              <li>GET /notebooks/[id]/documents - List documents</li>
              <li>GET /documents/[id] - Get document</li>
              <li>DELETE /documents/[id] - Delete document</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Chat</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>GET /chat/[notebook_id]/history - Get chat history</li>
              <li>POST /chat/[notebook_id]/message - Send message</li>
              <li>GET /chat/[notebook_id]/suggestions - Get suggestions</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Content Generation</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>GET /generation/[notebook_id]/content - List generated content</li>
              <li>POST /generation/[notebook_id]/podcast - Generate podcast</li>
              <li>POST /generation/[notebook_id]/quiz - Generate quiz</li>
              <li>POST /generation/[notebook_id]/flashcards - Generate flashcards</li>
              <li>POST /generation/[notebook_id]/mindmap - Generate mind map</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="flex gap-4 pt-4">
        <a href="/docs/frontend-architecture" className="text-primary hover:underline">
          Next: Frontend Architecture →
        </a>
      </div>
    </div>
  )
}
