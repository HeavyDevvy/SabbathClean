import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Car, Home, Building2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface LocksmithServiceFormProps {
  formData: any;
  setFormData: (data: any) => void;
  currentConfig: any;
}

export default function LocksmithServiceForm({ 
  formData, 
  setFormData, 
  currentConfig 
}: LocksmithServiceFormProps) {
  
  const handleCategoryChange = (value: string) => {
    // Reset specific fields when category changes to prevent invalid state
    setFormData((prev: any) => ({
      ...prev,
      locksmithCategory: value,
      locksmithServiceType: "", // Reset service type
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      keyType: "",
      lockType: "",
      numberOfLocks: 0,
      businessType: "",
      numberOfDoors: 0,
      // Legacy fields reset for safety
      cleaningType: "", 
      propertySize: "", 
      gardenSize: "", 
      gardenCondition: "", 
      materials: "supply", 
      insurance: false, 
      electricalIssue: "", 
    }));
  };

  const getServiceTypes = () => {
    const category = formData.locksmithCategory || formData.serviceCategory;
    if (!category) return [];
    return currentConfig?.serviceTypes?.[category] || [];
  };

  const serviceTypes = getServiceTypes();
  const currentCategory = formData.locksmithCategory || formData.serviceCategory;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentConfig?.serviceCategories?.map((category: any) => {
          const isSelected = currentCategory === category.value;
          const Icon = category.value === 'automotive' ? Car :
                       category.value === 'residential' ? Home :
                       category.value === 'commercial' ? Building2 : AlertCircle;
          
          return (
            <Card 
              key={category.value}
              className={`cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md ${
                isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''
              }`}
              onClick={() => handleCategoryChange(category.value)}
            >
              <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
                <Icon className={`h-8 w-8 mb-2 ${isSelected ? 'text-primary' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                  {category.label}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentCategory && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Service Type Selection */}
          <div>
            <Label className="text-base mb-3 block">What do you need help with?</Label>
            <Select 
              value={formData.locksmithServiceType} 
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, locksmithServiceType: value }))}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select specific service" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type: any) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex justify-between items-center w-full min-w-[200px]">
                      <span>{type.label}</span>
                      <span className="font-semibold text-primary">R{type.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Automotive Specific Fields */}
          {currentCategory === 'automotive' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Make</Label>
                <Select 
                  value={formData.vehicleMake} 
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, vehicleMake: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Make" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentConfig?.vehicleMakes?.map((make: string) => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vehicle Model</Label>
                <Input 
                  placeholder="e.g. Corolla, Civic, X5" 
                  value={formData.vehicleModel || ""}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, vehicleModel: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select 
                  value={formData.vehicleYear} 
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, vehicleYear: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 26 }, (_, i) => (2025 - i).toString()).map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Key Type</Label>
                <Select 
                  value={formData.keyType} 
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, keyType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Key Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentConfig?.keyTypes?.map((type: any) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch 
                  id="ignition-check"
                  checked={formData.isKeyInIgnition}
                  onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, isKeyInIgnition: checked }))}
                />
                <Label htmlFor="ignition-check">Is the key broken in the ignition?</Label>
              </div>
            </div>
          )}

          {/* Residential Specific Fields */}
          {currentCategory === 'residential' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select 
                  value={formData.propertyType} 
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, propertyType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentConfig?.propertyTypes?.map((type: any) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lock Type</Label>
                <Select 
                  value={formData.lockType} 
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, lockType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Lock Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentConfig?.lockTypes?.map((type: any) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Locks</Label>
                <Select 
                  value={formData.numberOfLocks?.toString()} 
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, numberOfLocks: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num.toString()} value={num.toString()}>{num} Lock{num > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch 
                  id="rekey-all"
                  checked={formData.rekeyAll}
                  onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, rekeyAll: checked }))}
                />
                <Label htmlFor="rekey-all">Do you need all locks rekeyed?</Label>
              </div>
            </div>
          )}

          {/* Commercial Specific Fields */}
          {currentCategory === 'commercial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Select 
                  value={formData.businessType} 
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, businessType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentConfig?.businessTypes?.map((type: any) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Doors/Points</Label>
                <Input 
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={formData.numberOfDoors || ""}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, numberOfDoors: parseInt(e.target.value) }))}
                />
              </div>

              <div className="flex flex-col space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="access-control"
                    checked={formData.accessControl}
                    onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, accessControl: checked }))}
                  />
                  <Label htmlFor="access-control">Access control system needed?</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="master-key"
                    checked={formData.masterKey}
                    onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, masterKey: checked }))}
                  />
                  <Label htmlFor="master-key">Master key system required?</Label>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Specific Fields */}
          {currentCategory === 'emergency' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <h4 className="font-semibold">Emergency Priority</h4>
              </div>
              <p className="text-sm">
                Our nearest locksmith will be dispatched immediately. Typical response time is 20-45 minutes depending on traffic.
              </p>
              <div className="mt-4">
                 <Label className="text-red-900">Is anyone locked inside or in danger?</Label>
                 <RadioGroup 
                   value={formData.isDanger ? "yes" : "no"} 
                   onValueChange={(val) => setFormData((prev: any) => ({ ...prev, isDanger: val === "yes" }))}
                   className="flex space-x-4 mt-2"
                 >
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="yes" id="danger-yes" className="border-red-600 text-red-600" />
                     <Label htmlFor="danger-yes">Yes</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="no" id="danger-no" className="border-red-600 text-red-600" />
                     <Label htmlFor="danger-no">No</Label>
                   </div>
                 </RadioGroup>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}