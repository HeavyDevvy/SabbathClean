import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, Lock as LockIcon } from "lucide-react";

interface LocationStepProps {
  formData: {
    propertyType: string;
    address: string;
    gateCode: string;
  };
  setFormData: (updater: (prev: any) => any) => void;
  currentConfig: {
    propertyTypes?: Array<{ value: string; label: string }>;
  };
  handleAddressChange: (address: string) => void;
}

export function LocationStep({
  formData,
  setFormData,
  currentConfig,
  handleAddressChange
}: LocationStepProps) {
  const showGateCode = formData.propertyType === "apartment" || 
                       formData.propertyType === "townhouse" || 
                       formData.propertyType === "villa";

  return (
    <>
      <div>
        <Label htmlFor="property-type">Property Type *</Label>
        <Select 
          value={formData.propertyType} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
        >
          <SelectTrigger data-testid="select-property-type">
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig.propertyTypes?.map((type: any) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="address">Service Address *</Label>
        <div className="space-y-3">
          <Input
            id="address"
            placeholder="Enter your service address"
            value={formData.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            className="w-full"
            data-testid="input-address"
          />
          {formData.address && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Address confirmed - Provider matching within 20km radius
              </p>
            </div>
          )}
        </div>
      </div>

      {showGateCode && (
        <div>
          <Label htmlFor="gate-code">Gate/Access Code (Optional)</Label>
          <Input
            id="gate-code"
            type="password"
            placeholder="Enter gate or access code"
            value={formData.gateCode}
            onChange={(e) => setFormData(prev => ({ ...prev, gateCode: e.target.value }))}
            className="w-full"
            data-testid="input-gate-code"
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <LockIcon className="h-3 w-3" />
            Encrypted and only shared with your assigned provider
          </p>
        </div>
      )}
    </>
  );
}
