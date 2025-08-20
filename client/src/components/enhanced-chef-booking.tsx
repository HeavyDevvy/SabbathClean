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
  // African Cuisine - Featured First (South African)
  "south-african": {
    name: "South African",
    region: "African",
    description: "Authentic braai culture and traditional flavors",
    flavors: ["Smoky BBQ", "Spicy Peri-Peri", "Rich & Hearty", "Traditional Spices"],
    popularMenus: {
      "heritage-feast": {
        name: "Heritage Feast",
        price: 520,
        items: ["Bobotie", "Potjiekos", "Boerewors & Pap", "Malva Pudding"]
      },
      "braai-experience": {
        name: "Authentic Braai Experience",
        price: 580,
        items: ["Boerewors", "Lamb Chops", "Sosaties", "Roosterkoek", "Chakalaka"]
      },
      "cape-malay": {
        name: "Cape Malay Delights",
        price: 550,
        items: ["Cape Malay Curry", "Samoosas", "Koeksisters", "Milk Tart"]
      }
    },
    customOptions: ["Boerewors", "Sosaties", "Lamb Chops", "Chicken Braai", "Pap & Gravy", "Chakalaka", "Roosterkoek", "Melktert", "Koeksisters", "Biltong", "Droëwors"]
  },
  
  // Regional African Options
  "east-african": {
    name: "East African",
    region: "African Regional", 
    description: "Rich spices and traditional cooking methods",
    flavors: ["Berbere Spiced", "Tangy Injera", "Complex Spices", "Coffee Culture"],
    popularMenus: {
      "ethiopian-feast": {
        name: "Ethiopian Feast",
        price: 580,
        items: ["Doro Wat", "Kitfo", "Injera Bread", "Tibs", "Ethiopian Coffee"]
      },
      "kenyan-classics": {
        name: "Kenyan Classics",
        price: 520,
        items: ["Nyama Choma", "Ugali", "Sukuma Wiki", "Chapati", "Masala Chai"]
      }
    },
    customOptions: ["Doro Wat", "Injera", "Kitfo", "Shiro", "Tibs", "Ugali", "Nyama Choma", "Sukuma Wiki", "Ethiopian Coffee", "Chapati"]
  },
  
  "west-african": {
    name: "West African",
    region: "African Regional",
    description: "Bold flavors and aromatic spices from West Africa", 
    flavors: ["Spicy & Bold", "Aromatic Herbs", "Palm Oil Rich", "Peppery Heat"],
    popularMenus: {
      "nigerian-delights": {
        name: "Nigerian Delights",
        price: 560,
        items: ["Jollof Rice", "Suya", "Egusi Soup", "Pounded Yam", "Chin Chin"]
      },
      "ghanaian-feast": {
        name: "Ghanaian Feast", 
        price: 540,
        items: ["Banku & Tilapia", "Kelewele", "Waakye", "Red Red", "Bofrot"]
      }
    },
    customOptions: ["Jollof Rice", "Suya", "Plantain", "Pepper Soup", "Pounded Yam", "Egusi", "Banku", "Kelewele", "Waakye", "Chin Chin"]
  },

  // International Cuisines
  "italian": {
    name: "Italian",
    region: "European",
    description: "Traditional pasta, risotto, and authentic Italian flavors",
    flavors: ["Herb Infused", "Tomato Rich", "Olive Oil Based", "Wine Paired"],
    popularMenus: {
      "classic-italian": {
        name: "Classic Italian Feast",
        price: 650,
        items: ["Antipasto Platter", "Spaghetti Carbonara", "Chicken Parmigiana", "Tiramisu"]
      },
      "gourmet-italian": {
        name: "Gourmet Italian Experience",
        price: 850,
        items: ["Burrata with Truffle Oil", "Osso Buco", "Seafood Risotto", "Panna Cotta"]
      }
    },
    customOptions: ["Pasta", "Risotto", "Pizza", "Antipasto", "Tiramisu", "Panna Cotta", "Bruschetta", "Lasagna", "Minestrone", "Gelato"]
  },

  "asian": {
    name: "Asian Fusion",
    region: "Asian", 
    description: "Fresh herbs, spices and traditional cooking methods",
    flavors: ["Umami Rich", "Sweet & Sour", "Spicy Heat", "Fresh Herbs"],
    popularMenus: {
      "thai-delight": {
        name: "Thai Delight",
        price: 580,
        items: ["Thai Green Curry", "Pad Thai", "Tom Yum Soup", "Mango Sticky Rice"]
      },
      "japanese-zen": {
        name: "Japanese Zen",
        price: 720,
        items: ["Miso Soup", "Chicken Teriyaki", "Sushi Platter", "Mochi Ice Cream"]
      }
    },
    customOptions: ["Pad Thai", "Green Curry", "Sushi", "Teriyaki", "Tom Yum", "Fried Rice", "Spring Rolls", "Mango Sticky Rice", "Miso Soup", "Ramen"]
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

  // Calculate dynamic pricing
  const calculatePrice = () => {
    if (!selectedCuisine || !form.watch("numberOfPeople")) return 0;
    
    const numberOfPeople = parseInt(form.watch("numberOfPeople") || "1");
    let basePrice = 450; // Default base price
    
    if (menuType === "popular" && selectedMenuData) {
      basePrice = (selectedMenuData as any).price || 450;
    }
    
    return basePrice * numberOfPeople;
  };

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

      {/* Dynamic Pricing Display */}
      {selectedCuisine && form.watch("numberOfPeople") && (
        <div className="text-center bg-primary/5 rounded-lg p-4">
          <p className="text-2xl font-bold text-primary">R{calculatePrice()}</p>
          <p className="text-sm text-gray-600">Total estimate for {form.watch("numberOfPeople")} people</p>
        </div>
      )}

      {/* Cuisine Selection - Organized by International Standards */}
      <div>
        <Label className="text-base font-medium">Select Your Cuisine Experience</Label>
        <p className="text-sm text-gray-600 mb-3">Choose from African cuisines featuring South African specialties, regional African dishes, and international options</p>
        
        {/* African Cuisine Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <h5 className="text-sm font-semibold text-gray-600">🌍 African Cuisine</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* South African - Featured */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                selectedCuisine === "south-african" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => handleCuisineChange("south-african")}
              data-testid="cuisine-card-south-african"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <ChefHat className={`h-6 w-6 ${selectedCuisine === "south-african" ? 'text-primary' : 'text-gray-400'}`} />
                  <h4 className="font-semibold">South African</h4>
                  {selectedCuisine === "south-african" && <Check className="h-5 w-5 text-primary ml-auto" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">Authentic braai culture and traditional flavors</p>
                <div className="text-xs text-primary">Bobotie • Braai • Cape Malay</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Regional African Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <h5 className="text-sm font-semibold text-gray-600">🌍 Regional African</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                selectedCuisine === "east-african" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => handleCuisineChange("east-african")}
              data-testid="cuisine-card-east-african"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <ChefHat className={`h-6 w-6 ${selectedCuisine === "east-african" ? 'text-primary' : 'text-gray-400'}`} />
                  <h4 className="font-semibold">East African</h4>
                  {selectedCuisine === "east-african" && <Check className="h-5 w-5 text-primary ml-auto" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">Ethiopian, Kenyan traditional dishes</p>
                <div className="text-xs text-primary">Doro Wat • Injera • Nyama Choma</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                selectedCuisine === "west-african" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => handleCuisineChange("west-african")}
              data-testid="cuisine-card-west-african"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <ChefHat className={`h-6 w-6 ${selectedCuisine === "west-african" ? 'text-primary' : 'text-gray-400'}`} />
                  <h4 className="font-semibold">West African</h4>
                  {selectedCuisine === "west-african" && <Check className="h-5 w-5 text-primary ml-auto" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">Nigerian, Ghanaian bold flavors</p>
                <div className="text-xs text-primary">Jollof Rice • Suya • Kelewele</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* International Cuisines Section */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <h5 className="text-sm font-semibold text-gray-600">🌍 International</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                selectedCuisine === "italian" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => handleCuisineChange("italian")}
              data-testid="cuisine-card-italian"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <ChefHat className={`h-6 w-6 ${selectedCuisine === "italian" ? 'text-primary' : 'text-gray-400'}`} />
                  <h4 className="font-semibold">Italian</h4>
                  {selectedCuisine === "italian" && <Check className="h-5 w-5 text-primary ml-auto" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">Traditional pasta, risotto, and authentic flavors</p>
                <div className="text-xs text-primary">Pasta • Risotto • Tiramisu</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                selectedCuisine === "asian" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => handleCuisineChange("asian")}
              data-testid="cuisine-card-asian"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <ChefHat className={`h-6 w-6 ${selectedCuisine === "asian" ? 'text-primary' : 'text-gray-400'}`} />
                  <h4 className="font-semibold">Asian Fusion</h4>
                  {selectedCuisine === "asian" && <Check className="h-5 w-5 text-primary ml-auto" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">Fresh herbs, spices and traditional methods</p>
                <div className="text-xs text-primary">Pad Thai • Sushi • Teriyaki</div>
              </CardContent>
            </Card>
          </div>
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
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-semibold text-lg">{(menu as any).name}</h5>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(menu as any).items.map((item: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-primary">R{(menu as any).price}</p>
                        <p className="text-xs text-gray-500">per person</p>
                        {selectedMenu === key && <Check className="h-5 w-5 text-primary mt-1" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {menuType === "custom" && (
            <div className="space-y-4">
              <Label>Select items for your custom menu:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cuisineData.customOptions.map((item) => (
                  <div 
                    key={item}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      customItems.includes(item) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => handleCustomItemToggle(item)}
                    data-testid={`custom-item-${item.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Checkbox 
                      checked={customItems.includes(item)}
                      onChange={() => handleCustomItemToggle(item)}
                    />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              {customItems.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm mb-2">Selected items:</p>
                  <div className="flex flex-wrap gap-1">
                    {customItems.map((item) => (
                      <Badge key={item} variant="default" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Special Requests */}
      <div>
        <Label htmlFor="specialRequests">Special Requests or Dietary Requirements</Label>
        <Textarea 
          placeholder="Any special dietary requirements, allergies, or specific requests..."
          {...form.register("specialRequests")}
          data-testid="textarea-special-requests"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
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
            // Set form values based on selections
            form.setValue("selectedFlavors", selectedFlavors);
            form.setValue("menuType", menuType);
            form.setValue("customMenuItems", customItems);
            form.setValue("totalEstimate", calculatePrice());
            onNext();
          }}
          disabled={!selectedCuisine || (menuType === "popular" && !selectedMenu) || (menuType === "custom" && customItems.length === 0)}
          data-testid="button-next"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}