import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function QuickStartPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Getting Started</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Quick Start Guide</h1>
        <p className="text-xl text-muted-foreground">
          Get up and running with NotebookLLM in just a few minutes.
        </p>
      </div>

      {/* Prerequisites */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Prerequisites</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Required Software</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Node.js 18+ and pnpm</li>
              <li>Python 3.12+</li>
              <li>Docker (for local services)</li>
              <li>Git</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Required Accounts</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Supabase (database & auth)</li>
              <li>Qdrant Cloud (vector database)</li>
              <li>Google AI Studio (Gemini API)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Step 1 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Step 1: Clone the Repository</h2>
        <div className="p-4 rounded-lg bg-muted font-mono text-sm">
          <pre className="overflow-x-auto">{`git clone https://github.com/your-repo/notebookllm.git
cd notebookllm`}</pre>
        </div>
      </section>

      {/* Step 2 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Step 2: Set Up Backend</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Navigate to the backend directory and install dependencies:
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt`}</pre>
          </div>
          <p className="text-muted-foreground">
            Copy the environment file and configure your variables:
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`cp .env.example .env
# Edit .env with your API keys`}</pre>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Step 3: Start Services</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Start the required services using Docker:
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`# Start Qdrant (vector database)
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant

# Start PostgreSQL (if not using Supabase)
docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres`}</pre>
          </div>
        </div>
      </section>

      {/* Step 4 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Step 4: Run the Backend</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Initialize the database and start the backend server:
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`# Apply database migrations
alembic upgrade head

# Start the development server
uvicorn src.app:app --reload`}</pre>
          </div>
          <p className="text-muted-foreground">
            The backend will be available at{' '}
            <code className="px-1 py-0.5 rounded bg-muted">http://localhost:8000</code>
          </p>
        </div>
      </section>

      {/* Step 5 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Step 5: Run the Frontend</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            In a new terminal, set up and run the frontend:
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`cd frontend
pnpm install
cp .env.example .env
# Edit .env with your configuration
pnpm dev`}</pre>
          </div>
          <p className="text-muted-foreground">
            The frontend will be available at{' '}
            <code className="px-1 py-0.5 rounded bg-muted">http://localhost:3000</code>
          </p>
        </div>
      </section>

      {/* Next Steps */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Next Steps</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/docs/architecture" className="p-4 rounded-lg border hover:bg-accent transition-colors">
            <h3 className="font-semibold">Learn Architecture</h3>
            <p className="text-sm text-muted-foreground">Understand how the system works</p>
          </Link>
          <Link href="/docs/configuration" className="p-4 rounded-lg border hover:bg-accent transition-colors">
            <h3 className="font-semibold">Configure</h3>
            <p className="text-sm text-muted-foreground">Set up environment variables</p>
          </Link>
          <Link href="/docs/deployment" className="p-4 rounded-lg border hover:bg-accent transition-colors">
            <h3 className="font-semibold">Deploy</h3>
            <p className="text-sm text-muted-foreground">Deploy to production</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
