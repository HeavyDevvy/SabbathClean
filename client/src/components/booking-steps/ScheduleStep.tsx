import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, ChefHat, Scissors } from "lucide-react";

interface ScheduleStepProps {
  formData: {
    preferredDate: string;
    timePreference: string;
    recurringSchedule: string;
    materials: string;
    insurance?: boolean;
    urgency?: string;
    [key: string]: any;
  };
  setFormData: (data: any | ((prev: any) => any)) => void;
  isHouseCleaning: boolean;
  isChefCatering: boolean;
  isGardenService: boolean;
  isPlumbing: boolean;
  isElectrical: boolean;
  showEnhancedProviderDetails: boolean;
  shouldDisableRecurring: boolean;
}

export default function ScheduleStep({
  formData,
  setFormData,
  isHouseCleaning,
  isChefCatering,
  isGardenService,
  isPlumbing,
  isElectrical,
  showEnhancedProviderDetails,
  shouldDisableRecurring,
}: ScheduleStepProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-2">When do you need help?</h3>
        <p className="text-sm text-muted-foreground">Choose your preferred date and time</p>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="preferred-date">
            {isHouseCleaning ? "Date *" : "Preferred Date *"}
          </Label>
          <Input
            id="preferred-date"
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, preferredDate: e.target.value }))}
            min={(() => {
              const minDate = new Date();
              if (isChefCatering || isGardenService) {
                minDate.setDate(minDate.getDate() + 1);
              }
              return minDate.toISOString().split('T')[0];
            })()}
            className="w-full h-12 text-base"
            readOnly={formData.urgency === "emergency" || formData.urgency === "urgent" || formData.urgency === "same-day" || (isElectrical && formData.urgency === "next-day")}
            disabled={formData.urgency === "emergency" || formData.urgency === "urgent" || formData.urgency === "same-day" || (isElectrical && formData.urgency === "next-day")}
            data-testid="input-preferred-date"
            required
          />
          {(formData.urgency === "emergency" || formData.urgency === "urgent" || formData.urgency === "same-day") && (
            <p className="text-xs text-orange-600 mt-1">
              Date locked to today for {formData.urgency === "emergency" ? "emergency" : formData.urgency === "urgent" ? "urgent" : "same-day"} services
            </p>
          )}
          {isElectrical && formData.urgency === "next-day" && (
            <p className="text-xs text-gray-600 mt-1">
              Next-day electrical service is scheduled for tomorrow
            </p>
          )}
          {isChefCatering && (
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <ChefHat className="h-3 w-3 mr-1" />
              Chef services require 24 hours minimum notice for menu planning and ingredient sourcing
            </p>
          )}
          {isGardenService && (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <Scissors className="h-3 w-3 mr-1" />
              Garden services require 24 hours minimum notice to ensure our professionals arrive prepared with the right equipment
            </p>
          )}
        </div>

        <div>
          <Label>
            {isHouseCleaning ? "Preferred Time *" : "Modern Time Preference Selection *"}
          </Label>
          <Select 
            value={formData.timePreference} 
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, timePreference: value }))}
            disabled={formData.urgency === "emergency"}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose your preferred time slot" />
            </SelectTrigger>
            <SelectContent>
              {formData.urgency === "emergency" && (
                <SelectItem value="ASAP">As Soon As Possible</SelectItem>
              )}
              {(() => {
                const isToday = formData.preferredDate === new Date().toISOString().split('T')[0];
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const isChef = isChefCatering;
                const isGarden = isGardenService;
                
                const timeSlots = [
                  { value: "08:00", label: "08:00 - Morning", hour: 8 },
                  { value: "10:00", label: "10:00 - Late Morning", hour: 10 },
                  { value: "12:00", label: "12:00 - Noon", hour: 12 },
                  { value: "14:00", label: "14:00 - Afternoon", hour: 14 },
                  { value: "16:00", label: "16:00 - Late Afternoon", hour: 16 }
                ];
                
                return timeSlots.map((slot) => {
                  let isDisabled = false;
                  let disabledReason = "";
                  
                  if ((showEnhancedProviderDetails || isGarden) && isToday && 
                      (slot.hour < currentHour || (slot.hour === currentHour && currentMinute > 0))) {
                    isDisabled = true;
                    disabledReason = " (Past)";
                  }
                  
                  if (isChef && formData.preferredDate) {
                    const selectedDateTime = new Date(formData.preferredDate);
                    selectedDateTime.setHours(slot.hour, 0, 0, 0);
                    const hoursFromNow = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                    
                    if (hoursFromNow < 24) {
                      isDisabled = true;
                      disabledReason = " (< 24hrs notice)";
                    }
                  }
                  
                  if (isGarden && formData.preferredDate) {
                    const selectedDateTime = new Date(formData.preferredDate);
                    selectedDateTime.setHours(slot.hour, 0, 0, 0);
                    const hoursFromNow = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                    
                    if (hoursFromNow < 24) {
                      isDisabled = true;
                      disabledReason = " (< 24hrs notice)";
                    }
                  }
                  
                  return (
                    <SelectItem 
                      key={slot.value} 
                      value={slot.value}
                      disabled={isDisabled}
                    >
                      {slot.label}
                      {disabledReason}
                    </SelectItem>
                  );
                });
              })()}
            </SelectContent>
          </Select>
          {formData.urgency === "emergency" && (
            <p className="text-xs text-red-600 mt-1">
              Time locked to "As Soon As Possible" for emergency services
            </p>
          )}
        </div>

        <div>
          <Label>
            {isHouseCleaning ? "Reoccurring Services" : "Recurring Schedule Options"}
          </Label>
          <Select 
            value={formData.recurringSchedule} 
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, recurringSchedule: value }))}
            disabled={shouldDisableRecurring}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose booking frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-time">One-time Service (no commitment)</SelectItem>
              <SelectItem value="weekly">Weekly (15% discount - most popular)</SelectItem>
              <SelectItem value="bi-weekly">Bi-weekly (10% discount)</SelectItem>
              <SelectItem value="monthly">Monthly (8% discount)</SelectItem>
              <SelectItem value="quarterly">Quarterly (5% discount)</SelectItem>
              <SelectItem value="custom">Custom Schedule (contact for pricing)</SelectItem>
            </SelectContent>
          </Select>
          {formData.recurringSchedule !== "one-time" && formData.recurringSchedule && !shouldDisableRecurring && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Recurring discount applied to total pricing
            </p>
          )}
          {shouldDisableRecurring && (
            <p className="text-xs text-red-600 mt-1">
              Recurring schedule unavailable for {formData.urgency} services
            </p>
          )}
        </div>

        <div>
          <Label>
            {isHouseCleaning ? "Materials and Equipment Supplier" : "Materials & Equipment Supply Options"}
          </Label>
          <Select value={formData.materials} onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, materials: value }))
          }>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose material supply option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supply">Provider Supplies All Materials (premium quality included)</SelectItem>
              <SelectItem value="bring">I'll Provide My Own Materials (15% price reduction)</SelectItem>
              <SelectItem value="partial">Mix - Some Provided, Some Mine (custom pricing)</SelectItem>
            </SelectContent>
          </Select>
          {formData.materials === "bring" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-green-700 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                15% discount applied for providing your own materials. Total savings will reflect in final pricing.
              </p>
            </div>
          )}
          {formData.materials === "partial" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-blue-700">
                Custom pricing will be calculated based on which materials you provide versus what the provider supplies.
              </p>
            </div>
          )}
        </div>

        {isPlumbing && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="insurance"
                checked={formData.insurance}
                onCheckedChange={(checked) =>
                  setFormData((prev: any) => ({ ...prev, insurance: !!checked }))
                }
                data-testid="checkbox-plumbing-insurance"
              />
              <Label htmlFor="insurance" className="text-sm">
                Insurance coverage required by insurer
              </Label>
            </div>
          </div>
        )}

        {isElectrical && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="electrical-insurance"
                checked={formData.insurance}
                onCheckedChange={(checked) =>
                  setFormData((prev: any) => ({ ...prev, insurance: !!checked }))
                }
                data-testid="checkbox-electrical-insurance"
              />
              <Label htmlFor="electrical-insurance" className="text-sm">
                Insurance coverage required by insurer
              </Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
