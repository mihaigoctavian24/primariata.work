"use client";

import { NextStepsWidget } from "@/components/dashboard/NextStepsWidget";
import type { NextStep } from "@/types/dashboard";

export default function TestNextStepsPage() {
  const mockSteps: NextStep[] = [
    {
      id: "urgent-payment",
      type: "pay_pending",
      priority: 1, // URGENT (priority <= 2)
      title: "Plătește 150 RON",
      description: "Plată în așteptare - finalizează pentru a continua procesarea",
      action_url: "/plati/test",
      action_label: "Plătește Acum",
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      metadata: { payment_id: "test", amount: 150 },
    },
    {
      id: "urgent-docs",
      type: "upload_documents",
      priority: 2, // URGENT (priority <= 2)
      title: "Încarcă documente pentru CER-2024-001",
      description: "Documente necesare pentru procesarea cererii",
      action_url: "/cereri/test/documents",
      action_label: "Încarcă Documente",
      metadata: { cerere_id: "test" },
    },
    {
      id: "normal-draft",
      type: "complete_draft",
      priority: 3, // Normal (priority > 2)
      title: "Completează cererea CER-2024-002",
      description: "Cerere în ciornă - finalizează și trimite către primărie",
      action_url: "/cereri/test2",
      action_label: "Completează",
      metadata: { cerere_id: "test2" },
    },
  ];

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test NextStepsWidget Theme Fix</h1>
          <p className="text-muted-foreground mt-2">
            Toggle between light and dark theme using the theme switcher in the top right.
            <br />
            The urgent cards (priority 1-2) should have orange highlight that adapts to theme.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Current Theme Test</h2>
            <p className="text-muted-foreground text-sm">
              First two cards are URGENT (should have orange bg/border). Third is normal.
            </p>
          </div>

          <NextStepsWidget
            steps={mockSteps}
            onStepClick={(step) => console.log("Clicked:", step)}
            onDismiss={(stepId) => console.log("Dismissed:", stepId)}
          />
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Expected Behavior:</h3>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
            <li>
              <strong>Light Mode:</strong> Urgent cards have subtle orange tint, clearly visible
              against white background
            </li>
            <li>
              <strong>Dark Mode:</strong> Urgent cards have subtle orange tint, clearly visible
              against dark background
            </li>
            <li>Both modes use same base color (orange-500) with opacity for proper adaptation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
