import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ServiceConfig } from "@/config/service-configs";
import { BookingFormData } from "@/hooks/booking/useBookingFlow";
import { Users, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WaiteringFormProps {
  config: ServiceConfig;
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
}

// Local constants for fields not in global config
const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast / Brunch" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "cocktail", label: "Cocktail / Canapés" },
  { value: "tea", label: "High Tea" },
  { value: "all-day", label: "All Day Conference" }
];

const SERVICE_STYLES = [
  { value: "plated", label: "Plated (Sit Down)" },
  { value: "buffet", label: "Buffet" },
  { value: "family", label: "Family Style (Sharing Platters)" },
  { value: "cocktail", label: "Roaming / Cocktail" },
  { value: "silver", label: "Silver Service" }
];

const UNIFORM_PREFERENCES = [
  { value: "standard", label: "Standard (Black trousers, white shirt, apron)" },
  { value: "all-black", label: "All Black" },
  { value: "formal", label: "Formal (Vest/Tie)" },
  { value: "casual", label: "Casual (Polo shirt/Jeans)" },
  { value: "branded", label: "Client Branded (Client provides)" }
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level (Standard Service)" },
  { value: "intermediate", label: "Intermediate (Proficient Service)" },
  { value: "experienced", label: "Experienced (Silver Service/VIP)" },
  { value: "expert", label: "Expert (Top-tier/Specialist)" }
];

export default function WaiteringForm({ config, formData, updateFormData }: WaiteringFormProps) {
  // Staffing recommendations
  const getStaffingRecommendation = () => {
    const guests = parseInt(formData.numberOfGuests || "0");
    const style = formData.serviceStyle;
    
    if (!guests) return null;

    let ratio = "1:20";
    let waiters = Math.ceil(guests / 20);
    
    if (style === "plated" || style === "silver") {
      ratio = "1:10";
      waiters = Math.ceil(guests / 10);
    } else if (style === "cocktail") {
      ratio = "1:25";
      waiters = Math.ceil(guests / 25);
    }

    return {
      ratio,
      waiters,
      bartenders: Math.ceil(guests / 50)
    };
  };

  const recommendation = getStaffingRecommendation();

  return (
    <div className="space-y-8">
      {/* Event Details */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Event Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Event Type *</Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) => updateFormData({ eventType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {config.eventTypes?.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Number of Guests *</Label>
            <Select
              value={formData.numberOfGuests}
              onValueChange={(value) => updateFormData({ numberOfGuests: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select guest count" />
              </SelectTrigger>
              <SelectContent>
                {config.eventSizes?.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Count</SelectItem>
              </SelectContent>
            </Select>
            {formData.numberOfGuests === "custom" && (
               <Input 
                 type="number" 
                 placeholder="Enter exact number"
                 className="mt-2"
                 onChange={(e) => updateFormData({ numberOfGuests: e.target.value })} 
               />
            )}
          </div>

          <div className="space-y-2">
            <Label>Event Date *</Label>
            <Input
              type="date"
              value={formData.eventDate || ""}
              onChange={(e) => updateFormData({ eventDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label>Venue Address *</Label>
            <Input
              placeholder="Full address of the venue"
              value={formData.venueAddress || ""}
              onChange={(e) => updateFormData({ venueAddress: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Venue Type</Label>
            <Select
              value={formData.venueType}
              onValueChange={(value) => updateFormData({ venueType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select venue type" />
              </SelectTrigger>
              <SelectContent>
                {config.propertyTypes?.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
                <SelectItem value="function-hall">Function Hall / Venue</SelectItem>
                <SelectItem value="outdoors">Outdoors / Marquee</SelectItem>
                <SelectItem value="office">Office / Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Staff Required */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Staff Required</h3>
        
        {recommendation && (
          <Alert className="bg-primary/5 border-primary/20 mb-4">
            <Users className="h-4 w-4" />
            <AlertTitle>Recommendation</AlertTitle>
            <AlertDescription>
              For {formData.numberOfGuests} guests ({formData.serviceStyle || "standard"} style), 
              we recommend approx. {recommendation.waiters} waiters and {recommendation.bartenders} bartenders.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Waiters</h3>
              <p className="text-sm text-muted-foreground">Serving food, clearing, general service</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => updateFormData({ waitersCount: Math.max(0, (formData.waitersCount || 0) - 1) })}
              >
                -
              </Button>
              <span className="w-8 text-center">{formData.waitersCount || 0}</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => updateFormData({ waitersCount: (formData.waitersCount || 0) + 1 })}
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Bartenders</h3>
              <p className="text-sm text-muted-foreground">Drink service, cocktail mixing</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => updateFormData({ bartendersCount: Math.max(0, (formData.bartendersCount || 0) - 1) })}
              >
                -
              </Button>
              <span className="w-8 text-center">{formData.bartendersCount || 0}</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => updateFormData({ bartendersCount: (formData.bartendersCount || 0) + 1 })}
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Catering Assistants</h3>
              <p className="text-sm text-muted-foreground">Back of house, plating, washing up</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => updateFormData({ cateringAssistantsCount: Math.max(0, (formData.cateringAssistantsCount || 0) - 1) })}
              >
                -
              </Button>
              <span className="w-8 text-center">{formData.cateringAssistantsCount || 0}</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => updateFormData({ cateringAssistantsCount: (formData.cateringAssistantsCount || 0) + 1 })}
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="coordinator" 
              checked={formData.coordinatorRequired}
              onCheckedChange={(checked) => updateFormData({ coordinatorRequired: checked as boolean })}
            />
            <Label htmlFor="coordinator">Require an Event Coordinator / Manager?</Label>
          </div>
        </div>

        {((formData.waitersCount || 0) + (formData.bartendersCount || 0) >= 3) && (
          <div className="space-y-2 pt-4 border-t mt-4">
            <Label>Uniform Preference</Label>
            <Select
              value={formData.uniformPreference}
              onValueChange={(value) => updateFormData({ uniformPreference: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select uniform style" />
              </SelectTrigger>
              <SelectContent>
                {UNIFORM_PREFERENCES.map((pref) => (
                  <SelectItem key={pref.value} value={pref.value}>
                    {pref.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Card>

      {/* Service & Menu Details */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Service & Menu Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select
              value={formData.mealType}
              onValueChange={(value) => updateFormData({ mealType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Service Style</Label>
            <Select
              value={formData.serviceStyle}
              onValueChange={(value) => updateFormData({ serviceStyle: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service style" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(formData.serviceStyle === "plated" || formData.serviceStyle === "silver") && (
          <div className="space-y-2 mt-4">
            <Label>Number of Courses</Label>
            <Select
              value={formData.numberOfCourses}
              onValueChange={(value) => updateFormData({ numberOfCourses: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Course</SelectItem>
                <SelectItem value="2">2 Courses</SelectItem>
                <SelectItem value="3">3 Courses</SelectItem>
                <SelectItem value="4">4 Courses</SelectItem>
                <SelectItem value="5+">5+ Degustation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {(formData.bartendersCount || 0) > 0 && (
          <div className="space-y-2 pt-4 border-t mt-4">
            <Label>Bar Service Type</Label>
            <RadioGroup
              value={formData.barServiceType}
              onValueChange={(value) => updateFormData({ barServiceType: value })}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="full-bar" id="full-bar" />
                <Label htmlFor="full-bar">Full Bar (Spirits, Wine, Beer)</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="wine-beer" id="wine-beer" />
                <Label htmlFor="wine-beer">Wine & Beer Only</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="cocktails" id="cocktails" />
                <Label htmlFor="cocktails">Cocktail Bar</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="soft" id="soft" />
                <Label htmlFor="soft">Soft Drinks / Juice Bar</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </Card>

      {/* Timing & Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Timing & Schedule</h3>
        
        <Alert className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            We recommend staff arrive at least 60 minutes before guest arrival for setup.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Staff Arrival Time *</Label>
            <Input
              type="time"
              value={formData.staffArrivalTime || ""}
              onChange={(e) => updateFormData({ staffArrivalTime: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Guest Arrival / Service Start *</Label>
            <Input
              type="time"
              value={formData.serviceStartTime || ""}
              onChange={(e) => updateFormData({ serviceStartTime: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Event Duration (Hours) *</Label>
            <Input
              type="number"
              min="3"
              max="12"
              value={formData.eventDuration || ""}
              onChange={(e) => updateFormData({ eventDuration: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Estimated End Time</Label>
            <Input
              type="time"
              value={formData.serviceEndTime || ""}
              onChange={(e) => updateFormData({ serviceEndTime: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label>Break Requirements</Label>
          <Textarea
            placeholder="Any specific break times or staff meals provided?"
            value={formData.breakRequirements || ""}
            onChange={(e) => updateFormData({ breakRequirements: e.target.value })}
          />
        </div>
      </Card>

      {/* Final Details & Requirements */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Final Details & Requirements</h3>

        <div className="space-y-4 border rounded-lg p-4 mb-4">
          <h3 className="font-medium">Equipment & Setup</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="venue-equip" 
                checked={formData.venueEquipment}
                onCheckedChange={(checked) => updateFormData({ venueEquipment: checked as boolean })}
              />
              <Label htmlFor="venue-equip">Venue provides all tables, chairs, and linen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="glassware" 
                checked={formData.glasswareProvided}
                onCheckedChange={(checked) => updateFormData({ glasswareProvided: checked as boolean })}
              />
              <Label htmlFor="glassware">Glassware provided by venue/client</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cutlery" 
                checked={formData.cutleryProvided}
                onCheckedChange={(checked) => updateFormData({ cutleryProvided: checked as boolean })}
              />
              <Label htmlFor="cutlery">Cutlery & Crockery provided by venue/client</Label>
            </div>
            {(formData.bartendersCount || 0) > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bar-setup" 
                  checked={formData.barSetupRequired}
                  onCheckedChange={(checked) => updateFormData({ barSetupRequired: checked as boolean })}
                />
                <Label htmlFor="bar-setup">Staff required to help with bar setup?</Label>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Label>Serving Instructions</Label>
          <Textarea
            placeholder="Specific instructions for service flow, VIP guests, or special moments..."
            value={formData.servingInstructions || ""}
            onChange={(e) => updateFormData({ servingInstructions: e.target.value })}
          />
        </div>

        <div className="space-y-2 mb-4">
          <Label>Dietary Notes / Allergens to be aware of</Label>
          <Textarea
            placeholder="List any major allergies or dietary restrictions among guests..."
            value={formData.dietaryNotes || ""}
            onChange={(e) => updateFormData({ dietaryNotes: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Experience Level Required</Label>
          <Select
            value={formData.experienceLevelRequired}
            onValueChange={(value) => updateFormData({ experienceLevelRequired: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select staff experience level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
}
