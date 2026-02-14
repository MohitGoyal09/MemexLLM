import { LandingNav, LandingFooter } from "@/components/landing";
import { createClient } from "@/lib/supabase/server";

export default async function PrivacyPolicy() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <LandingNav user={user} />
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="prose dark:prose-invert prose-slate max-w-none">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to MemexLLM ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our specialized AI-powered notebook platform. This policy outlines our data handling practices and your rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, and authentication credentials via our providers.</li>
              <li><strong>User Content:</strong> Documents, text, and media you upload (e.g., PDF, Text, Audio, YouTube links) specifically for processing by our AI models.</li>
              <li><strong>Usage Data:</strong> Information on how you interact with the service, including feature usage, timestamps, and device information.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. AI and Data Processing</h2>
            <p className="mb-4">
              Our core service involves analyzing your uploaded content using Large Language Models (LLMs). By using the service, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Your content is processed by third-party AI providers (e.g., OpenAI, Anthropic, Google Gemini, Groq) solely for generation of summaries, chats, and insights.</li>
              <li>We do <strong>not</strong> use your private data to train our foundational models.</li>
              <li>Data is encrypted in transit and at rest where applicable.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Integrations</h2>
            <p className="mb-4">
              We integrate with services like Google Drive and YouTube. If you connect these services:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Google Drive:</strong> We only access files you explicitly select for import. We adhere to Google's Limited Use Policy.</li>
              <li><strong>YouTube:</strong> We process video metadata and transcripts for content analysis.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="mb-4">
              We retain your personal information and content only for as long as necessary to provide the Service and fulfill the purposes outlined in this policy. You may delete your account and associated data at any time via the Settings page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at support@memexllm.xyz.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
