import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ServiceConfig } from "@/config/service-configs";

interface GardenServiceFormProps {
  formData: {
    gardenSize?: string;
    gardenCondition?: string;
    [key: string]: any;
  };
  setFormData: (data: any | ((prev: any) => any)) => void;
  currentConfig: Pick<ServiceConfig, 'gardenSizes' | 'gardenConditions'> | null;
}

export default function GardenServiceForm({
  formData,
  setFormData,
  currentConfig,
}: GardenServiceFormProps) {
  return (
    <>
      <div>
        <Label>Garden Size Range *</Label>
        <Select
          value={formData.gardenSize}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, gardenSize: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select garden size" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig?.gardenSizes?.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label} - {size.multiplier}x multiplier
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Garden Condition *</Label>
        <Select
          value={formData.gardenCondition}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, gardenCondition: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select garden condition" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig?.gardenConditions?.map((condition) => (
              <SelectItem key={condition.value} value={condition.value}>
                {condition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
