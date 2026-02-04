import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden bg-surface-0">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-synapse-500/10 via-transparent to-primary/5 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-sm z-10 flex flex-col gap-8">
        <Link href="/" className="flex items-center gap-2.5 mx-auto group">
            <Logo className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <span className="text-2xl font-bold text-foreground group-hover:text-synapse-500 transition-colors">MemexLLM</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
