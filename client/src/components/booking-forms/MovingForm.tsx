import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Truck, Package, Home, ArrowRight, MapPin, Layers, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MovingFormProps {
  formData: any;
  onUpdate: (updates: any) => void;
  recommendations?: {
    truckSize: string;
    movers: number;
    duration: string;
  } | null;
  totalPrice?: number;
}

export default function MovingForm({ formData, onUpdate, recommendations, totalPrice }: MovingFormProps) {
  const [step, setStep] = useState(1);

  const steps = [
    { id: 1, title: "Move Details", icon: Truck },
    { id: 2, title: "Locations", icon: MapPin },
    { id: 3, title: "Inventory", icon: Package },
    { id: 4, title: "Services", icon: Layers },
  ];

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleNestedUpdate = (parent: string, key: string, value: any) => {
    onUpdate({
      [parent]: {
        ...formData[parent],
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between px-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center flex-1">
            <div 
              className={`flex flex-col items-center cursor-pointer ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-all ${
                step === s.id ? 'border-primary bg-primary text-primary-foreground' : 
                step > s.id ? 'border-primary bg-primary/10 text-primary' : 
                'border-muted bg-background'
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden sm:block absolute w-[15%] h-0.5 mt-5 ml-[12%] -z-10 ${
                step > s.id ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Smart Recommendations Banner */}
      {recommendations && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 grid grid-cols-3 gap-4 text-center"
        >
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Truck Size</div>
            <div className="font-bold text-primary flex items-center justify-center gap-2 text-sm md:text-base">
              <Truck className="w-4 h-4" />
              {recommendations.truckSize}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Team</div>
            <div className="font-bold text-primary flex items-center justify-center gap-2 text-sm md:text-base">
              <Users className="w-4 h-4" />
              {recommendations.movers} Movers
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. Duration</div>
            <div className="font-bold text-primary flex items-center justify-center gap-2 text-sm md:text-base">
              <Clock className="w-4 h-4" />
              {recommendations.duration}
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 1: Move Details */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Type of Move</Label>
              <Select value={formData.moveType} onValueChange={(v) => updateField('moveType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select move type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.moveCategory} onValueChange={(v) => updateField('moveCategory', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio Apartment</SelectItem>
                  <SelectItem value="1bed">1 Bedroom</SelectItem>
                  <SelectItem value="2bed">2 Bedrooms</SelectItem>
                  <SelectItem value="3bed">3 Bedrooms</SelectItem>
                  <SelectItem value="4plus">4+ Bedrooms</SelectItem>
                  <SelectItem value="office_small">Small Office</SelectItem>
                  <SelectItem value="office_large">Large Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Move Date</Label>
              <Input 
                type="date" 
                value={formData.moveDate} 
                onChange={(e) => {
                  updateField('moveDate', e.target.value);
                  // Sync with main booking form preferredDate
                  onUpdate({ preferredDate: e.target.value });
                }} 
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Select 
                value={formData.preferredTime} 
                onValueChange={(v) => {
                  updateField('preferredTime', v);
                  // Sync with main booking form timePreference
                  // Map simplified time slots to specific hours for the main form
                  let time = "09:00";
                  if (v === "afternoon") time = "13:00";
                  if (v === "flexible") time = "09:00";
                  onUpdate({ timePreference: time });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isCompleteMove" 
              checked={formData.isCompleteMove}
              onCheckedChange={(c) => updateField('isCompleteMove', c)}
            />
            <Label htmlFor="isCompleteMove">This is a complete property move (all items)</Label>
          </div>
        </motion.div>
      )}

      {/* Step 2: Locations */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">A</div>
                Origin Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Street Address" 
                value={formData.originAddress} 
                onChange={(e) => updateField('originAddress', e.target.value)} 
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select value={formData.originPropertyType} onValueChange={(v) => updateField('originPropertyType', v)}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="storage">Storage Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input 
                    type="number" 
                    placeholder="0 = Ground" 
                    value={formData.originFloor} 
                    onChange={(e) => updateField('originFloor', e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.originElevator} 
                    onCheckedChange={(c) => updateField('originElevator', c)} 
                  />
                  <Label>Elevator</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.originStairs} 
                    onCheckedChange={(c) => updateField('originStairs', c)} 
                  />
                  <Label>Stairs Only</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">B</div>
                Destination Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Street Address" 
                value={formData.destAddress} 
                onChange={(e) => updateField('destAddress', e.target.value)} 
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select value={formData.destPropertyType} onValueChange={(v) => updateField('destPropertyType', v)}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="storage">Storage Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input 
                    type="number" 
                    placeholder="0 = Ground" 
                    value={formData.destFloor} 
                    onChange={(e) => updateField('destFloor', e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.destElevator} 
                    onCheckedChange={(c) => updateField('destElevator', c)} 
                  />
                  <Label>Elevator</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.destStairs} 
                    onCheckedChange={(c) => updateField('destStairs', c)} 
                  />
                  <Label>Stairs Only</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Inventory */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="space-y-4">
            <Label>Estimated Box Count</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Small</Label>
                <Input 
                  type="number" 
                  value={formData.boxCounts?.small || 0} 
                  onChange={(e) => handleNestedUpdate('boxCounts', 'small', parseInt(e.target.value) || 0)} 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Medium</Label>
                <Input 
                  type="number" 
                  value={formData.boxCounts?.medium || 0} 
                  onChange={(e) => handleNestedUpdate('boxCounts', 'medium', parseInt(e.target.value) || 0)} 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Large</Label>
                <Input 
                  type="number" 
                  value={formData.boxCounts?.large || 0} 
                  onChange={(e) => handleNestedUpdate('boxCounts', 'large', parseInt(e.target.value) || 0)} 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Wardrobe</Label>
                <Input 
                  type="number" 
                  value={formData.boxCounts?.wardrobe || 0} 
                  onChange={(e) => handleNestedUpdate('boxCounts', 'wardrobe', parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Large Appliances</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Fridge', 'Washing Machine', 'Dishwasher', 'Stove', 'Dryer', 'Freezer'].map(item => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox 
                    checked={(formData.appliances || []).includes(item)}
                    onCheckedChange={(checked) => {
                      const current = formData.appliances || [];
                      if (checked) {
                        updateField('appliances', [...current, item]);
                      } else {
                        updateField('appliances', current.filter((i: string) => i !== item));
                      }
                    }}
                  />
                  <Label>{item}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Special Items (Piano, Safe, Pool Table, etc.)</Label>
            <Textarea 
              placeholder="Describe any heavy, fragile or special items..."
              value={formData.specialInstructions}
              onChange={(e) => updateField('specialInstructions', e.target.value)}
            />
          </div>
        </motion.div>
      )}

      {/* Step 4: Services */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-medium">Additional Services</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`cursor-pointer transition-all ${formData.packingService ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => updateField('packingService', !formData.packingService)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox checked={formData.packingService} />
                  <div>
                    <h4 className="font-medium">Packing Service</h4>
                    <p className="text-xs text-muted-foreground">Professional packing of all your items</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${formData.unpackingService ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => updateField('unpackingService', !formData.unpackingService)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox checked={formData.unpackingService} />
                  <div>
                    <h4 className="font-medium">Unpacking Service</h4>
                    <p className="text-xs text-muted-foreground">Help settling into your new home</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${formData.assembly ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => updateField('assembly', !formData.assembly)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox checked={formData.assembly} />
                  <div>
                    <h4 className="font-medium">Furniture Assembly</h4>
                    <p className="text-xs text-muted-foreground">Disassembly and reassembly</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${formData.storageNeeded ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => updateField('storageNeeded', !formData.storageNeeded)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox checked={formData.storageNeeded} />
                  <div>
                    <h4 className="font-medium">Storage Needed</h4>
                    <p className="text-xs text-muted-foreground">Temporary or long-term storage</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {formData.storageNeeded && (
             <div className="space-y-2">
               <Label>Storage Duration</Label>
               <Select value={formData.storageDuration} onValueChange={(v) => updateField('storageDuration', v)}>
                 <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="short_term">Short Term (1-30 days)</SelectItem>
                   <SelectItem value="medium_term">Medium Term (1-6 months)</SelectItem>
                   <SelectItem value="long_term">Long Term (6+ months)</SelectItem>
                 </SelectContent>
               </Select>
             </div>
          )}

          <div className="space-y-2">
            <Label>Insurance Level</Label>
            <Select value={formData.insuranceLevel} onValueChange={(v) => updateField('insuranceLevel', v)}>
              <SelectTrigger><SelectValue placeholder="Select insurance coverage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Liability (Included)</SelectItem>
                <SelectItem value="standard">Standard Value Protection</SelectItem>
                <SelectItem value="premium">Full Value Protection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t mt-4">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
            Back
          </Button>
        )}
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} className="flex-1">
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-green-600 font-medium">
            <Layers className="w-4 h-4 mr-2" />
            Move Details Complete
          </div>
        )}
      </div>
    </div>
  );
}
