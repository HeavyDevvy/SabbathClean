import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Sparkles } from "lucide-react";
import { type AddOn } from "../../../config/addons";

interface AddOnsStepProps {
  formData: {
    selectedAddOns: string[];
    [key: string]: any;
  };
  setFormData: (data: any | ((prev: any) => any)) => void;
  addOnsComment: string;
  setAddOnsComment: (comment: string) => void;
  commentPlaceholder: string;
  suggestedAddOns: AddOn[];
  availableAddOns: AddOn[];
  estimatedHours: number;
  onAddAnotherService?: ((draftData: any) => void) | null;
  bookedServices: string[];
  mappedServiceId: string;
  currentConfig: any;
  pricing: any;
}

export default function AddOnsStep({
  formData,
  setFormData,
  addOnsComment,
  setAddOnsComment,
  commentPlaceholder,
  suggestedAddOns,
  availableAddOns,
  estimatedHours,
  onAddAnotherService,
  bookedServices,
  mappedServiceId,
  currentConfig,
  pricing,
}: AddOnsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-primary text-xl">+</span>
        </div>
        <h3 className="text-lg font-semibold">Add-ons & Extras</h3>
        <p className="text-gray-600 text-sm">Customize your service with additional options</p>
      </div>

      <div className="space-y-4">
        {/* Comments Field */}
        <div>
          <Label htmlFor="addons-comment">Comments / Additional Details</Label>
          <Textarea
            id="addons-comment"
            placeholder={commentPlaceholder}
            value={addOnsComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddOnsComment(e.target.value)}
            className="min-h-[80px]"
            data-testid="textarea-addons-comment"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Mention specific issues to get smart add-on suggestions
          </p>
        </div>

        {/* Keyword-based Suggestions */}
        {suggestedAddOns.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2 mb-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Smart Suggestions</h4>
                <p className="text-xs text-blue-700">Based on your comments, we suggest:</p>
              </div>
            </div>
            <div className="space-y-2">
              {suggestedAddOns.map((addon) => (
                <div 
                  key={addon.id} 
                  className="flex items-center justify-between p-2 bg-white rounded border border-blue-200"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`suggested-${addon.id}`}
                      checked={formData.selectedAddOns.includes(addon.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData((prev: any) => ({
                            ...prev,
                            selectedAddOns: [...prev.selectedAddOns, addon.id]
                          }));
                        } else {
                          setFormData((prev: any) => ({
                            ...prev,
                            selectedAddOns: prev.selectedAddOns.filter((id: string) => id !== addon.id)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`suggested-${addon.id}`} className="text-sm font-medium cursor-pointer">
                      {addon.name}
                    </Label>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">+R{addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons Dropdown */}
        <div>
          <Label htmlFor="select-addon">Add More Services (Optional)</Label>
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !formData.selectedAddOns.includes(value)) {
                setFormData((prev: any) => ({
                  ...prev,
                  selectedAddOns: [...prev.selectedAddOns, value]
                }));
              }
            }}
          >
            <SelectTrigger id="select-addon">
              <SelectValue placeholder="Select additional services" />
            </SelectTrigger>
            <SelectContent>
              {availableAddOns.map((addon) => (
                <SelectItem 
                  key={addon.id} 
                  value={addon.id}
                  disabled={formData.selectedAddOns.includes(addon.id)}
                >
                  {addon.name} - R{addon.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Add-ons Display */}
        {formData.selectedAddOns.length > 0 && (
          <div>
            <Label>Selected Add-ons</Label>
            <div className="space-y-2 mt-2">
              {formData.selectedAddOns.map((addonId: string) => {
                const addon = availableAddOns.find((a: AddOn) => a.id === addonId);
                if (!addon) return null;
                return (
                  <div key={addonId} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{addon.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-primary">+R{addon.price}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData((prev: any) => ({
                            ...prev,
                            selectedAddOns: prev.selectedAddOns.filter((id: string) => id !== addonId)
                          }));
                        }}
                        className="h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Estimated Hours */}
        <div>
          <Label htmlFor="estimated-hours">Estimated Hours</Label>
          <Input
            id="estimated-hours"
            type="text"
            value={`${estimatedHours} hours`}
            readOnly
            className="bg-gray-50"
            data-testid="input-estimated-hours"
          />
          <p className="text-xs text-orange-600 mt-1 flex items-start">
            <span className="mr-1">⚠️</span>
            <span>The time spent on site is subject to change once the service provider assesses the scope on-site.</span>
          </p>
        </div>
      </div>

      {/* Add Another Service Button - Show on Step 3 (Add-ons) */}
      {onAddAnotherService && bookedServices.length < 2 && (
        <div className="space-y-3 mt-6">
          <Button
            variant="outline"
            className="w-full border-2 border-dashed border-primary text-primary hover:bg-primary/5"
            onClick={() => {
              const draftData = {
                serviceId: mappedServiceId,
                serviceName: currentConfig?.name || mappedServiceId,
                ...formData,
                pricing,
                totalCost: pricing.totalPrice,
                commission: Math.round(pricing.totalPrice * 0.15),
                timestamp: new Date().toISOString(),
                selectedProvider: null,
                addOnsComment,
                estimatedHours
              };
              
              onAddAnotherService(draftData);
            }}
            data-testid="button-add-another-service"
          >
            <span className="text-lg mr-2">+</span>
            Add Another Service (Max 3)
          </Button>
          {bookedServices.length > 0 && (
            <div className="text-sm text-gray-600 text-center">
              Already booked: {bookedServices.length} service{bookedServices.length > 1 ? 's' : ''}
            </div>
          )}
          <p className="text-xs text-gray-500 text-center">
            You can add up to 3 services before completing your booking
          </p>
        </div>
      )}
    </div>
  );
}
