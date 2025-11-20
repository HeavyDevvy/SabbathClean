import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ServiceConfig } from "@/config/service-configs";

interface EventStaffFormProps {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
  currentConfig: Pick<ServiceConfig, 'staffTypes' | 'eventSizes'> | null;
}

export default function EventStaffForm({ formData, setFormData, currentConfig }: EventStaffFormProps) {
  return (
    <>
      <div>
        <Label>Staff Type *</Label>
        <Select value={formData.cleaningType} onValueChange={(value) =>
          setFormData(prev => ({ ...prev, cleaningType: value }))
        }>
          <SelectTrigger data-testid="select-staff-type">
            <SelectValue placeholder="Select staff type" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig?.staffTypes?.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label} - R{type.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Event Size *</Label>
        <Select value={formData.propertySize} onValueChange={(value) =>
          setFormData(prev => ({ ...prev, propertySize: value }))
        }>
          <SelectTrigger data-testid="select-event-size">
            <SelectValue placeholder="Select event size" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig?.eventSizes?.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
