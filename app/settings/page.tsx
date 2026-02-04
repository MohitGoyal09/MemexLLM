import { Suspense } from "react";
import { SettingsForm } from "@/components/settings-form";
import { Header } from "@/components/header";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <Suspense fallback={
             <div className="flex h-[50vh] items-center justify-center">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
        }>
            <SettingsForm />
        </Suspense>
      </main>
    </div>
  );
}
