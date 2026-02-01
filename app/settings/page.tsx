import { SettingsForm } from "@/components/settings-form";
import { Header } from "@/components/header";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <SettingsForm />
      </main>
    </div>
  );
}
