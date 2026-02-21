import { Badge } from "@/components/ui/badge"
import { Code, Server, Cloud, Database, Globe } from "lucide-react"

export default function DeploymentPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Production</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Deployment Guide</h1>
        <p className="text-xl text-muted-foreground">
          Complete guide to deploying NotebookLLM to production using Vercel and various backend platforms.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Deployment Options</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Vercel (Recommended)</h3>
            <p className="text-sm text-muted-foreground">
              Best for Next.js frontend with zero-config deployments and automatic SSL.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Railway</h3>
            <p className="text-sm text-muted-foreground">
              Great for full-stack deployment with PostgreSQL and Redis support.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Coolify</h3>
            <p className="text-sm text-muted-foreground">
              Self-hosted option for full control over your infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Prerequisites</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Required Accounts</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Supabase (database & auth)</li>
              <li>Qdrant Cloud (vector database)</li>
              <li>Google AI Studio (Gemini API)</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Required Tools</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Git</li>
              <li>Node.js 18+</li>
              <li>pnpm (recommended)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Frontend Deployment */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Frontend Deployment (Vercel)
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Step 1: Connect Repository</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Go to <a href="https://vercel.com" className="text-primary hover:underline">vercel.com</a> and sign up</li>
            <li>Click "Add New..." → "Project"</li>
            <li>Import your GitHub repository</li>
            <li>Select the <code>frontend</code> directory as root</li>
          </ol>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Step 2: Configure Environment Variables</h3>
          <p className="text-sm text-muted-foreground">
            Add these environment variables in the Vercel dashboard:
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Features
NEXT_PUBLIC_GOOGLE_DRIVE_ENABLED=false
NEXT_PUBLIC_NOTE_TAKING_ENABLED=true
NEXT_PUBLIC_ASK_ENABLED=true
NEXT_PUBLIC_STUDIO_ENABLED=true

# App
NEXT_PUBLIC_APP_NAME=NotebookLLM
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_LOGIN_PAGE=false`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Step 3: Deploy</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Click "Deploy" in Vercel dashboard</li>
            <li>Wait for build to complete</li>
            <li>Your app will be available at <code>https://your-app.vercel.app</code></li>
          </ol>
        </div>
      </section>

      {/* Backend Deployment */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Server className="w-6 h-6" />
          Backend Deployment
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Railway Deployment (Recommended)</h3>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Step 1: Create Railway Project</h4>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Go to <a href="https://railway.app" className="text-primary hover:underline">railway.app</a> and sign up</li>
              <li>Click "New Project" → "Deploy from GitHub repo"</li>
              <li>Select your repository</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Step 2: Configure Environment Variables</h4>
            <div className="p-4 rounded-lg bg-muted font-mono text-sm">
              <pre className="overflow-x-auto">{`# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Vector Database
QDRANT_HOST=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-key

# LLM Providers
GEMINI_API_KEY=your-gemini-key
COHERE_API_KEY=your-cohere-key

# Google OAuth (for Google Drive)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Security
ENVIRONMENT=production
CORS_ORIGINS=https://your-app.vercel.app

# SMTP (for emails)
SMTP_FROM_EMAIL=noreply@yourdomain.com`}</pre>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Step 3: Deploy</h4>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Click "Deploy" in Railway dashboard</li>
              <li>Wait for build and startup to complete</li>
              <li>Note your Railway app URL (e.g., <code>https://your-app.up.railway.app</code>)</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Docker Deployment */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Cloud className="w-6 h-6" />
          Docker Deployment
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Build Image</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`# Build the backend image
cd backend
docker build -t notebookllm-backend .`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Run Container</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`docker run -d \\
  --name notebookllm-backend \\
  -p 8000:8000 \\
  --env-file .env.production \\
  notebookllm-backend`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Docker Compose</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped`}</pre>
          </div>
        </div>
      </section>

      {/* Database Setup */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Database className="w-6 h-6" />
          Database Setup
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Supabase Setup</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Create project at <a href="https://supabase.com" className="text-primary hover:underline">supabase.com</a></li>
            <li>Go to <strong>SQL Editor</strong> and run the migration files in <code>backend/migrations/versions/</code></li>
            <li>Go to <strong>Settings</strong> → <strong>API</strong> to get your URL and keys</li>
            <li>Configure authentication providers if needed</li>
          </ol>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Qdrant Setup</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Create cluster at <a href="https://cloud.qdrant.io" className="text-primary hover:underline">cloud.qdrant.io</a></li>
            <li>Note your cluster URL and API key</li>
            <li>Create a collection named <code>notebookllm</code> with:
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Vector size: 768</li>
                <li>Distance metric: Cosine</li>
              </ul>
            </li>
          </ol>
        </div>
      </section>

      {/* Health Checks */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Health Checks</h2>
        <p className="text-muted-foreground">
          Verify your deployment is working correctly:
        </p>
        <div className="p-4 rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Endpoint</th>
                <th className="text-left py-2">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4"><code>/api/v1/health</code></td>
                <td className="py-2">Full system health check</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code>/api/v1/health/liveness</code></td>
                <td className="py-2">Liveness probe</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code>/api/v1/health/readiness</code></td>
                <td className="py-2">Readiness probe</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 rounded-lg bg-muted font-mono text-sm">
          <pre className="overflow-x-auto">{`# Test health endpoint
curl https://your-backend.railway.app/api/v1/health`}</pre>
        </div>
      </section>

      {/* Environment-Specific Config */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          Environment-Specific Configuration
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Production Checklist</h3>
          <div className="p-4 rounded-lg border">
            <ul className="list-disc list-inside space-y-2">
              <li>Set <code>ENVIRONMENT=production</code></li>
              <li>Set <code>DEBUG=false</code></li>
              <li>Configure <code>CORS_ORIGINS</code> to your frontend domain</li>
              <li>Enable <code>ENABLE_RATE_LIMITING=true</code></li>
              <li>Configure SMTP for transactional emails</li>
              <li>Set up custom domain (optional)</li>
              <li>Enable SSL/HTTPS</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Monitoring */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Monitoring & Observability</h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Langfuse (LLM Observability)</h3>
          <p className="text-sm text-muted-foreground">
            Configure Langfuse to monitor LLM calls and RAG performance:
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`# Environment variables
LANGFUSE_PUBLIC_KEY=pk-xxx
LANGFUSE_SECRET_KEY=sk-xxx
LANGFUSE_HOST=https://cloud.langfuse.com
LANGFUSE_ENABLED=true`}</pre>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Troubleshooting</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">CORS Errors</h3>
            <p className="text-sm text-muted-foreground">
              Ensure <code>CORS_ORIGINS</code> in backend includes your Vercel frontend URL.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">401 Unauthorized</h3>
            <p className="text-sm text-muted-foreground">
              Check that <code>SUPABASE_JWT_SECRET</code> matches your Supabase project settings.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Qdrant Connection Failed</h3>
            <p className="text-sm text-muted-foreground">
              Verify <code>QDRANT_HOST</code> and <code>QDRANT_API_KEY</code> are correct.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Rate Limiting Issues</h3>
            <p className="text-sm text-muted-foreground">
              Check API key limits for Gemini/Cohere. Consider upgrading your plan for higher limits.
            </p>
          </div>
        </div>
      </section>

      {/* Related */}
      <div className="flex gap-4 pt-4">
        <a href="/docs/architecture" className="text-primary hover:underline">
          ← System Architecture
        </a>
      </div>
    </div>
  )
}
