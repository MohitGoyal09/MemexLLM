import { Badge } from "@/components/ui/badge"
import { Code, Database, Brain, Cloud, Lock } from "lucide-react"

export default function ConfigurationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Setup</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Configuration</h1>
        <p className="text-xl text-muted-foreground">
          Complete guide to environment variables and configuration settings for the NotebookLLM frontend.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">
          The frontend uses environment variables to configure API endpoints, authentication providers,
          and feature flags. Create a <code>.env.local</code> file in the frontend directory.
        </p>
      </section>

      {/* Required Variables */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Lock className="w-6 h-6" />
          Required Variables
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Supabase</h3>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Variable</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_SUPABASE_URL</code></td>
                  <td className="py-2">Your Supabase project URL (e.g., https://xxx.supabase.co)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></td>
                  <td className="py-2">Supabase anon key (public, safe to expose)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">API Backend</h3>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Variable</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_API_URL</code></td>
                  <td className="py-2">Backend API URL (default: http://localhost:8000)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Optional Variables */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Cloud className="w-6 h-6" />
          Optional Variables
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Authentication</h3>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Variable</th>
                  <th className="text-left py-2 pr-4">Default</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_LOGIN_PAGE</code></td>
                  <td className="py-2 pr-4">false</td>
                  <td className="py-2">Show login page before app</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_ALLOW_SIGNUP</code></td>
                  <td className="py-2 pr-4">true</td>
                  <td className="py-2">Allow new user registration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Features</h3>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Variable</th>
                  <th className="text-left py-2 pr-4">Default</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_GOOGLE_DRIVE_ENABLED</code></td>
                  <td className="py-2 pr-4">false</td>
                  <td className="py-2">Enable Google Drive integration</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_NOTE_TAKING_ENABLED</code></td>
                  <td className="py-2 pr-4">true</td>
                  <td className="py-2">Enable note-taking feature</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_ASK_ENABLED</code></td>
                  <td className="py-2 pr-4">true</td>
                  <td className="py-2">Enable ask/chat feature</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_STUDIO_ENABLED</code></td>
                  <td className="py-2 pr-4">true</td>
                  <td className="py-2">Enable studio content generation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">UI/UX</h3>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Variable</th>
                  <th className="text-left py-2 pr-4">Default</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_APP_NAME</code></td>
                  <td className="py-2 pr-4">NotebookLLM</td>
                  <td className="py-2">Application name displayed in UI</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_APP_URL</code></td>
                  <td className="py-2 pr-4">http://localhost:3000</td>
                  <td className="py-2">Production URL for OAuth redirects</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>NEXT_PUBLIC_SHOW_BRANDING</code></td>
                  <td className="py-2 pr-4">true</td>
                  <td className="py-2">Show NotebookLLM branding</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Example Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          Example Configuration
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Development (.env.local)</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Features
NEXT_PUBLIC_GOOGLE_DRIVE_ENABLED=false
NEXT_PUBLIC_NOTE_TAKING_ENABLED=true
NEXT_PUBLIC_ASK_ENABLED=true
NEXT_PUBLIC_STUDIO_ENABLED=true`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Production (.env.production)</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Features
NEXT_PUBLIC_GOOGLE_DRIVE_ENABLED=true
NEXT_PUBLIC_NOTE_TAKING_ENABLED=true
NEXT_PUBLIC_ASK_ENABLED=true
NEXT_PUBLIC_STUDIO_ENABLED=true

# App
NEXT_PUBLIC_APP_NAME=NotebookLLM
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_LOGIN_PAGE=false
NEXT_PUBLIC_ALLOW_SIGNUP=true`}</pre>
          </div>
        </div>
      </section>

      {/* Backend Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Database className="w-6 h-6" />
          Backend Configuration
        </h2>
        <p className="text-muted-foreground">
          The frontend also needs certain backend environment variables to be configured. See the{' '}
          <a href="/docs/architecture" className="text-primary hover:underline">backend configuration docs</a>{' '}
          for the complete list.
        </p>

        <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20">
          <h4 className="font-semibold mb-2">Important Backend Variables</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><code>DATABASE_URL</code> - PostgreSQL connection string</li>
            <li><code>SUPABASE_URL</code> & <code>SUPABASE_SERVICE_ROLE_KEY</code> - Supabase</li>
            <li><code>QDRANT_HOST</code> & <code>QDRANT_API_KEY</code> - Vector database</li>
            <li><code>GEMINI_API_KEY</code> - Google Gemini API</li>
            <li><code>COHERE_API_KEY</code> - Cohere for reranking</li>
          </ul>
        </div>
      </section>

      {/* AI Providers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Brain className="w-6 h-6" />
          AI Provider Configuration
        </h2>
        <p className="text-muted-foreground">
          Configure AI providers for the backend. At minimum, you need one LLM provider.
        </p>

        <div className="p-4 rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Provider</th>
                <th className="text-left py-2">Variable</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4">Google Gemini</td>
                <td className="py-2"><code>GEMINI_API_KEY</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">OpenAI</td>
                <td className="py-2"><code>OPENAI_API_KEY</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Groq</td>
                <td className="py-2"><code>GROQ_API_KEY</code></td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Cohere (Reranking)</td>
                <td className="py-2"><code>COHERE_API_KEY</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="/docs/authentication" className="p-4 rounded-lg border hover:bg-accent transition-colors">
            <h3 className="font-semibold">Authentication</h3>
            <p className="text-sm text-muted-foreground">Set up auth providers</p>
          </a>
          <a href="/docs/deployment" className="p-4 rounded-lg border hover:bg-accent transition-colors">
            <h3 className="font-semibold">Deployment</h3>
            <p className="text-sm text-muted-foreground">Deploy to production</p>
          </a>
        </div>
      </section>
    </div>
  )
}
