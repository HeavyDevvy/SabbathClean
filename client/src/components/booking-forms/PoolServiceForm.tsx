import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ServiceConfig } from "@/config/service-configs";

interface PoolServiceFormProps {
  formData: {
    poolSize?: string;
    poolCondition?: string;
    [key: string]: any;
  };
  setFormData: (data: any | ((prev: any) => any)) => void;
  currentConfig: Pick<ServiceConfig, 'poolSizes' | 'poolConditions'> | null;
}

export default function PoolServiceForm({
  formData,
  setFormData,
  currentConfig,
}: PoolServiceFormProps) {
  return (
    <>
      <div>
        <Label>Pool Size Range *</Label>
        <Select
          value={formData.poolSize}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, poolSize: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select pool size" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig?.poolSizes?.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label} - {size.multiplier}x multiplier
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Pool Condition *</Label>
        <Select
          value={formData.poolCondition}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, poolCondition: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select pool condition" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig?.poolConditions?.map((condition) => (
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
