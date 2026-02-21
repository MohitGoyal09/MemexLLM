import { Badge } from "@/components/ui/badge"
import { Code, Shield, RefreshCw, Upload } from "lucide-react"

export default function ApiClientPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Reference</Badge>
        <h1 className="text-4xl font-bold tracking-tight">API Client</h1>
        <p className="text-xl text-muted-foreground">
          Complete guide to the frontend API client, including authentication, rate limiting, and usage patterns.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">
          The API client module provides a robust, type-safe interface for communicating with the NotebookLLM backend.
          It handles authentication, automatic retries, rate limiting, and error handling.
        </p>
      </section>

      {/* Core Client */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          Core API Client
        </h2>
        <p className="text-muted-foreground">
          The main API client functions handle all HTTP requests to the backend with built-in authentication,
          rate limiting, and retry logic.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">apiClient Function</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`import { apiClient, apiUpload, ApiError, RateLimitError } from "@/lib/api/client"

// Basic GET request
const data = await apiClient<T>("/endpoint")

// POST request with body
const result = await apiClient<T>("/endpoint", {
  method: "POST",
  body: JSON.stringify({ key: "value" })
})

// With custom timeout and retries
const result = await apiClient<T>("/endpoint", {
  method: "POST",
  body: JSON.stringify(data),
  timeoutMs: 60000,
  maxRetries: 5,
  retryOnRateLimit: true
})`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">File Uploads</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`import { apiUpload } from "@/lib/api/client"

// Upload file with FormData
const formData = new FormData()
formData.append("file", fileBlob, "document.pdf")
formData.append("notebook_id", notebookId)

const result = await apiUpload<UploadResponse>("/api/v1/documents/upload", formData)`}</pre>
          </div>
        </div>
      </section>

      {/* Error Handling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Error Handling
        </h2>
        <p className="text-muted-foreground">
          The API client provides custom error classes for different types of failures, enabling granular error handling.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">ApiError</h3>
          <p className="text-sm text-muted-foreground">
            Base error class for API failures. Contains HTTP status code and error details.
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`try {
  const data = await apiClient("/endpoint")
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status)    // HTTP status code
    console.log(error.detail)    // Error message from server
    console.log(error.rateLimitStatus) // Rate limit info if available
    
    if (error.status === 401) {
      // Redirect to login
      window.location.href = "/auth/login"
    }
  }
}`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">RateLimitError</h3>
          <p className="text-sm text-muted-foreground">
            Thrown when rate limits are exceeded. Contains retry information and current rate limit status.
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`try {
  const data = await apiClient("/endpoint")
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(error.retryAfterSeconds)  // Seconds until retry
    console.log(error.rateLimitStatus)    // Full rate limit status
    
    // Wait and retry
    if (error.retryAfterSeconds) {
      await sleep(error.retryAfterSeconds * 1000)
      // Retry the request
    }
  }
}`}</pre>
          </div>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <RefreshCw className="w-6 h-6" />
          Rate Limiting
        </h2>
        <p className="text-muted-foreground">
          The client automatically tracks rate limits from API responses and implements exponential backoff
          for retrying failed requests.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Rate Limit Headers</h3>
          <p className="text-sm text-muted-foreground">
            The client parses these headers from API responses:
          </p>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Header</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>x-ratelimit-limit</code></td>
                  <td className="py-2">Maximum requests allowed in the window</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>x-ratelimit-remaining</code></td>
                  <td className="py-2">Remaining requests in current window</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>x-ratelimit-reset</code></td>
                  <td className="py-2">Unix timestamp when the limit resets</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>retry-after</code></td>
                  <td className="py-2">Seconds to wait before retrying</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-sem-semibold">Checking Rate Limit Status</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`import { 
  getRateLimitStatus, 
  canMakeApiRequest,
  getRateLimitMessage,
  subscribeToRateLimitChanges 
} from "@/lib/api/client"

// Check current status
const status = getRateLimitStatus()
console.log(status.canMakeRequest)    // Can we make requests?
console.log(status.remaining)          // Remaining requests
console.log(status.usagePercentage)     // % of limit used
console.log(status.retryAfterSeconds) // Seconds until retry

// Simple check
if (canMakeApiRequest()) {
  // Make API call
}

// Subscribe to changes
const unsubscribe = subscribeToRateLimitChanges((status) => {
  console.log("Rate limit changed:", status)
})

// Cleanup
unsubscribe()`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Backoff Strategy</h3>
          <p className="text-sm text-muted-foreground">
            The client uses exponential backoff with jitter for retries:
          </p>
          <div className="p-4 rounded-lg border">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>First retry: ~1 second</li>
              <li>Second retry: ~2 seconds</li>
              <li>Third retry: ~4 seconds</li>
              <li>Maximum delay: 30 seconds</li>
              <li>Random jitter: 0-30% added to prevent thundering herd</li>
            </ul>
          </div>
        </div>
      </section>

      {/* API Modules */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">API Modules</h2>
        <p className="text-muted-foreground">
          The API is organized into modular endpoints, each handling a specific feature area.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Importing API Modules</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Chat API
import { chatApi } from "@/lib/api/chat"
const messages = await chatApi.getMessages(notebookId)
const response = await chatApi.sendMessage(notebookId, message)

// Documents API
import { documentsApi } from "@/lib/api/documents"
const docs = await documentsApi.list(notebookId)
const upload = await documentsApi.upload(file, notebookId)

// Generation API
import { generationApi } from "@/lib/api/generation"
const content = await generationApi.generate(notebookId, "podcast")

// Notes API
import { notesApi } from "@/lib/api/notes"
const notes = await notesApi.list(notebookId)

// Feedback API
import { feedbackApi } from "@/lib/api/feedback"
await feedbackApi.create({ content_type: "chat_response", content_id, rating: "thumbs_up" })`}</pre>
          </div>
        </div>
      </section>

      {/* Streaming */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Server-Sent Events (Streaming)
        </h2>
        <p className="text-muted-foreground">
          For streaming responses (like chat), use the streaming headers for SSE connections.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Streaming Headers</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`import { getStreamingHeaders, getApiBaseUrl } from "@/lib/api/client"

async function* streamChat(message: string) {
  const headers = await getStreamingHeaders()
  const response = await fetch(\`\${getApiBaseUrl()}/api/v1/chat/stream\`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, stream: true })
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  while (reader) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    yield chunk
  }
}`}</pre>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Configuration</h2>
        <p className="text-muted-foreground">
          The API client can be configured through environment variables.
        </p>

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
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Use TypeScript</h3>
            <p className="text-sm text-muted-foreground">
              All API responses are typed. Import types from the appropriate module for full type safety.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Handle Errors</h3>
            <p className="text-sm text-muted-foreground">
              Always wrap API calls in try/catch and handle ApiError and RateLimitError appropriately.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Respect Rate Limits</h3>
            <p className="text-sm text-muted-foreground">
              The client handles retries automatically, but avoid making excessive concurrent requests.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Use Modules</h3>
            <p className="text-sm text-muted-foreground">
              Import specific API modules (chatApi, documentsApi, etc.) rather than making raw requests.
            </p>
          </div>
        </div>
      </section>

      {/* Related */}
      <div className="flex gap-4 pt-4">
        <a href="/docs/types" className="text-primary hover:underline">
          Next: Types →
        </a>
      </div>
    </div>
  )
}
