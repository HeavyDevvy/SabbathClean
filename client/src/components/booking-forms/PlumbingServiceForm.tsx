import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import type { ServiceConfig } from "@/config/service-configs";

interface PlumbingServiceFormProps {
  formData: {
    plumbingIssue?: string;
    urgency?: string;
    [key: string]: any;
  };
  setFormData: (data: any | ((prev: any) => any)) => void;
  currentConfig: Pick<ServiceConfig, 'plumbingIssues'> | null;
}

export default function PlumbingServiceForm({
  formData,
  setFormData,
  currentConfig,
}: PlumbingServiceFormProps) {
  return (
    <>
      <div>
        <Label>What needs to be fixed? *</Label>
        <Select
          value={formData.plumbingIssue}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, plumbingIssue: value }))
          }
        >
          <SelectTrigger data-testid="select-plumbing-issue">
            <SelectValue placeholder="Select the plumbing issue" />
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-y-auto">
            {currentConfig?.plumbingIssues?.map((issue) => (
              <SelectItem key={issue.value} value={issue.value}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{issue.label} - R{issue.price}</span>
                  <span className="text-xs text-gray-500 mt-1">{issue.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Booking Urgency *</Label>
        <Select
          value={formData.urgency}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, urgency: value }))
          }
        >
          <SelectTrigger data-testid="select-plumbing-urgency">
            <SelectValue placeholder="Select urgency level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="emergency">
              <div className="flex flex-col items-start">
                <span className="font-medium text-red-600">Emergency (Immediate)</span>
                <span className="text-xs text-gray-500 mt-1">Provider dispatched within 1 hour - Burst pipes, flooding</span>
              </div>
            </SelectItem>
            <SelectItem value="urgent">
              <div className="flex flex-col items-start">
                <span className="font-medium text-orange-600">Urgent (Same Day)</span>
                <span className="text-xs text-gray-500 mt-1">Service within 24 hours - Major leaks, no water</span>
              </div>
            </SelectItem>
            <SelectItem value="same-day">
              <div className="flex flex-col items-start">
                <span className="font-medium text-yellow-600">Same Day</span>
                <span className="text-xs text-gray-500 mt-1">Service today if available</span>
              </div>
            </SelectItem>
            <SelectItem value="next-day">
              <div className="flex flex-col items-start">
                <span className="font-medium">Next Day</span>
                <span className="text-xs text-gray-500 mt-1">Service tomorrow</span>
              </div>
            </SelectItem>
            <SelectItem value="standard">
              <div className="flex flex-col items-start">
                <span className="font-medium">Standard (Flexible)</span>
                <span className="text-xs text-gray-500 mt-1">Schedule at your convenience - Non-urgent repairs</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {(formData.urgency === "emergency" || formData.urgency === "urgent" || formData.urgency === "same-day") && (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-700 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>
                {formData.urgency === "emergency" && "Emergency service includes R150 callout fee. Provider will contact you immediately."}
                {formData.urgency === "urgent" && "Urgent service includes R100 priority fee. Service scheduled for today."}
                {formData.urgency === "same-day" && "Same-day service subject to availability. Additional R50 fee may apply."}
              </span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
