import { HowItWorksBody } from "@/components/HowItWorks";

export default function HowItWorksPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl tracking-tight">How a reading is generated</h1>
        <p className="text-sm text-muted">
          Your own rolling baseline generates the pattern. There is no population norm and no randomness.
        </p>
      </header>
      <HowItWorksBody />
    </div>
  );
}
