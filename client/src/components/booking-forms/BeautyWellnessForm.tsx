import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ServiceConfig } from "@/config/service-configs";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Scissors, 
  Sparkles, 
  Heart, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Info
} from "lucide-react";

interface BeautyWellnessFormProps {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
  currentConfig: ServiceConfig | null;
}

export default function BeautyWellnessForm({ formData, setFormData, currentConfig }: BeautyWellnessFormProps) {
  const [internalStep, setInternalStep] = useState(1);
  const selectedEventType = currentConfig?.eventTypes?.find(e => e.value === formData.eventType);
  
  // Helper to update service quantity
  const updateQuantity = (serviceValue: string, delta: number) => {
    setFormData((prev: any) => {
      const currentQty = prev.serviceQuantities?.[serviceValue] || 1;
      const newQty = Math.max(1, currentQty + delta);
      return {
        ...prev,
        serviceQuantities: {
          ...prev.serviceQuantities,
          [serviceValue]: newQty
        }
      };
    });
  };

  // Helper to set specific quantity
  const setQuantity = (serviceValue: string, value: string) => {
    const qty = parseInt(value);
    if (isNaN(qty) || qty < 1) return;
    setFormData((prev: any) => ({
      ...prev,
      serviceQuantities: {
        ...prev.serviceQuantities,
        [serviceValue]: qty
      }
    }));
  };

  const nextStep = () => setInternalStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setInternalStep(prev => Math.max(prev - 1, 1));

  // Validation for next step
  const canProceed = () => {
    if (internalStep === 1) return !!formData.eventType;
    if (internalStep === 2) return formData.beautyServices && formData.beautyServices.length > 0;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between px-2 mb-6">
        <div className={`flex flex-col items-center ${internalStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 mb-1 ${internalStep >= 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>1</div>
          <span className="text-[10px] uppercase font-medium">Event</span>
        </div>
        <div className={`flex-1 h-0.5 mx-2 ${internalStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex flex-col items-center ${internalStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 mb-1 ${internalStep >= 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>2</div>
          <span className="text-[10px] uppercase font-medium">Services</span>
        </div>
        <div className={`flex-1 h-0.5 mx-2 ${internalStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex flex-col items-center ${internalStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 mb-1 ${internalStep >= 3 ? 'border-primary bg-primary/10' : 'border-muted'}`}>3</div>
          <span className="text-[10px] uppercase font-medium">Details</span>
        </div>
      </div>

      {/* Step 1: Event Type Selection */}
      {internalStep === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">What's the Occasion?</h3>
            <p className="text-sm text-muted-foreground">Select the type of event you're planning</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentConfig?.eventTypes?.map((event) => (
              <div 
                key={event.value}
                className={`
                  relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50
                  ${formData.eventType === event.value ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-transparent bg-muted/40'}
                `}
                onClick={() => setFormData((prev: any) => ({ ...prev, eventType: event.value }))}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm">{event.label}</span>
                  {formData.eventType === event.value && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px]">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                {event.multiplier > 1 && (
                  <div className="mt-3 flex items-center gap-1 text-[10px] text-amber-600 font-medium bg-amber-50 w-fit px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Premium Experience
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Services & Quantities */}
      {internalStep === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">Select Services</h3>
            <p className="text-sm text-muted-foreground">Choose treatments and number of people</p>
          </div>

          <div className="space-y-3">
            {currentConfig?.serviceTypes?.map((service) => {
              const isSelected = formData.beautyServices?.includes(service.value);
              const qty = formData.serviceQuantities?.[service.value] || 1;
              
              return (
                <div 
                  key={service.value}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const currentServices = formData.beautyServices || [];
                        let newServices: string[];
                        if (checked) {
                          newServices = [...currentServices, service.value];
                          // Initialize quantity to 1 if adding
                          setFormData((prev: any) => ({
                            ...prev,
                            beautyServices: newServices,
                            serviceQuantities: { ...prev.serviceQuantities, [service.value]: 1 }
                          }));
                        } else {
                          newServices = currentServices.filter((s: string) => s !== service.value);
                          setFormData((prev: any) => ({ ...prev, beautyServices: newServices }));
                        }
                      }}
                      id={`service-${service.value}`}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`service-${service.value}`}
                        className="text-sm font-medium cursor-pointer block"
                      >
                        {service.label}
                      </label>
                      <p className="text-xs text-muted-foreground">R{service.price} per person</p>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2 bg-background border rounded-md p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-sm"
                          onClick={() => updateQuantity(service.value, -1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) => setQuantity(service.value, e.target.value)}
                          className="h-6 w-12 text-center p-0 border-0 focus-visible:ring-0"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-sm"
                          onClick={() => updateQuantity(service.value, 1)}
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Event Details */}
      {internalStep === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Event Details</h3>
            <p className="text-sm text-muted-foreground">Tell us more about the big day</p>
          </div>

          <div className="space-y-5">
             {/* Location Type */}
             <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location Type *
              </Label>
              <Select 
                value={formData.propertyType} 
                onValueChange={(value) => setFormData((prev: any) => ({ ...prev, propertyType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select venue type" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig?.propertyTypes?.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Specific Custom Fields */}
            {selectedEventType && selectedEventType.customFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedEventType.customFields.map((field) => (
                  <div key={field.name} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                    <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {field.label} {field.required && '*'}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                      <Textarea
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.name]: e.target.value }))}
                        className="bg-background min-h-[80px]"
                      />
                    ) : field.type === 'number' ? (
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.name]: e.target.value }))}
                        className="bg-background"
                      />
                    ) : field.type === 'date' ? (
                      <div className="relative">
                        <Input
                          type="date"
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.name]: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    ) : field.type === 'datetime-local' ? (
                      <div className="relative">
                        <Input
                          type="datetime-local"
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.name]: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    ) : (
                      <Input
                        type="text"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.name]: e.target.value }))}
                        className="bg-background"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-sm text-blue-700 border border-blue-100">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p>
                We'll match you with the best providers for your specific event type and requirements.
                You can review the full summary and add extras in the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t mt-4">
        {internalStep > 1 && (
          <Button 
            variant="outline" 
            onClick={prevStep}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        
        {internalStep < 3 ? (
          <Button 
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex-1"
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
           // This is just a visual indicator, the parent modal controls the actual "Next" 
           // but we show this to let user know they completed the form section
           <div className="flex-1 flex items-center justify-center text-sm text-green-600 font-medium animate-in fade-in">
             <Check className="w-4 h-4 mr-2" />
             Details Complete
           </div>
        )}
      </div>
    </div>
  );
}
