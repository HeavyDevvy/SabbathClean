import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface AuPairFormProps {
  config: ServiceConfig;
  formData: BookingFormData;
  updateFormData: (updates: Partial<BookingFormData>) => void;
}

export function AuPairForm({ config, formData, updateFormData }: AuPairFormProps) {
  const [internalStep, setInternalStep] = useState(1);
  const totalSteps = 5;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const nextStep = () => setInternalStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setInternalStep(prev => Math.max(prev - 1, 1));

  const canProceed = () => {
    if (internalStep === 1) return !!formData.careType;
    if (internalStep === 2) return !!formData.childrenCount;
    if (internalStep === 3) return !!formData.startDate && !!formData.daysPerWeek;
    if (internalStep === 4) return (formData.selectedDuties || []).length > 0;
    return true;
  };

  const stepTitles = ["Type", "Family", "Schedule", "Duties", "Details"];

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="flex items-center justify-between px-2 mb-6">
        {stepTitles.map((title, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className={`flex flex-col items-center ${internalStep >= i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 mb-1 transition-all ${
                internalStep > i + 1 ? 'border-primary bg-primary/10' : 
                internalStep === i + 1 ? 'border-primary bg-primary text-primary-foreground' : 
                'border-muted'
              }`}>
                {i + 1}
              </div>
              <span className="text-[10px] uppercase font-medium hidden md:block">{title}</span>
            </div>
            {i < totalSteps - 1 && (
              <div className={`hidden md:block absolute w-[10%] h-0.5 mt-4 ml-[10%] -z-10 ${
                internalStep > i + 1 ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Service Type Selection */}
      {internalStep === 1 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <div className="space-y-4">
            <Label className="text-lg font-medium">Select Au Pair Service Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.careTypes?.map((type) => (
                <div
                  key={type.value}
                  className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all hover:border-primary/50 ${
                    formData.careType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                  onClick={() => updateFormData({ careType: type.value })}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground">{type.label}</h3>
                    <span className="text-sm font-medium text-primary">
                      {type.price >= 1000 
                        ? `${formatCurrency(type.price)}/mo` 
                        : `${formatCurrency(type.price)}/hr`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                  {formData.careType === type.value && (
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Family & Children Information */}
      {internalStep === 2 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <div className="space-y-4">
            <Label>Number of Children</Label>
            <Select
              value={formData.childrenCount}
              onValueChange={(value) => updateFormData({ childrenCount: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of children" />
              </SelectTrigger>
              <SelectContent>
                {config.childrenCount?.map((count) => (
                  <SelectItem key={count.value} value={count.value}>
                    {count.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {parseInt(formData.childrenCount || "0") > 0 && (
            <div className="space-y-4">
              <Label>Ages of Children</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: parseInt(formData.childrenCount || "0") }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Child {index + 1} Age</Label>
                    <Select
                      value={formData.childAges?.[index] || ""}
                      onValueChange={(value) => {
                        const newAges = [...(formData.childAges || [])];
                        newAges[index] = value;
                        updateFormData({ childAges: newAges });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.childAgeGroups?.map((age) => (
                          <SelectItem key={age.value} value={age.value}>
                            {age.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label>Any Special Needs?</Label>
            <RadioGroup
              value={formData.hasSpecialNeeds ? "yes" : "no"}
              onValueChange={(value) => updateFormData({ hasSpecialNeeds: value === "yes" })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="special-no" />
                <Label htmlFor="special-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="special-yes" />
                <Label htmlFor="special-yes">Yes</Label>
              </div>
            </RadioGroup>
            
            {formData.hasSpecialNeeds && (
              <Textarea
                placeholder="Please describe any special needs or medical conditions..."
                value={formData.specialNeedsDescription || ""}
                onChange={(e) => updateFormData({ specialNeedsDescription: e.target.value })}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-4">
            <Label>Pets in Home?</Label>
            <Select
              value={formData.petType}
              onValueChange={(value) => updateFormData({ petType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pet situation" />
              </SelectTrigger>
              <SelectContent>
                {config.petTypes?.map((pet) => (
                  <SelectItem key={pet.value} value={pet.value}>
                    {pet.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.careType === "full-time-live-in" && (
            <div className="space-y-4">
              <Label>Accommodation Type</Label>
              <Select
                value={formData.accommodationType}
                onValueChange={(value) => updateFormData({ accommodationType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accommodation provided" />
                </SelectTrigger>
                <SelectContent>
                  {config.accommodationTypes?.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 3: Schedule Requirements */}
      {internalStep === 3 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-4">
              <Label>Contract Duration</Label>
              <Select
                value={formData.contractDuration}
                onValueChange={(value) => updateFormData({ contractDuration: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {config.contractDurations?.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Days per Week</Label>
              <Select
                value={formData.daysPerWeek}
                onValueChange={(value) => updateFormData({ daysPerWeek: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select days needed" />
                </SelectTrigger>
                <SelectContent>
                  {config.daysPerWeek?.map((days) => (
                    <SelectItem key={days.value} value={days.value}>
                      {days.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Hours per Day</Label>
              <Select
                value={formData.hoursPerDay}
                onValueChange={(value) => updateFormData({ hoursPerDay: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select daily hours" />
                </SelectTrigger>
                <SelectContent>
                  {config.hoursPerDay?.map((hours) => (
                    <SelectItem key={hours.value} value={hours.value}>
                      {hours.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Overnight Care Required?</Label>
            <RadioGroup
              value={formData.overnightCare || "never"}
              onValueChange={(value) => updateFormData({ overnightCare: value })}
              className="flex flex-wrap gap-4"
            >
              {["Never", "Occasionally", "Regularly", "Always"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.toLowerCase()} id={`overnight-${option}`} />
                  <Label htmlFor={`overnight-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Weekend Availability Needed?</Label>
            <RadioGroup
              value={formData.weekendAvailability || "no"}
              onValueChange={(value) => updateFormData({ weekendAvailability: value })}
              className="flex flex-wrap gap-4"
            >
              {["No", "Sometimes", "Every Weekend"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.toLowerCase().replace(" ", "-")} id={`weekend-${option}`} />
                  <Label htmlFor={`weekend-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </motion.div>
      )}

      {/* Step 4: Duties & Responsibilities */}
      {internalStep === 4 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <div className="space-y-4">
            <Label className="text-lg font-medium">Select Required Duties</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.dutiesList?.map((duty) => (
                <div key={duty.id} className="flex items-start space-x-3 border p-3 rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={duty.id}
                    checked={(formData.selectedDuties || []).includes(duty.id)}
                    onCheckedChange={(checked) => {
                      const current = formData.selectedDuties || [];
                      const updated = checked
                        ? [...current, duty.id]
                        : current.filter((id) => id !== duty.id);
                      updateFormData({ selectedDuties: updated });
                    }}
                  />
                  <Label htmlFor={duty.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer pt-0.5">
                    {duty.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label>Driving Required?</Label>
            <div className="flex items-center space-x-4">
               <RadioGroup
                value={formData.drivingRequired ? "yes" : "no"}
                onValueChange={(value) => updateFormData({ drivingRequired: value === "yes" })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="drive-no" />
                  <Label htmlFor="drive-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="drive-yes" />
                  <Label htmlFor="drive-yes">Yes (Valid license required)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 5: Preferences & Requirements */}
      {internalStep === 5 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Preferred Language</Label>
              <Select
                value={formData.preferredLanguage}
                onValueChange={(value) => updateFormData({ preferredLanguage: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {config.languages?.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Minimum Education Level</Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) => updateFormData({ educationLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education" />
                </SelectTrigger>
                <SelectContent>
                  {config.educationLevels?.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Minimum Experience Level</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) => updateFormData({ experienceLevel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                {config.experienceLevels?.map((exp) => (
                  <SelectItem key={exp.value} value={exp.value}>
                    {exp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Specific Skills Needed</Label>
            <Textarea
              placeholder="E.g., Swimming, First Aid, Special Needs Training..."
              value={formData.specificSkills || ""}
              onChange={(e) => updateFormData({ specificSkills: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>Daily Routine Expectations</Label>
            <Textarea
              placeholder="Briefly describe the typical daily schedule..."
              value={formData.dailyRoutine || ""}
              onChange={(e) => updateFormData({ dailyRoutine: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>House Rules & Guidelines</Label>
            <Textarea
              placeholder="Any specific house rules or guidelines..."
              value={formData.houseRules || ""}
              onChange={(e) => updateFormData({ houseRules: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>Dietary Restrictions/Preferences</Label>
            <Textarea
              placeholder="Any dietary requirements for the household..."
              value={formData.dietaryNotes || ""}
              onChange={(e) => updateFormData({ dietaryNotes: e.target.value })}
            />
          </div>
        </motion.div>
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
        
        {internalStep < totalSteps ? (
          <Button 
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex-1"
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
           <div className="flex-1 flex items-center justify-center text-sm text-green-600 font-medium animate-in fade-in">
             <Check className="w-4 h-4 mr-2" />
             Details Complete
           </div>
        )}
      </div>
    </div>
  );
}
