import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Sparkles, 
  Scissors, 
  Droplets, 
  Star,
  CheckCircle,
  CreditCard,
  Building,
  Zap,
  TreePine,
  ChefHat,
  Users,
  Wrench
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModernServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onBookingComplete: (bookingData: any) => void;
  editBookingData?: any; // For editing existing bookings
}

export default function ModernServiceModal({
  isOpen,
  onClose,
  serviceId,
  onBookingComplete,
  editBookingData
}: ModernServiceModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Core fields
    propertyType: editBookingData?.propertyType || "",
    address: editBookingData?.address || "",
    preferredDate: editBookingData?.preferredDate || "",
    timePreference: editBookingData?.timePreference || "",
    recurringSchedule: editBookingData?.recurringSchedule || "one-time",
    materials: editBookingData?.materials || "supply",
    insurance: editBookingData?.insurance || false,
    
    // Service-specific
    cleaningType: editBookingData?.cleaningType || "",
    propertySize: editBookingData?.propertySize || "",
    gardenSize: editBookingData?.gardenSize || "",
    gardenCondition: editBookingData?.gardenCondition || "",
    urgency: editBookingData?.urgency || "standard",
    
    // Chef & Catering specific
    cuisineType: editBookingData?.cuisineType || "",
    menuSelection: editBookingData?.menuSelection || "popular", // "popular" or "custom"
    selectedMenu: editBookingData?.selectedMenu || "",
    customMenuItems: editBookingData?.customMenuItems || [] as string[],
    dietaryRequirements: editBookingData?.dietaryRequirements || [] as string[],
    eventSize: editBookingData?.eventSize || "",
    
    // Selections
    selectedAddOns: editBookingData?.selectedAddOns || [] as string[],
    selectedProvider: editBookingData?.selectedProvider || null as any,
    
    // Payment information
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    bankAccount: "",
    bankBranch: ""
  });

  const [pricing, setPricing] = useState({
    basePrice: 0,
    addOnsPrice: 0,
    materialsDiscount: 0,
    recurringDiscount: 0,
    timeDiscount: 0,
    totalPrice: 0
  });

  const [providers] = useState([
    {
      id: 1,
      name: "Thabo Mthembu",
      rating: 4.9,
      reviews: 156,
      distance: 3.2,
      specializations: ["Deep Cleaning", "Move In/Out"],
      verified: true,
      responseTime: "< 2 hours"
    },
    {
      id: 2,
      name: "Nomsa Dlamini", 
      rating: 4.8,
      reviews: 203,
      distance: 5.7,
      specializations: ["Garden Design", "Lawn Care"],
      verified: true,
      responseTime: "< 1 hour"
    },
    {
      id: 3,
      name: "Sipho Ndlovu",
      rating: 4.7,
      reviews: 98,
      distance: 8.1,
      specializations: ["Emergency Plumbing"],
      verified: true,
      responseTime: "< 30 min"
    }
  ]);

  const serviceConfigs: any = {
    "cleaning": {
      title: "House Cleaning Service",
      icon: Sparkles,
      basePrice: 280,
      steps: 5,
      propertyTypes: [
        { value: "apartment", label: "Apartment", multiplier: 1.0 },
        { value: "house", label: "House", multiplier: 1.2 },
        { value: "townhouse", label: "Townhouse", multiplier: 1.1 },
        { value: "villa", label: "Villa", multiplier: 1.5 }
      ],
      cleaningTypes: [
        { value: "basic", label: "Basic Clean", price: 280 },
        { value: "deep-clean", label: "Deep Clean", price: 450 },
        { value: "move-clean", label: "Move In/Out", price: 680 }
      ],
      propertySizes: [
        { value: "small", label: "Small (1-2 bedrooms)", multiplier: 1.0 },
        { value: "medium", label: "Medium (3-4 bedrooms)", multiplier: 1.3 },
        { value: "large", label: "Large (5+ bedrooms)", multiplier: 1.6 }
      ],
      addOns: [
        { id: "inside-oven", name: "Inside Oven Cleaning", price: 150 },
        { id: "inside-fridge", name: "Inside Fridge Cleaning", price: 100 },
        { id: "windows", name: "Window Cleaning", price: 80 },
        { id: "carpet-clean", name: "Carpet Deep Clean", price: 200 }
      ]
    },
    "garden-care": {
      title: "Garden Care Service",
      icon: Scissors,
      basePrice: 320,
      steps: 5,
      propertyTypes: [
        { value: "apartment", label: "Apartment Balcony", multiplier: 0.7 },
        { value: "house", label: "House Garden", multiplier: 1.0 },
        { value: "townhouse", label: "Townhouse Garden", multiplier: 0.9 },
        { value: "villa", label: "Villa Estate", multiplier: 1.4 }
      ],
      gardenSizes: [
        { value: "small", label: "Small (0-100m²)", multiplier: 1.0 },
        { value: "medium", label: "Medium (100-300m²)", multiplier: 1.3 },
        { value: "large", label: "Large (300-500m²)", multiplier: 1.6 },
        { value: "estate", label: "Estate (500m²+)", multiplier: 2.0 }
      ],
      gardenConditions: [
        { value: "well-maintained", label: "Well Maintained", multiplier: 1.0 },
        { value: "needs-attention", label: "Needs Attention", multiplier: 1.2 },
        { value: "overgrown", label: "Overgrown", multiplier: 1.5 },
        { value: "neglected", label: "Severely Neglected", multiplier: 1.8 }
      ],
      addOns: [
        { id: "lawn-care", name: "Lawn Mowing & Edging", price: 150 },
        { id: "pruning", name: "Tree & Shrub Pruning", price: 200 },
        { id: "weeding", name: "Weeding & Cleanup", price: 120 },
        { id: "seasonal-prep", name: "Seasonal Preparation", price: 100 }
      ]
    },
    "plumbing": {
      title: "Plumbing Service",
      icon: Droplets,
      basePrice: 380,
      steps: 5,
      propertyTypes: [
        { value: "apartment", label: "Apartment", multiplier: 1.0 },
        { value: "house", label: "House", multiplier: 1.1 },
        { value: "townhouse", label: "Townhouse", multiplier: 1.05 },
        { value: "villa", label: "Villa", multiplier: 1.3 }
      ],
      urgencyLevels: [
        { value: "emergency", label: "Emergency (24/7)", multiplier: 2.0 },
        { value: "urgent", label: "Urgent (Same Day)", multiplier: 1.5 },
        { value: "standard", label: "Standard (Next Day)", multiplier: 1.0 },
        { value: "scheduled", label: "Scheduled (Flexible)", multiplier: 0.9 }
      ],
      addOns: [
        { id: "pipe-repair", name: "Pipe Repair", price: 200 },
        { id: "faucet-install", name: "Faucet Installation", price: 150 },
        { id: "toilet-repair", name: "Toilet Repair", price: 180 },
        { id: "water-heater", name: "Water Heater Service", price: 400 }
      ]
    },
    "electrical": {
      title: "Electrical Service",
      icon: Zap,
      basePrice: 450,
      steps: 5,
      propertyTypes: [
        { value: "apartment", label: "Apartment", multiplier: 1.0 },
        { value: "house", label: "House", multiplier: 1.2 },
        { value: "townhouse", label: "Townhouse", multiplier: 1.1 },
        { value: "villa", label: "Villa", multiplier: 1.4 }
      ],
      urgencyLevels: [
        { value: "emergency", label: "Emergency (24/7)", multiplier: 2.5 },
        { value: "urgent", label: "Urgent (Same Day)", multiplier: 1.8 },
        { value: "standard", label: "Standard (Next Day)", multiplier: 1.0 },
        { value: "scheduled", label: "Scheduled (Flexible)", multiplier: 0.9 }
      ],
      addOns: [
        { id: "outlet-install", name: "Outlet Installation", price: 180 },
        { id: "light-fixture", name: "Light Fixture Installation", price: 220 },
        { id: "ceiling-fan", name: "Ceiling Fan Installation", price: 350 },
        { id: "electrical-panel", name: "Electrical Panel Service", price: 800 }
      ]
    },
    "garden-maintenance": {
      title: "Garden Maintenance Service",
      icon: TreePine,
      basePrice: 320,
      steps: 5,
      propertyTypes: [
        { value: "apartment", label: "Apartment Balcony", multiplier: 0.7 },
        { value: "house", label: "House Garden", multiplier: 1.0 },
        { value: "townhouse", label: "Townhouse Garden", multiplier: 0.9 },
        { value: "villa", label: "Villa Estate", multiplier: 1.4 }
      ],
      gardenSizes: [
        { value: "small", label: "Small (0-100m²)", multiplier: 1.0 },
        { value: "medium", label: "Medium (100-300m²)", multiplier: 1.3 },
        { value: "large", label: "Large (300-500m²)", multiplier: 1.6 },
        { value: "estate", label: "Estate (500m²+)", multiplier: 2.0 }
      ],
      gardenConditions: [
        { value: "well-maintained", label: "Well Maintained", multiplier: 1.0 },
        { value: "needs-attention", label: "Needs Attention", multiplier: 1.2 },
        { value: "overgrown", label: "Overgrown", multiplier: 1.5 },
        { value: "neglected", label: "Severely Neglected", multiplier: 1.8 }
      ],
      addOns: [
        { id: "lawn-care", name: "Lawn Mowing & Edging", price: 150 },
        { id: "pruning", name: "Tree & Shrub Pruning", price: 200 },
        { id: "weeding", name: "Weeding & Cleanup", price: 120 },
        { id: "seasonal-prep", name: "Seasonal Preparation", price: 100 }
      ]
    },
    "chef-catering": {
      title: "Chef & Catering Service",
      icon: ChefHat,
      basePrice: 850,
      steps: 5,
      propertyTypes: [
        { value: "apartment", label: "Apartment/Small Kitchen", multiplier: 1.0 },
        { value: "house", label: "House Kitchen", multiplier: 1.1 },
        { value: "townhouse", label: "Townhouse Kitchen", multiplier: 1.05 },
        { value: "villa", label: "Villa/Large Kitchen", multiplier: 1.3 }
      ],
      cuisineTypes: [
        { 
          value: "south-african", 
          label: "🇿🇦 South African Traditional", 
          multiplier: 1.0,
          popularMenus: [
            { name: "Traditional Braai", items: ["Boerewors", "Lamb Chops", "Chicken", "Pap & Morogo", "Chakalaka", "Potato Salad"], price: 850 },
            { name: "Heritage Feast", items: ["Bobotie", "Yellow Rice", "Green Beans", "Sambals", "Milk Tart"], price: 920 },
            { name: "Potjiekos Experience", items: ["Traditional Potjie", "Steamed Bread", "Roasted Vegetables", "Koeksisters"], price: 780 }
          ],
          customItems: ["Boerewors", "Sosaties", "Bobotie", "Potjiekos", "Biltong", "Droëwors", "Koeksisters", "Milk Tart", "Malva Pudding", "Pap & Morogo", "Chakalaka", "Roosterkoek"]
        },
        { 
          value: "west-african", 
          label: "🌍 West African", 
          multiplier: 1.1,
          popularMenus: [
            { name: "Nigerian Feast", items: ["Jollof Rice", "Suya", "Plantain", "Pepper Soup", "Chin Chin"], price: 950 },
            { name: "Ghanaian Special", items: ["Banku", "Tilapia", "Kelewele", "Groundnut Soup", "Fufu"], price: 920 },
            { name: "Senegalese Delight", items: ["Thieboudienne", "Yassa Chicken", "Bissap Drink", "Pastels"], price: 890 }
          ],
          customItems: ["Jollof Rice", "Fufu", "Banku", "Suya", "Kelewele", "Plantain", "Yassa", "Thieboudienne", "Bissap", "Chin Chin", "Pepper Soup", "Palm Nut Soup"]
        },
        { 
          value: "east-african", 
          label: "🌍 East African", 
          multiplier: 1.1,
          popularMenus: [
            { name: "Ethiopian Experience", items: ["Injera", "Doro Wat", "Kitfo", "Vegetarian Combo", "Ethiopian Coffee"], price: 940 },
            { name: "Kenyan Safari", items: ["Nyama Choma", "Ugali", "Sukuma Wiki", "Pilau Rice", "Mandazi"], price: 880 },
            { name: "Tanzanian Taste", items: ["Pilau", "Mishkaki", "Chapati", "Coconut Rice", "Urojo Soup"], price: 910 }
          ],
          customItems: ["Injera", "Doro Wat", "Kitfo", "Ugali", "Nyama Choma", "Sukuma Wiki", "Pilau", "Mishkaki", "Chapati", "Mandazi", "Coconut Rice", "Ethiopian Coffee"]
        },
        { 
          value: "north-african", 
          label: "🌍 North African", 
          multiplier: 1.2,
          popularMenus: [
            { name: "Moroccan Royal", items: ["Tagine", "Couscous", "Pastilla", "Harira Soup", "Mint Tea", "Baklava"], price: 1050 },
            { name: "Egyptian Pharaoh", items: ["Koshari", "Molokhia", "Fattah", "Basbousa", "Hibiscus Juice"], price: 980 },
            { name: "Tunisian Treasure", items: ["Couscous Tunisien", "Brik", "Harissa Chicken", "Makroudh"], price: 920 }
          ],
          customItems: ["Tagine", "Couscous", "Pastilla", "Harira", "Koshari", "Molokhia", "Brik", "Harissa", "Mint Tea", "Baklava", "Makroudh", "Basbousa"]
        },
        { 
          value: "central-african", 
          label: "🌍 Central African", 
          multiplier: 1.15,
          popularMenus: [
            { name: "Congolese Celebration", items: ["Fufu", "Ndolé", "Grilled Fish", "Plantain", "Palm Wine"], price: 890 },
            { name: "Cameroonian Combo", items: ["Jollof Rice", "Pepper Soup", "Banga Soup", "Puff Puff"], price: 860 }
          ],
          customItems: ["Fufu", "Ndolé", "Banga Soup", "Pepper Soup", "Cassava", "Plantain", "Palm Wine", "Puff Puff", "Grilled Fish"]
        }
      ],
      dietaryRequirements: [
        { value: "halaal", label: "🕌 Halaal Certified", description: "Strictly Halaal ingredients and preparation" },
        { value: "kosher", label: "✡️ Kosher Certified", description: "Kosher ingredients and supervision" },
        { value: "vegan", label: "🌱 Vegan", description: "Plant-based ingredients only" },
        { value: "vegetarian", label: "🥬 Vegetarian", description: "No meat, fish allowed" },
        { value: "gluten-free", label: "🌾 Gluten-Free", description: "No wheat, barley, rye products" },
        { value: "keto", label: "🥑 Keto-Friendly", description: "Low-carb, high-fat diet" },
        { value: "diabetic", label: "🩺 Diabetic-Friendly", description: "Low sugar, controlled carbs" },
        { value: "nut-free", label: "🥜 Nut-Free", description: "No tree nuts or peanuts" },
        { value: "dairy-free", label: "🥛 Dairy-Free", description: "No milk products" }
      ],
      eventSizes: [
        { value: "intimate", label: "Intimate Dining (2-8 people)", multiplier: 1.0 },
        { value: "small", label: "Small Gathering (9-15 people)", multiplier: 1.5 },
        { value: "medium", label: "Medium Event (16-30 people)", multiplier: 2.2 },
        { value: "large", label: "Large Celebration (31-50 people)", multiplier: 3.5 },
        { value: "corporate", label: "Corporate Event (50+ people)", multiplier: 5.0 }
      ],
      addOns: [
        { id: "premium-ingredients", name: "🥩 Premium Ingredient Sourcing", price: 200, description: "Organic, free-range, premium quality ingredients" },
        { id: "full-service", name: "👥 Full Service Experience", price: 400, description: "Professional waitering, bartending, setup & cleanup" },
        { id: "dietary-specialist", name: "🥗 Dietary Specialist Chef", price: 250, description: "Specialized chef for dietary requirements" },
        { id: "cooking-demo", name: "👨‍🍳 Live Cooking Demonstration", price: 300, description: "Interactive cooking experience with guests" },
        { id: "recipe-cards", name: "📝 Custom Recipe Cards", price: 150, description: "Take-home recipe cards for prepared dishes" },
        { id: "wine-pairing", name: "🍷 Wine & Beverage Pairing", price: 350, description: "Professional sommelier and beverage selection" },
        { id: "traditional-setup", name: "🎭 Traditional Cultural Setup", price: 280, description: "Authentic cultural decorations and presentation" }
      ]
    },
    "event-staff": {
      title: "Event Staffing Service",
      icon: Users,
      basePrice: 180,
      steps: 5,
      propertyTypes: [
        { value: "apartment", label: "Apartment/Small Space", multiplier: 0.8 },
        { value: "house", label: "House Event", multiplier: 1.0 },
        { value: "townhouse", label: "Townhouse Event", multiplier: 0.9 },
        { value: "villa", label: "Villa/Large Event", multiplier: 1.4 }
      ],
      staffTypes: [
        { value: "waiters", label: "Professional Waiters", price: 180 },
        { value: "bartenders", label: "Bartenders", price: 220 },
        { value: "security", label: "Event Security", price: 300 },
        { value: "coordinators", label: "Event Coordinators", price: 400 }
      ],
      eventSizes: [
        { value: "small", label: "Small (10-25 guests)", multiplier: 1.0 },
        { value: "medium", label: "Medium (26-50 guests)", multiplier: 1.5 },
        { value: "large", label: "Large (51-100 guests)", multiplier: 2.5 },
        { value: "corporate", label: "Corporate (100+ guests)", multiplier: 4.0 }
      ],
      addOns: [
        { id: "uniform-rental", name: "Professional Uniform Rental", price: 50 },
        { id: "overtime-coverage", name: "Overtime Coverage", price: 120 },
        { id: "event-setup", name: "Event Setup Assistance", price: 200 },
        { id: "cleanup-service", name: "Post-Event Cleanup", price: 250 }
      ]
    },
    "handyman": {
      title: "Handyman Service",
      icon: Wrench,
      basePrice: 350,
      steps: 5,
      propertyTypes: [
        { value: "apartment", label: "Apartment", multiplier: 1.0 },
        { value: "house", label: "House", multiplier: 1.2 },
        { value: "townhouse", label: "Townhouse", multiplier: 1.1 },
        { value: "villa", label: "Villa", multiplier: 1.4 }
      ],
      serviceTypes: [
        { value: "general-repairs", label: "General Repairs", multiplier: 1.0 },
        { value: "furniture-assembly", label: "Furniture Assembly", multiplier: 0.8 },
        { value: "wall-mounting", label: "Wall Mounting & Hanging", multiplier: 0.9 },
        { value: "home-maintenance", label: "Home Maintenance", multiplier: 1.2 }
      ],
      urgencyLevels: [
        { value: "emergency", label: "Emergency (Same Day)", multiplier: 2.0 },
        { value: "urgent", label: "Urgent (Next Day)", multiplier: 1.5 },
        { value: "standard", label: "Standard (2-3 Days)", multiplier: 1.0 },
        { value: "scheduled", label: "Scheduled (Flexible)", multiplier: 0.9 }
      ],
      addOns: [
        { id: "materials-supply", name: "Materials & Hardware Supply", price: 150 },
        { id: "painting-touchup", name: "Painting Touch-up", price: 200 },
        { id: "minor-plumbing", name: "Minor Plumbing Fixes", price: 180 },
        { id: "electrical-minor", name: "Minor Electrical Work", price: 220 }
      ]
    },
    "beauty-wellness": {
      title: "Beauty & Wellness Service",
      icon: Scissors,
      basePrice: 280,
      steps: 5,
      propertyTypes: [
        { value: "apartment", label: "Apartment Visit", multiplier: 1.0 },
        { value: "house", label: "House Visit", multiplier: 1.1 },
        { value: "townhouse", label: "Townhouse Visit", multiplier: 1.05 },
        { value: "villa", label: "Villa Visit", multiplier: 1.2 }
      ],
      serviceTypes: [
        { value: "hair-styling", label: "Hair Styling & Cut", price: 280 },
        { value: "manicure-pedicure", label: "Manicure & Pedicure", price: 220 },
        { value: "massage-therapy", label: "Massage Therapy", price: 400 },
        { value: "makeup-artistry", label: "Makeup Artistry", price: 350 }
      ],
      sessionDuration: [
        { value: "quick", label: "Quick Session (30-60 min)", multiplier: 1.0 },
        { value: "standard", label: "Standard Session (1-2 hours)", multiplier: 1.5 },
        { value: "extended", label: "Extended Session (2-3 hours)", multiplier: 2.2 },
        { value: "full-day", label: "Full Day Package", multiplier: 4.0 }
      ],
      addOns: [
        { id: "premium-products", name: "Premium Product Upgrade", price: 150 },
        { id: "group-discount", name: "Group Service (2+ people)", price: -50 },
        { id: "travel-kit", name: "Professional Travel Kit", price: 100 },
        { id: "follow-up-care", name: "Follow-up Care Package", price: 80 }
      ]
    }
  };

  const currentConfig = serviceConfigs[serviceId] || serviceConfigs["cleaning"];

  // Calculate pricing whenever form data changes
  useEffect(() => {
    const config = serviceConfigs[serviceId] || serviceConfigs["cleaning"];
    let basePrice = config.basePrice;
    
    // Property type multiplier
    const propertyType = config.propertyTypes?.find((p: any) => p.value === formData.propertyType);
    if (propertyType) {
      basePrice *= propertyType.multiplier;
    }

    // Service-specific multipliers
    if (serviceId === "cleaning") {
      const cleaningType = config.cleaningTypes?.find((t: any) => t.value === formData.cleaningType);
      if (cleaningType) basePrice = cleaningType.price;
      
      const propertySize = config.propertySizes?.find((s: any) => s.value === formData.propertySize);
      if (propertySize) basePrice *= propertySize.multiplier;
    }

    if (serviceId === "garden-care" || serviceId === "garden-maintenance") {
      const gardenSize = config.gardenSizes?.find((s: any) => s.value === formData.gardenSize);
      if (gardenSize) basePrice *= gardenSize.multiplier;
      
      const condition = config.gardenConditions?.find((c: any) => c.value === formData.gardenCondition);
      if (condition) basePrice *= condition.multiplier;
    }

    if (serviceId === "plumbing" || serviceId === "electrical" || serviceId === "handyman") {
      const urgency = config.urgencyLevels?.find((u: any) => u.value === formData.urgency);
      if (urgency) basePrice *= urgency.multiplier;
    }

    if (serviceId === "chef-catering") {
      // Handle menu selection pricing
      if (formData.menuSelection === "popular" && formData.selectedMenu && formData.cuisineType) {
        const selectedCuisine = config.cuisineTypes?.find((c: any) => c.value === formData.cuisineType);
        const selectedMenuData = selectedCuisine?.popularMenus?.find((m: any) => m.name === formData.selectedMenu);
        if (selectedMenuData) {
          basePrice = selectedMenuData.price;
        }
      } else {
        // Apply cuisine type multiplier for custom menu or when no popular menu selected
        const cuisineType = config.cuisineTypes?.find((c: any) => c.value === formData.cuisineType);
        if (cuisineType) basePrice *= cuisineType.multiplier;
      }
      
      // Apply event size multiplier
      const eventSize = config.eventSizes?.find((s: any) => s.value === formData.eventSize);
      if (eventSize) basePrice *= eventSize.multiplier;
      
      // Additional pricing for custom menu items (base price per item for custom menus)
      if (formData.menuSelection === "custom" && formData.customMenuItems.length > 0) {
        basePrice += formData.customMenuItems.length * 45; // R45 per custom menu item
      }
    }

    if (serviceId === "event-staff") {
      const staffType = config.staffTypes?.find((s: any) => s.value === formData.cleaningType);
      if (staffType) basePrice = staffType.price;
      
      const eventSize = config.eventSizes?.find((s: any) => s.value === formData.propertySize);
      if (eventSize) basePrice *= eventSize.multiplier;
    }

    if (serviceId === "handyman") {
      const serviceType = config.serviceTypes?.find((s: any) => s.value === formData.cleaningType);
      if (serviceType) basePrice *= serviceType.multiplier;
    }

    if (serviceId === "beauty-wellness") {
      const serviceType = config.serviceTypes?.find((s: any) => s.value === formData.cleaningType);
      if (serviceType) basePrice = serviceType.price;
      
      const duration = config.sessionDuration?.find((d: any) => d.value === formData.propertySize);
      if (duration) basePrice *= duration.multiplier;
    }

    // Add-ons pricing
    const addOnsPrice = config.addOns
      ?.filter((addon: any) => formData.selectedAddOns.includes(addon.id))
      ?.reduce((sum: number, addon: any) => sum + addon.price, 0) || 0;

    // Enhanced discount calculations
    let materialsDiscount = 0;
    let recurringDiscount = 0;
    let timeDiscount = 0;

    // Materials discount (15% if customer provides materials)
    if (formData.materials === "bring") {
      materialsDiscount = Math.round((basePrice + addOnsPrice) * 0.15);
    }

    // Recurring service discounts
    if (formData.recurringSchedule === "weekly") {
      recurringDiscount = Math.round((basePrice + addOnsPrice) * 0.15);
    } else if (formData.recurringSchedule === "bi-weekly") {
      recurringDiscount = Math.round((basePrice + addOnsPrice) * 0.10);
    } else if (formData.recurringSchedule === "monthly") {
      recurringDiscount = Math.round((basePrice + addOnsPrice) * 0.08);
    }

    // Early bird discount (6 AM slots get 10% off)
    if (formData.timePreference === "06:00") {
      timeDiscount = Math.round((basePrice + addOnsPrice) * 0.10);
    }

    const totalPrice = Math.max(0, basePrice + addOnsPrice - materialsDiscount - recurringDiscount - timeDiscount);

    setPricing({
      basePrice: Math.round(basePrice),
      addOnsPrice,
      materialsDiscount,
      recurringDiscount,
      timeDiscount,
      totalPrice: Math.round(totalPrice)
    });
  }, [formData, serviceId]);

  const handleAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, address }));
  };



  const handleNext = () => {
    if (step < currentConfig.steps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBookingConfirm = () => {
    // Create enhanced booking data with all necessary details
    const bookingData = {
      serviceId,
      serviceName: currentConfig.title,
      ...formData,
      pricing,
      totalCost: pricing.totalPrice,
      commission: Math.round(pricing.totalPrice * 0.15), // 15% platform commission
      timestamp: new Date().toISOString(),
      
      // Enhanced provider data with contact info and bio
      selectedProvider: formData.selectedProvider ? {
        ...formData.selectedProvider,
        phone: "+27 11 456 7890", // Will be shared closer to service date
        email: "contact@berryevents.com", // Contact through Berry Events
        bio: `Professional service provider with ${formData.selectedProvider.reviews || 100}+ successful bookings. Specializes in ${formData.selectedProvider.specializations?.join(', ') || 'quality service delivery'}.`,
        experience: `${Math.floor(formData.selectedProvider.reviews / 50)} years experience`,
        profileImage: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`
      } : null
    };

    console.log("Processing booking:", bookingData);
    
    toast({
      title: "Booking Confirmed!",
      description: `${currentConfig.title} booked for ${formData.preferredDate} at ${formData.timePreference}`,
      duration: 3000,
    });
    
    // Close modal and trigger confirmation
    onClose();
    setTimeout(() => {
      onBookingComplete(bookingData);
    }, 300);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <currentConfig.icon className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Service Details</h3>
        <p className="text-gray-600 text-sm">Tell us about your property and needs</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="property-type">Property Type *</Label>
          <Select value={formData.propertyType} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, propertyType: value }))
          }>
            <SelectTrigger data-testid="select-property-type">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {currentConfig.propertyTypes?.map((type: any) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="address">Service Address *</Label>
          <div className="space-y-3">
            <Input
              id="address"
              placeholder="Enter your service address"
              value={formData.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="w-full"
              data-testid="input-address"
            />
            {formData.address && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Address confirmed - Provider matching within 20km radius
                </p>
              </div>
            )}
          </div>
        </div>

        {serviceId === "cleaning" && (
          <>
            <div>
              <Label htmlFor="cleaning-type">Cleaning Type *</Label>
              <Select value={formData.cleaningType} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, cleaningType: value }))
              }>
                <SelectTrigger data-testid="select-cleaning-type">
                  <SelectValue placeholder="Select cleaning type" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.cleaningTypes?.map((type: any) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - R{type.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="property-size">Property Size *</Label>
              <Select value={formData.propertySize} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, propertySize: value }))
              }>
                <SelectTrigger data-testid="select-property-size">
                  <SelectValue placeholder="Select property size" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.propertySizes?.map((size: any) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {serviceId === "garden-care" && (
          <>
            <div>
              <Label>Garden Size Range *</Label>
              <Select value={formData.gardenSize} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, gardenSize: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select garden size" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.gardenSizes?.map((size: any) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Garden Condition *</Label>
              <Select value={formData.gardenCondition} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, gardenCondition: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select garden condition" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.gardenConditions?.map((condition: any) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {serviceId === "plumbing" && (
          <div>
            <Label>Service Type *</Label>
            <Select value={formData.urgency} onValueChange={(value) =>
              setFormData(prev => ({ ...prev, urgency: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select service urgency" />
              </SelectTrigger>
              <SelectContent>
                {currentConfig.urgencyLevels?.map((level: any) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {serviceId === "chef-catering" && (
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
                  {currentConfig.cuisineTypes?.map((cuisine: any) => (
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
                  {currentConfig.eventSizes?.map((size: any) => (
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
                {currentConfig.dietaryRequirements?.map((req: any) => (
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
                        {currentConfig.cuisineTypes
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
                        {currentConfig.cuisineTypes
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
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CalendarIcon className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Schedule & Preferences</h3>
        <p className="text-gray-600 text-sm">Choose your preferred date and time</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Preferred Date *</Label>
          <Input
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className="w-full"
          />
        </div>

        <div>
          <Label>Modern Time Preference Selection *</Label>
          <Select value={formData.timePreference} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, timePreference: value }))
          }>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose your preferred time slot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="08:00">08:00 - Morning</SelectItem>
              <SelectItem value="10:00">10:00 - Late Morning</SelectItem>
              <SelectItem value="12:00">12:00 - Noon</SelectItem>
              <SelectItem value="14:00">14:00 - Afternoon</SelectItem>
              <SelectItem value="16:00">16:00 - Late Afternoon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Recurring Schedule Options</Label>
          <Select value={formData.recurringSchedule} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, recurringSchedule: value }))
          }>
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
          {formData.recurringSchedule !== "one-time" && formData.recurringSchedule && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Recurring discount applied to total pricing
            </p>
          )}
        </div>

        <div>
          <Label>Materials & Equipment Supply Options</Label>
          <Select value={formData.materials} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, materials: value }))
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

        {serviceId === "plumbing" && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="insurance"
                checked={formData.insurance}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, insurance: !!checked }))
                }
              />
              <Label htmlFor="insurance" className="text-sm">
                Insurance coverage required by insurer
              </Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-primary text-xl">+</span>
        </div>
        <h3 className="text-lg font-semibold">Add-ons & Extras</h3>
        <p className="text-gray-600 text-sm">Customize your service with additional options</p>
      </div>

      <div className="space-y-4">
        <Label>Suggested Add-ons</Label>
        {currentConfig.addOns?.map((addon: any) => (
          <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={addon.id}
                checked={formData.selectedAddOns.includes(addon.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData(prev => ({
                      ...prev,
                      selectedAddOns: [...prev.selectedAddOns, addon.id]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      selectedAddOns: prev.selectedAddOns.filter((id: string) => id !== addon.id)
                    }));
                  }
                }}
              />
              <Label htmlFor={addon.id} className="font-medium">{addon.name}</Label>
            </div>
            <span className="font-semibold">+R{addon.price}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Choose Your Verified Provider</h3>
        <p className="text-gray-600 text-sm">
          Showing {providers.length} verified professionals within 20km radius matching your requirements
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-blue-700 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            All providers are background-checked, insured, and rated 4.5+ stars
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <Card 
            key={provider.id}
            className={`cursor-pointer transition-all ${
              formData.selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setFormData(prev => ({ ...prev, selectedProvider: provider }))}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{provider.name}</h4>
                    {provider.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {provider.rating} ({provider.reviews})
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {provider.distance}km
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {provider.responseTime}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {provider.specializations.slice(0, 2).map(spec => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Base Service ({serviceId.replace('-', ' ')})</span>
            <span>R{pricing.basePrice}</span>
          </div>
          {pricing.addOnsPrice > 0 && (
            <div className="flex justify-between">
              <span>Selected Add-ons</span>
              <span>+R{pricing.addOnsPrice}</span>
            </div>
          )}
          {pricing.recurringDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Recurring Service Discount ({formData.recurringSchedule})</span>
              <span>-R{pricing.recurringDiscount}</span>
            </div>
          )}
          {pricing.timeDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Early Bird Discount (6 AM)</span>
              <span>-R{pricing.timeDiscount}</span>
            </div>
          )}
          {pricing.materialsDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Materials Discount (15%)</span>
              <span>-R{pricing.materialsDiscount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Provider within 20km radius</span>
            <span>✓ Verified</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Amount</span>
            <span className="text-primary">R{pricing.totalPrice}</span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Final amount includes all services, materials, and applicable discounts
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Method</h3>
        <p className="text-gray-600">Choose your preferred payment method to complete the booking</p>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Select Payment Method</Label>
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer border-2 transition-all ${
              formData.paymentMethod === "card" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "card" }))}
          >
            <CardContent className="p-4 text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Credit/Debit Card</h4>
              <p className="text-sm text-gray-600">Secure card payment</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer border-2 transition-all ${
              formData.paymentMethod === "bank" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "bank" }))}
          >
            <CardContent className="p-4 text-center">
              <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Bank Transfer</h4>
              <p className="text-sm text-gray-600">Direct bank transfer</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Card Payment Form */}
      {formData.paymentMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Card Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                  maxLength={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Transfer Form */}
      {formData.paymentMethod === "bank" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Bank Transfer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bankAccount">Bank Account Number</Label>
              <Input
                id="bankAccount"
                placeholder="1234567890"
                value={formData.bankAccount}
                onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bankBranch">Branch Code</Label>
              <Input
                id="bankBranch"
                placeholder="123456"
                value={formData.bankBranch}
                onChange={(e) => setFormData(prev => ({ ...prev, bankBranch: e.target.value }))}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> You will receive payment instructions via email after confirming this booking. 
                Your service will be scheduled once payment is received.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Final Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Service</span>
            <span className="font-medium">{currentConfig.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Provider</span>
            <span className="font-medium">{formData.selectedProvider?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time</span>
            <span className="font-medium">{formData.preferredDate} at {formData.timePreference}</span>
          </div>
          <div className="flex justify-between">
            <span>Address</span>
            <span className="font-medium">{formData.address}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Amount</span>
            <span className="text-primary">R{pricing.totalPrice}</span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Secured by Berry Events Bank - Your satisfaction guaranteed
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <currentConfig.icon className="h-6 w-6" />
            <span>{currentConfig.title}</span>
          </DialogTitle>
          <DialogDescription>
            Complete your booking in {currentConfig.steps} simple steps - Step {step} of {currentConfig.steps}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex space-x-2 mb-6">
          {Array.from({ length: currentConfig.steps }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i + 1 <= step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>

          {step < currentConfig.steps ? (
            <Button 
              onClick={handleNext}
              disabled={
                (step === 1 && (!formData.propertyType || !formData.address || 
                  (serviceId === "cleaning" && (!formData.cleaningType || !formData.propertySize)) ||
                  (serviceId === "garden-care" && (!formData.gardenSize || !formData.gardenCondition)) ||
                  (serviceId === "plumbing" && !formData.urgency) ||
                  (serviceId === "chef-catering" && (!formData.cuisineType || !formData.eventSize))
                )) ||
                (step === 2 && (!formData.preferredDate || !formData.timePreference)) ||
                (step === 4 && !formData.selectedProvider) ||
                (step === 5 && formData.paymentMethod === "card" && (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName)) ||
                (step === 5 && formData.paymentMethod === "bank" && (!formData.bankAccount || !formData.bankBranch))
              }
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleBookingConfirm}
              className="bg-gradient-to-r from-primary to-purple-600"
              disabled={
                formData.paymentMethod === "card" 
                  ? (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName)
                  : (!formData.bankAccount || !formData.bankBranch)
              }
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Complete Booking - R{pricing.totalPrice}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}