import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { ServiceConfig } from "@/config/service-configs";

interface ElectricalServiceFormProps {
  formData: {
    electricalIssue?: string;
    urgency?: string;
    [key: string]: any;
  };
  setFormData: (data: any | ((prev: any) => any)) => void;
  currentConfig: Pick<ServiceConfig, 'electricalIssues'> | null;
}

export default function ElectricalServiceForm({
  formData,
  setFormData,
  currentConfig,
}: ElectricalServiceFormProps) {
  return (
    <>
      <div>
        <Label htmlFor="electrical-issue">What needs to be fixed? *</Label>
        <Select
          value={formData.electricalIssue}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, electricalIssue: value }))
          }
        >
          <SelectTrigger data-testid="select-electrical-issue">
            <SelectValue placeholder="Select the electrical issue" />
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-y-auto">
            {currentConfig?.electricalIssues?.map((issue) => (
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
        <Label>How urgent is this? *</Label>
        <Select
          value={formData.urgency}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, urgency: value }))
          }
        >
          <SelectTrigger data-testid="select-electrical-urgency">
            <SelectValue placeholder="Select urgency level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="emergency">
              <div className="flex flex-col items-start">
                <span className="font-medium">Emergency (24/7) - 2.5x price</span>
                <span className="text-xs text-gray-500 mt-1">Immediate response for critical electrical issues</span>
              </div>
            </SelectItem>
            <SelectItem value="urgent">
              <div className="flex flex-col items-start">
                <span className="font-medium">Urgent (Same Day) - 1.8x price</span>
                <span className="text-xs text-gray-500 mt-1">Fast response within hours for urgent repairs</span>
              </div>
            </SelectItem>
            <SelectItem value="next-day">
              <div className="flex flex-col items-start">
                <span className="font-medium">Next Day</span>
                <span className="text-xs text-gray-500 mt-1">Service tomorrow at regular price</span>
              </div>
            </SelectItem>
            <SelectItem value="standard">
              <div className="flex flex-col items-start">
                <span className="font-medium">Standard (Flexible)</span>
                <span className="text-xs text-gray-500 mt-1">Schedule at your convenience - Non-urgent repairs</span>
              </div>
            </SelectItem>
            <SelectItem value="scheduled">
              <div className="flex flex-col items-start">
                <span className="font-medium">Scheduled (Save 10%)</span>
                <span className="text-xs text-gray-500 mt-1">Plan ahead for electrical upgrades and installations</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {(formData.urgency === "emergency" || formData.urgency === "urgent") && (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-700 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>
                {formData.urgency === "emergency" && "Emergency service charged at 2.5x base price. Certified electrician will respond immediately for safety-critical issues."}
                {formData.urgency === "urgent" && "Urgent service charged at 1.8x base price. Same-day response by qualified electrician for priority repairs."}
              </span>
            </p>
          </div>
        )}
        {formData.urgency === "scheduled" && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>
                Save 10% by scheduling in advance. Great for planned upgrades and non-urgent electrical work.
              </span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
