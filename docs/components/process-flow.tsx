import { cn } from "@/lib/utils";

interface ProcessFlowProps {
  steps: string[];
  className?: string;
}

export function ProcessFlow({ steps, className }: ProcessFlowProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="relative flex items-start gap-0 min-w-max py-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            {/* Step */}
            <div className="flex flex-col items-center w-28">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold shrink-0",
                  "bg-primary text-primary-foreground"
                )}
              >
                {i + 1}
              </div>
              <span className="mt-2 text-xs text-center leading-tight text-muted-foreground font-medium">
                {step}
              </span>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className="flex items-center -mx-2 mb-6">
                <div className="h-px w-6 bg-border" />
                <svg
                  viewBox="0 0 6 10"
                  className="h-2.5 w-1.5 text-border shrink-0"
                  fill="currentColor"
                >
                  <path d="M0 0 L6 5 L0 10 Z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
