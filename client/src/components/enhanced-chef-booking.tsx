import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChefHat, Plus, Minus, Check, X } from "lucide-react";

interface EnhancedChefBookingProps {
  form: any;
  onNext: () => void;
  onBack: () => void;
}

const cuisineTypes = {
  "south-african": {
    name: "South African Traditional",
    description: "Authentic braai culture and traditional flavors",
    flavors: ["Smoky BBQ", "Spicy Peri-Peri", "Rich & Hearty", "Traditional Spices"],
    popularMenus: {
      "traditional-braai": {
        name: "Traditional Braai Feast",
        price: 4200,
        items: ["Boerewors", "Sosaties", "Pap & Gravy", "Chakalaka", "Roosterkoek", "Melktert"]
      },
      "heritage-dinner": {
        name: "Heritage Dinner",
        price: 3800,
        items: ["Bobotie", "Yellow Rice", "Bredie", "Samp & Beans", "Koeksisters", "Rooibos Tea"]
      },
      "modern-sa": {
        name: "Modern South African",
        price: 4500,
        items: ["Springbok Fillet", "Sweet Potato Mash", "Waterblommetjie Stew", "Biltong Salad", "Malva Pudding"]
      }
    },
    customOptions: ["Boerewors", "Sosaties", "Lamb Chops", "Chicken Braai", "Pap & Gravy", "Chakalaka", "Roosterkoek", "Melktert", "Koeksisters", "Biltong", "Droëwors"]
  },
  "nigerian": {
    name: "Nigerian Cuisine",
    description: "Rich flavors and aromatic spices from West Africa",
    flavors: ["Spicy & Bold", "Aromatic Herbs", "Palm Oil Rich", "Peppery Heat"],
    popularMenus: {
      "lagos-special": {
        name: "Lagos Special",
        price: 3900,
        items: ["Jollof Rice", "Suya", "Plantain", "Pepper Soup", "Chin Chin", "Palm Wine"]
      },
      "igbo-feast": {
        name: "Igbo Traditional Feast",
        price: 4100,
        items: ["Ofe Nsala", "Pounded Yam", "Ugba", "Stockfish", "Bitter Leaf Soup", "Kola Nut"]
      },
      "yoruba-delights": {
        name: "Yoruba Delights",
        price: 3700,
        items: ["Amala", "Ewedu", "Gbegiri", "Asun", "Puff Puff", "Zobo Drink"]
      }
    },
    customOptions: ["Jollof Rice", "Suya", "Plantain", "Pepper Soup", "Pounded Yam", "Egusi", "Okra Soup", "Fried Rice", "Chin Chin", "Meat Pie"]
  },
  "ethiopian": {
    name: "Ethiopian Dishes",
    description: "Ancient spice blends and communal dining traditions",
    flavors: ["Berbere Spiced", "Tangy Injera", "Complex Spices", "Coffee Culture"],
    popularMenus: {
      "addis-combo": {
        name: "Addis Ababa Combo",
        price: 3600,
        items: ["Doro Wat", "Injera", "Kitfo", "Shiro", "Tibs", "Ethiopian Coffee"]
      },
      "vegetarian-feast": {
        name: "Vegetarian Feast",
        price: 3200,
        items: ["Injera", "Misir Wat", "Gomen", "Shiro", "Atakilt Wat", "Honey Wine"]
      },
      "meat-lovers": {
        name: "Meat Lovers Platter",
        price: 4000,
        items: ["Kitfo", "Lamb Tibs", "Doro Wat", "Injera", "Ayib", "Tej (Honey Wine)"]
      }
    },
    customOptions: ["Doro Wat", "Injera", "Kitfo", "Shiro", "Tibs", "Gomen", "Misir Wat", "Atakilt Wat", "Ethiopian Coffee", "Tej"]
  },
  "moroccan": {
    name: "Moroccan Flavors",
    description: "Exotic tagines and aromatic mint tea culture",
    flavors: ["Aromatic Spices", "Sweet & Savory", "Mint Fresh", "Exotic Dried Fruits"],
    popularMenus: {
      "marrakech-night": {
        name: "Marrakech Night",
        price: 4300,
        items: ["Lamb Tagine", "Couscous", "Pastilla", "Harira Soup", "Baklava", "Mint Tea"]
      },
      "casablanca-classic": {
        name: "Casablanca Classic",
        price: 3800,
        items: ["Chicken Tagine", "Preserved Lemons", "Moroccan Salad", "Msemen", "Chebakia", "Mint Tea"]
      },
      "desert-feast": {
        name: "Desert Feast",
        price: 4100,
        items: ["Mechoui", "Saffron Rice", "Zaalouk", "Rghaif", "Ma'amoul", "Oud Wood Tea"]
      }
    },
    customOptions: ["Lamb Tagine", "Chicken Tagine", "Couscous", "Pastilla", "Harira", "Mechoui", "Preserved Lemons", "Baklava", "Chebakia", "Mint Tea"]
  }
};

export default function EnhancedChefBooking({ form, onNext, onBack }: EnhancedChefBookingProps) {
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [menuType, setMenuType] = useState<"popular" | "custom">("popular");
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const cuisineData = selectedCuisine ? cuisineTypes[selectedCuisine as keyof typeof cuisineTypes] : null;

  const handleFlavorToggle = (flavor: string) => {
    setSelectedFlavors(prev => 
      prev.includes(flavor) 
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    );
  };

  const handleCustomItemToggle = (item: string) => {
    setCustomItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleCuisineChange = (cuisine: string) => {
    setSelectedCuisine(cuisine);
    setSelectedMenu("");
    setCustomItems([]);
    setSelectedFlavors([]);
    form.setValue("cuisineType", cuisine);
    form.setValue("selectedMenu", "");
    form.setValue("customMenuItems", []);
  };

  const selectedMenuData = selectedMenu && cuisineData ? 
    cuisineData.popularMenus[selectedMenu as keyof typeof cuisineData.popularMenus] : null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Chef & Catering Experience</h3>
        <p className="text-gray-600">Choose your preferred cuisine and customize your perfect menu</p>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="eventType">Event Type</Label>
          <Select 
            value={form.watch("eventType")} 
            onValueChange={(value) => form.setValue("eventType", value)}
          >
            <SelectTrigger data-testid="select-event-type">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="birthday">Birthday Party</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="dinner-party">Dinner Party</SelectItem>
              <SelectItem value="family-gathering">Family Gathering</SelectItem>
              <SelectItem value="corporate">Corporate Event</SelectItem>
              <SelectItem value="holiday">Holiday Celebration</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="numberOfPeople">Number of People</Label>
          <Input 
            type="number"
            placeholder="e.g. 8"
            {...form.register("numberOfPeople")}
            data-testid="input-number-people"
          />
        </div>
      </div>

      {/* Cuisine Selection */}
      <div>
        <Label className="text-base font-medium">Select Your Cuisine Experience</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {Object.entries(cuisineTypes).map(([key, cuisine]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                selectedCuisine === key ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => handleCuisineChange(key)}
              data-testid={`cuisine-card-${key}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <ChefHat className={`h-6 w-6 ${selectedCuisine === key ? 'text-primary' : 'text-gray-400'}`} />
                  <h4 className="font-semibold">{cuisine.name}</h4>
                  {selectedCuisine === key && <Check className="h-5 w-5 text-primary ml-auto" />}
                </div>
                <p className="text-sm text-gray-600 mb-3">{cuisine.description}</p>
                <div className="flex flex-wrap gap-1">
                  {cuisine.flavors.slice(0, 2).map((flavor) => (
                    <Badge key={flavor} variant="secondary" className="text-xs">
                      {flavor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Flavor Selection */}
      {selectedCuisine && cuisineData && (
        <div>
          <Label className="text-base font-medium">Preferred Flavors & Style</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {cuisineData.flavors.map((flavor) => (
              <div 
                key={flavor}
                className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedFlavors.includes(flavor) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                }`}
                onClick={() => handleFlavorToggle(flavor)}
                data-testid={`flavor-option-${flavor.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Checkbox 
                  checked={selectedFlavors.includes(flavor)}
                  onChange={() => handleFlavorToggle(flavor)}
                />
                <span className="text-sm font-medium">{flavor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Selection */}
      {selectedCuisine && cuisineData && (
        <div>
          <Label className="text-base font-medium">Menu Options</Label>
          <div className="flex space-x-4 mt-3 mb-4">
            <Button
              type="button"
              variant={menuType === "popular" ? "default" : "outline"}
              onClick={() => setMenuType("popular")}
              className="flex-1"
              data-testid="menu-type-popular"
            >
              Popular Menus
            </Button>
            <Button
              type="button"
              variant={menuType === "custom" ? "default" : "outline"}
              onClick={() => setMenuType("custom")}
              className="flex-1"
              data-testid="menu-type-custom"
            >
              Custom Menu
            </Button>
          </div>

          {menuType === "popular" && (
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(cuisineData.popularMenus).map(([key, menu]) => (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md border-2 ${
                    selectedMenu === key ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedMenu(key);
                    form.setValue("selectedMenu", key);
                    form.setValue("menuType", "popular");
                  }}
                  data-testid={`menu-card-${key}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">{menu.name}</h4>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">R{menu.price}</div>
                        <div className="text-sm text-gray-500">for 8 people</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {menu.items.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                    {selectedMenu === key && (
                      <div className="mt-3 flex items-center text-primary">
                        <Check className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Selected Menu</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {menuType === "custom" && (
            <div>
              <p className="text-sm text-gray-600 mb-4">Select items to create your custom menu:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cuisineData.customOptions.map((item) => (
                  <div 
                    key={item}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      customItems.includes(item) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => handleCustomItemToggle(item)}
                    data-testid={`custom-item-${item.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="text-sm font-medium">{item}</span>
                    {customItems.includes(item) ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Plus className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
              {customItems.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected Items ({customItems.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {customItems.map((item) => (
                      <Badge key={item} variant="default" className="text-xs">
                        {item}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCustomItemToggle(item);
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Special Dietary Requirements */}
      <div>
        <Label htmlFor="dietaryRequirements">Special Dietary Requirements</Label>
        <Textarea 
          placeholder="Any allergies, dietary restrictions, or special requests..."
          {...form.register("dietaryRequirements")}
          data-testid="textarea-dietary-requirements"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          data-testid="button-back"
        >
          Back
        </Button>
        <Button 
          type="button" 
          onClick={() => {
            // Update form with selections
            form.setValue("selectedFlavors", selectedFlavors);
            if (menuType === "custom") {
              form.setValue("customMenuItems", customItems);
              form.setValue("menuType", "custom");
            }
            onNext();
          }}
          disabled={!selectedCuisine || (menuType === "popular" && !selectedMenu) || (menuType === "custom" && customItems.length === 0)}
          data-testid="button-next"
        >
          Continue to Provider Selection
        </Button>
      </div>
    </div>
  );
}