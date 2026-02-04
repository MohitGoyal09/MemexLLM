import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <img
        src="/logo.svg"
        alt="MemexLLM Logo"
        className="w-full h-full object-contain dark:hidden"
      />
      <img
        src="/white-logo.svg"
        alt="MemexLLM Logo"
        className="w-full h-full object-contain hidden dark:block"
      />
    </div>
  )
}
