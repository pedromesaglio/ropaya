import type { TrackingStep } from "@/lib/api";
import { CheckCircle, Circle } from "lucide-react";

export function TrackingStatus({ steps, message }: { steps: TrackingStep[]; message: string }) {
  return (
    <div className="space-y-4">
      <p className="text-foreground font-medium">{message}</p>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.status} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle size={20} className="text-primary flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-muted-foreground/30 flex-shrink-0" />
            )}
            <span className={step.completed ? "text-foreground" : "text-muted-foreground/50"}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
