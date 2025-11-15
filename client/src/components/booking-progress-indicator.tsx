import { CheckCircle } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

interface ProgressIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export default function ProgressIndicator({ currentStep, steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full py-6 px-4 bg-background border-b border-border">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isUpcoming = currentStep < step.number;

            return (
              <div key={step.number} className="flex flex-col items-center relative flex-1">
                {/* Connecting Line (before each step except first) */}
                {index > 0 && (
                  <div
                    className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${
                      isCompleted ? "bg-primary" : "bg-border"
                    }`}
                    style={{ right: "calc(50% + 20px)", width: "calc(100% - 40px)" }}
                  />
                )}

                {/* Step Circle */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-card border-2 border-border text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <span
                    className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
