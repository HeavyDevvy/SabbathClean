import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CleaningServiceFormProps {
  formData: {
    cleaningType?: string;
    propertySize?: string;
    [key: string]: any;
  };
  setFormData: (data: any | ((prev: any) => any)) => void;
  currentConfig: {
    cleaningTypes?: Array<{ value: string; label: string; price: number }>;
    propertySizes?: Array<{ value: string; label: string }>;
  };
}

export default function CleaningServiceForm({
  formData,
  setFormData,
  currentConfig,
}: CleaningServiceFormProps) {
  return (
    <>
      <div>
        <Label htmlFor="cleaning-type">Cleaning Type *</Label>
        <Select
          value={formData.cleaningType}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, cleaningType: value }))
          }
        >
          <SelectTrigger data-testid="select-cleaning-type">
            <SelectValue placeholder="Select cleaning type" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig.cleaningTypes?.map((type: any) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label} - R{type.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="property-size">Property Size *</Label>
        <Select
          value={formData.propertySize}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, propertySize: value }))
          }
        >
          <SelectTrigger data-testid="select-property-size">
            <SelectValue placeholder="Select property size" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig.propertySizes?.map((size: any) => (
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
