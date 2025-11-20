import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { ServiceConfig } from "@/config/service-configs";

interface ChefCateringFormProps {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
  currentConfig: Pick<ServiceConfig, 'cuisineTypes' | 'eventSizes' | 'dietaryRequirements'> | null;
}

export default function ChefCateringForm({ formData, setFormData, currentConfig }: ChefCateringFormProps) {
  return (
    <>
      <div>
        <Label>Cuisine Type *</Label>
        <Select value={formData.cuisineType} onValueChange={(value) =>
          setFormData(prev => ({ ...prev, cuisineType: value, selectedMenu: "", customMenuItems: [] }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Select cuisine type" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig?.cuisineTypes?.map((cuisine) => (
              <SelectItem key={cuisine.value} value={cuisine.value}>
                {cuisine.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Event Size *</Label>
        <Select value={formData.eventSize} onValueChange={(value) =>
          setFormData(prev => ({ ...prev, eventSize: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Select event size" />
          </SelectTrigger>
          <SelectContent>
            {currentConfig?.eventSizes?.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Dietary Requirements</Label>
        <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto">
          {currentConfig?.dietaryRequirements?.map((req) => (
            <div key={req.value} className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-gray-50">
              <Checkbox
                checked={formData.dietaryRequirements.includes(req.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData(prev => ({ 
                      ...prev, 
                      dietaryRequirements: [...prev.dietaryRequirements, req.value]
                    }));
                  } else {
                    setFormData(prev => ({ 
                      ...prev, 
                      dietaryRequirements: prev.dietaryRequirements.filter((r: string) => r !== req.value)
                    }));
                  }
                }}
              />
              <div className="flex-1">
                <label className="text-sm font-medium cursor-pointer">{req.label}</label>
                <p className="text-xs text-gray-500">{req.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {formData.cuisineType && (
        <div>
          <Label>Menu Selection *</Label>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.menuSelection === "popular" 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setFormData(prev => ({ ...prev, menuSelection: "popular", customMenuItems: [] }))}
              >
                <h4 className="font-semibold text-sm">Popular Menus</h4>
                <p className="text-xs text-gray-500">Pre-designed menu combinations</p>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.menuSelection === "custom" 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setFormData(prev => ({ ...prev, menuSelection: "custom", selectedMenu: "" }))}
              >
                <h4 className="font-semibold text-sm">Custom Menu</h4>
                <p className="text-xs text-gray-500">Build your own menu</p>
              </div>
            </div>

            {formData.menuSelection === "popular" && (
              <div>
                <Label>Choose Popular Menu *</Label>
                <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                  {currentConfig?.cuisineTypes
                    ?.find((c: any) => c.value === formData.cuisineType)
                    ?.popularMenus?.map((menu: any, i: number) => (
                    <div 
                      key={i}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.selectedMenu === menu.name
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, selectedMenu: menu.name }))}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm">{menu.name}</h5>
                          <p className="text-xs text-gray-600 mt-1">
                            {menu.items.join(", ")}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">R{menu.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.menuSelection === "custom" && (
              <div>
                <Label>Build Custom Menu *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                  {currentConfig?.cuisineTypes
                    ?.find((c: any) => c.value === formData.cuisineType)
                    ?.customItems?.map((item: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={formData.customMenuItems.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              customMenuItems: [...prev.customMenuItems, item]
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              customMenuItems: prev.customMenuItems.filter((i: string) => i !== item)
                            }));
                          }
                        }}
                      />
                      <label className="text-sm cursor-pointer flex-1">{item}</label>
                    </div>
                  ))}
                </div>
                {formData.customMenuItems.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h6 className="font-semibold text-sm text-blue-800">Selected Items:</h6>
                    <p className="text-xs text-blue-600 mt-1">
                      {formData.customMenuItems.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
