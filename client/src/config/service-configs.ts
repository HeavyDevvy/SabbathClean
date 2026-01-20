import {
  Sparkles,
  Scissors,
  Droplets,
  Droplet,
  Zap,
  TreePine,
  ChefHat,
  Users,
  Wrench,
  Truck
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ServiceConfig {
  title: string;
  icon: LucideIcon;
  basePrice: number;
  steps: number;
  propertyTypes: Array<{ value: string; label: string; multiplier: number }>;
  cleaningTypes?: Array<{ value: string; label: string; price: number }>;
  propertySizes?: Array<{ value: string; label: string; multiplier: number }>;
  gardenSizes?: Array<{ value: string; label: string; multiplier: number }>;
  gardenConditions?: Array<{ value: string; label: string; multiplier: number }>;
  poolSizes?: Array<{ value: string; label: string; multiplier: number }>;
  poolConditions?: Array<{ value: string; label: string; multiplier: number }>;
  plumbingIssues?: Array<{ value: string; label: string; price: number; description: string }>;
  electricalIssues?: Array<{ value: string; label: string; price: number; description: string }>;
  urgencyLevels?: Array<{ value: string; label: string; multiplier: number }>;
  cuisineTypes?: Array<{
    value: string;
    label: string;
    multiplier: number;
    popularMenus: Array<{ name: string; items: string[]; price: number }>;
    customItems: string[];
  }>;
  dietaryRequirements?: Array<{ value: string; label: string; description: string }>;
  eventSizes?: Array<{ value: string; label: string; multiplier: number }>;
  staffTypes?: Array<{ value: string; label: string; price: number }>;
  serviceTypes?: Array<{ value: string; label: string; price: number }> | Record<string, Array<{ value: string; label: string; price: number }>>;
  serviceCategories?: Array<{ value: string; label: string }>;
  vehicleMakes?: string[];
  keyTypes?: Array<{ value: string; label: string }>;
  lockTypes?: Array<{ value: string; label: string }>;
  businessTypes?: Array<{ value: string; label: string }>;
  sessionDuration?: Array<{ value: string; label: string; multiplier: number }>;
  movingTypes?: Array<{ value: string; label: string; price: number; description: string }>;
  movingDistance?: Array<{ value: string; label: string; multiplier: number }>;
  careTypes?: Array<{ value: string; label: string; price: number; description: string }>;
  accommodationTypes?: Array<{ value: string; label: string }>;
  contractDurations?: Array<{ value: string; label: string }>;
  floorLevels?: Array<{ value: string; label: string }>;
  stairsCount?: Array<{ value: string; label: string }>;
  parkingAccess?: Array<{ value: string; label: string }>;
  moveSizes?: Array<{ value: string; label: string }>;
  inventoryItems?: {
    furniture: Array<{ id: string; label: string }>;
    appliances: Array<{ id: string; label: string }>;
    special: Array<{ id: string; label: string }>;
  };
  boxTypes?: Array<{ id: string; label: string }>;
  complexityLevels?: Array<{ value: string; label: string; multiplier: number }>;
  daysPerWeek?: Array<{ value: string; label: string }>;
  hoursPerDay?: Array<{ value: string; label: string }>;
  petTypes?: Array<{ value: string; label: string }>;
  languages?: Array<{ value: string; label: string }>;
  educationLevels?: Array<{ value: string; label: string }>;
  experienceLevels?: Array<{ value: string; label: string }>;
  childAgeGroups?: Array<{ value: string; label: string }>;
  dutiesList?: Array<{ id: string; label: string }>;
  childrenCount?: Array<{ value: string; label: string; multiplier: number }>;
  childrenAges?: Array<{ value: string; label: string; multiplier: number }>;
  eventTypes?: Array<{
    value: string;
    label: string;
    multiplier: number;
    description?: string;
    customFields?: Array<{
      name: string;
      label: string;
      type: 'text' | 'number' | 'date' | 'datetime-local' | 'textarea';
      required: boolean;
    }>;
  }>;
  addOns: Array<{ id: string; name: string; price: number; description?: string }>;
  description?: string;
  enabled?: boolean;
  minHours?: number;
}

const baseServiceConfigs: Record<string, ServiceConfig> = {
  "cleaning": {
    title: "House Cleaning Service",
    icon: Sparkles,
    basePrice: 280,
    steps: 4,
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
    steps: 4,
    propertyTypes: [
      { value: "house", label: "House Garden", multiplier: 1.0 },
      { value: "townhouse", label: "Townhouse Garden", multiplier: 0.9 },
      { value: "estate-property", label: "Estate Property", multiplier: 1.4 }
    ],
    gardenSizes: [
      { value: "small", label: "Small (0-100m²)", multiplier: 1.0 },
      { value: "medium", label: "Medium (100-300m²)", multiplier: 1.5 },
      { value: "large", label: "Large (300-500m²)", multiplier: 2.0 },
      { value: "estate", label: "Estate (500m²+)", multiplier: 3.0 }
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
    steps: 4,
    propertyTypes: [
      { value: "apartment", label: "Apartment", multiplier: 1.0 },
      { value: "house", label: "House", multiplier: 1.1 },
      { value: "townhouse", label: "Townhouse", multiplier: 1.05 },
      { value: "villa", label: "Villa", multiplier: 1.3 }
    ],
    plumbingIssues: [
      { value: "leaking-pipe", label: "Leaking Pipe", price: 450, description: "Fix water leaks in pipes, joints, or connections" },
      { value: "blocked-drain", label: "Blocked Drain/Toilet", price: 380, description: "Clear blockages in drains, sinks, or toilets" },
      { value: "geyser-repair", label: "Geyser/Water Heater Repair", price: 650, description: "Repair or replace water heater/geyser" },
      { value: "tap-faucet", label: "Tap/Faucet Repair", price: 280, description: "Fix dripping or broken taps and faucets" },
      { value: "burst-pipe", label: "Burst Pipe (Emergency)", price: 850, description: "Emergency repair for burst water pipes" },
      { value: "toilet-installation", label: "Toilet Installation/Repair", price: 420, description: "Install new toilet or fix existing issues" },
      { value: "shower-repair", label: "Shower Repair", price: 380, description: "Fix shower heads, mixers, or drainage" },
      { value: "sink-installation", label: "Sink Installation", price: 520, description: "Install new kitchen or bathroom sink" },
      { value: "water-pressure", label: "Low Water Pressure", price: 350, description: "Diagnose and fix water pressure issues" },
      { value: "sewer-line", label: "Sewer Line Issues", price: 750, description: "Repair or unblock main sewer lines" },
      { value: "other", label: "Other Plumbing Issue", price: 450, description: "Custom plumbing problem not listed above" }
    ],
    addOns: [
      { id: "pipe-repair", name: "Additional Pipe Repair", price: 200 },
      { id: "faucet-install", name: "Extra Faucet Installation", price: 150 },
      { id: "toilet-repair", name: "Additional Toilet Repair", price: 180 },
      { id: "water-heater", name: "Water Heater Service", price: 400 }
    ]
  },
  "electrical": {
    title: "Electrical Service",
    icon: Zap,
    basePrice: 450,
    steps: 4,
    propertyTypes: [
      { value: "apartment", label: "Apartment", multiplier: 1.0 },
      { value: "house", label: "House", multiplier: 1.2 },
      { value: "townhouse", label: "Townhouse", multiplier: 1.1 },
      { value: "villa", label: "Villa", multiplier: 1.4 }
    ],
    electricalIssues: [
      { value: "power-outage", label: "Power Outage/No Electricity", price: 450, description: "Complete loss of power or electrical supply issues" },
      { value: "flickering-lights", label: "Flickering or Dim Lights", price: 320, description: "Light fixtures flickering, dimming, or not working properly" },
      { value: "outlet-not-working", label: "Outlets Not Working", price: 280, description: "Power outlets not functioning or sparking" },
      { value: "circuit-breaker", label: "Circuit Breaker Issues", price: 380, description: "Breakers tripping frequently or not resetting" },
      { value: "wiring-problems", label: "Faulty Wiring", price: 650, description: "Old, damaged, or unsafe electrical wiring" },
      { value: "electrical-panel", label: "Electrical Panel Problems", price: 800, description: "Main electrical panel issues or upgrades needed" },
      { value: "appliance-installation", label: "Appliance Installation", price: 350, description: "Installing new electrical appliances or fixtures" },
      { value: "ceiling-fan", label: "Ceiling Fan Issues", price: 420, description: "Ceiling fan installation, repair, or replacement" },
      { value: "light-fixture", label: "Light Fixture Problems", price: 300, description: "Installing or repairing light fixtures" },
      { value: "electrical-safety", label: "Electrical Safety Check", price: 250, description: "Complete electrical system inspection and safety assessment" },
      { value: "generator-issues", label: "Generator Problems", price: 550, description: "Generator installation, repair, or maintenance" },
      { value: "other", label: "Other Electrical Issue", price: 450, description: "Custom electrical problem not listed above" }
    ],
    urgencyLevels: [
      { value: "emergency", label: "Emergency (24/7)", multiplier: 2.5 },
      { value: "urgent", label: "Urgent (Same Day)", multiplier: 1.8 },
      { value: "standard", label: "Standard (Next Day)", multiplier: 1.0 },
      { value: "scheduled", label: "Scheduled (Flexible)", multiplier: 0.9 }
    ],
    addOns: [
      { id: "outlet-install", name: "Additional Outlet Installation", price: 180 },
      { id: "light-fixture", name: "Extra Light Fixture", price: 220 },
      { id: "ceiling-fan", name: "Additional Ceiling Fan", price: 350 },
      { id: "electrical-panel", name: "Panel Upgrade", price: 800 },
      { id: "surge-protection", name: "Surge Protection Installation", price: 400 },
      { id: "gfci-outlets", name: "GFCI Outlet Installation", price: 150 },
      { id: "electrical-inspection", name: "Full Electrical Inspection", price: 300 }
    ]
  },
  "garden-maintenance": {
    title: "Garden Maintenance Service",
    icon: TreePine,
    basePrice: 320,
    steps: 4,
    propertyTypes: [
      { value: "house", label: "House Garden", multiplier: 1.0 },
      { value: "townhouse", label: "Townhouse Garden", multiplier: 0.9 },
      { value: "estate-property", label: "Estate Property", multiplier: 1.4 }
    ],
    gardenSizes: [
      { value: "small", label: "Small (0-100m²)", multiplier: 1.0 },
      { value: "medium", label: "Medium (100-300m²)", multiplier: 1.5 },
      { value: "large", label: "Large (300-500m²)", multiplier: 2.0 },
      { value: "estate", label: "Estate (500m²+)", multiplier: 3.0 }
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
  "pool-cleaning": {
    title: "Pool Cleaning & Maintenance Service",
    icon: Droplet,
    basePrice: 350,
    steps: 4,
    propertyTypes: [
      { value: "house", label: "House Pool", multiplier: 1.0 },
      { value: "townhouse", label: "Townhouse Pool", multiplier: 0.9 },
      { value: "estate-property", label: "Estate Property", multiplier: 1.4 }
    ],
    poolSizes: [
      { value: "small", label: "Small Pool (Up to 20,000L)", multiplier: 1.0 },
      { value: "medium", label: "Medium Pool (20,000-40,000L)", multiplier: 1.5 },
      { value: "large", label: "Large Pool (40,000-60,000L)", multiplier: 2.0 },
      { value: "olympic", label: "Olympic/Estate (60,000L+)", multiplier: 3.0 }
    ],
    poolConditions: [
      { value: "well-maintained", label: "Well Maintained", multiplier: 1.0 },
      { value: "needs-attention", label: "Needs Attention", multiplier: 1.2 },
      { value: "neglected", label: "Neglected/Green", multiplier: 1.5 }
    ],
    addOns: [
      { id: "chemical-balance", name: "Chemical Balancing", price: 180 },
      { id: "filter-clean", name: "Filter Deep Clean", price: 250 },
      { id: "vacuum-brush", name: "Vacuum & Brush Service", price: 150 },
      { id: "green-recovery", name: "Green Pool Recovery", price: 400 }
    ]
  },
  "chef-catering": {
    title: "Chef & Catering Service",
    icon: ChefHat,
    basePrice: 850,
    steps: 4,
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
    steps: 4,
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
    eventTypes: [
      { value: "wedding", label: "Wedding Reception", multiplier: 1.3, description: "Formal service with full staff coordination" },
      { value: "corporate", label: "Corporate Event", multiplier: 1.2, description: "Professional service for business functions" },
      { value: "private-party", label: "Private Party", multiplier: 1.0, description: "Birthday, anniversary, or casual gathering" },
      { value: "formal-dinner", label: "Formal Dinner", multiplier: 1.2, description: "Multi-course plated service" },
      { value: "cocktail", label: "Cocktail Function", multiplier: 1.1, description: "Roaming service with canapés and drinks" },
      { value: "buffet", label: "Buffet Service", multiplier: 1.0, description: "Assisted buffet service and clearing" },
      { value: "conference", label: "Conference/Seminar", multiplier: 1.1, description: "Tea breaks and lunch service" }
    ],
    addOns: [
      { id: "uniform-rental", name: "Professional Uniform Rental", price: 50 },
      { id: "overtime-coverage", name: "Overtime Coverage", price: 120 },
      { id: "event-setup", name: "Event Setup Assistance", price: 200 },
      { id: "cleanup-service", name: "Post-Event Cleanup", price: 250 }
    ]
  },
  "beauty-wellness": {
    title: "Beauty & Wellness Service",
    icon: Scissors,
    basePrice: 280,
    steps: 4,
    propertyTypes: [
      { value: "apartment", label: "Apartment Visit", multiplier: 1.0 },
      { value: "house", label: "House Visit", multiplier: 1.1 },
      { value: "townhouse", label: "Townhouse Visit", multiplier: 1.05 },
      { value: "villa", label: "Villa Visit", multiplier: 1.2 },
      { value: "venue", label: "Event Venue", multiplier: 1.3 },
      { value: "office", label: "Corporate Office", multiplier: 1.2 },
      { value: "studio", label: "Studio/Set", multiplier: 1.1 }
    ],
    eventTypes: [
      { 
        value: "wedding", 
        label: "Wedding Service", 
        multiplier: 2.0,
        description: "Complete bridal party styling and preparation",
        customFields: [
          { name: "brides", label: "Number of Brides", type: "number", required: true },
          { name: "bridesmaids", label: "Number of Bridesmaids", type: "number", required: true },
          { name: "mothers", label: "Number of Mothers", type: "number", required: true },
          { name: "venue", label: "Venue Location", type: "text", required: true },
          { name: "date", label: "Wedding Date", type: "date", required: true }
        ]
      },
      { 
        value: "matric-dance", 
        label: "Matric Dance/Prom", 
        multiplier: 1.5,
        description: "Glamorous styling for your special night",
        customFields: [
          { name: "people", label: "Number of People", type: "number", required: true },
          { name: "venue", label: "Venue Location", type: "text", required: true },
          { name: "date", label: "Event Date", type: "date", required: true },
          { name: "style", label: "Style Preferences", type: "textarea", required: false }
        ]
      },
      { 
        value: "corporate-wellness", 
        label: "Corporate Wellness Day", 
        multiplier: 1.8,
        description: "On-site wellness services for employees",
        customFields: [
          { name: "employees", label: "Number of Employees", type: "number", required: true },
          { name: "company_location", label: "Company Location", type: "text", required: true },
          { name: "services_needed", label: "Services Needed", type: "textarea", required: true }
        ]
      },
      { 
        value: "photo-shoot", 
        label: "Photo Shoot", 
        multiplier: 1.6,
        description: "Professional styling for editorial or commercial shoots",
        customFields: [
          { name: "models", label: "Number of Models", type: "number", required: true },
          { name: "shoot_type", label: "Shoot Type", type: "text", required: true },
          { name: "duration", label: "Shoot Duration (hours)", type: "number", required: true }
        ]
      },
      { 
        value: "birthday", 
        label: "Birthday/Celebration", 
        multiplier: 1.4,
        description: "Pampering for birthdays and special occasions",
        customFields: [
          { name: "people", label: "Number of People", type: "number", required: true },
          { name: "venue", label: "Venue Location", type: "text", required: true },
          { name: "occasion", label: "Occasion Type", type: "text", required: true }
        ]
      },
      { 
        value: "personal", 
        label: "Personal Appointment", 
        multiplier: 1.0,
        description: "Individual beauty and wellness treatments",
        customFields: [
          { name: "services", label: "Services Needed", type: "textarea", required: true },
          { name: "preferred_time", label: "Preferred Date/Time", type: "datetime-local", required: true }
        ]
      }
    ],
    serviceTypes: [
      { value: "hair-styling", label: "Hair Styling (Cuts, Color, Updos)", price: 350 },
      { value: "makeup-artistry", label: "Makeup Artistry (Bridal, Occasion)", price: 450 },
      { value: "nail-services", label: "Nail Services (Manicure, Pedicure, Gel)", price: 250 },
      { value: "massage-therapy", label: "Massage Therapy (Swedish, Deep Tissue)", price: 550 },
      { value: "esthetician", label: "Esthetician (Facials, Waxing, Skincare)", price: 400 },
      { value: "spa-treatments", label: "Spa Treatments (Body Wraps, Scrubs)", price: 600 }
    ],
    sessionDuration: [
      { value: "quick", label: "Quick Session (30-60 min)", multiplier: 1.0 },
      { value: "standard", label: "Standard Session (1-2 hours)", multiplier: 1.5 },
      { value: "extended", label: "Extended Session (2-3 hours)", multiplier: 2.2 },
      { value: "half-day", label: "Half Day Package (4 hours)", multiplier: 3.0 },
      { value: "full-day", label: "Full Day Package (8 hours)", multiplier: 5.0 }
    ],
    addOns: [
      { id: "premium-products", name: "Premium Product Upgrade", price: 150 },
      { id: "group-discount", name: "Group Service (2+ people)", price: -50 },
      { id: "travel-kit", name: "Professional Travel Kit", price: 100 },
      { id: "trial-session", name: "Trial Session (Bridal/Event)", price: 300 }
    ]
  },
  "moving": {
    title: "Moving Services",
    icon: Truck,
    basePrice: 600,
    steps: 6,
    
    // 1. Primary Service Categories
    serviceCategories: [
      { value: "residential", label: "Residential Move" },
      { value: "office", label: "Office/Commercial Move" },
      { value: "specialty", label: "Specialty Moving" },
      { value: "packing", label: "Packing Services" },
      { value: "storage", label: "Storage Services" },
      { value: "additional", label: "Additional Services" }
    ],

    // 2. Detailed Service Types (Mapped by Category)
    serviceTypes: {
      residential: [
        { value: "local", label: "Local move (<50km)", price: 600 },
        { value: "long-distance", label: "Long-distance move (>50km)", price: 1500 },
        { value: "interstate", label: "Interstate/cross-border move", price: 3500 },
        { value: "apartment", label: "Apartment/flat move", price: 800 },
        { value: "house", label: "House move", price: 1800 },
        { value: "mansion", label: "Estate/mansion move", price: 2800 }
      ],
      office: [
        { value: "small-office", label: "Small office (1-5 employees)", price: 1200 },
        { value: "medium-office", label: "Medium office (6-20 employees)", price: 2500 },
        { value: "large-office", label: "Large office (20+ employees)", price: 5000 },
        { value: "retail", label: "Retail store relocation", price: 3000 },
        { value: "warehouse", label: "Warehouse relocation", price: 4500 },
        { value: "server-it", label: "Server/IT equipment move", price: 2000 }
      ],
      specialty: [
        { value: "piano", label: "Piano moving", price: 1200 },
        { value: "antique", label: "Antique furniture", price: 900 },
        { value: "art", label: "Art and sculptures", price: 800 },
        { value: "pool-table", label: "Pool table moving", price: 1500 },
        { value: "safe", label: "Safe moving", price: 1000 },
        { value: "machinery", label: "Heavy machinery", price: 3000 },
        { value: "fragile", label: "Fragile/valuable items", price: 700 }
      ],
      packing: [
        { value: "full", label: "Full packing service", price: 2500 },
        { value: "partial", label: "Partial packing (fragile only)", price: 1200 },
        { value: "unpacking", label: "Unpacking service", price: 1500 },
        { value: "materials", label: "Materials only", price: 500 },
        { value: "crating", label: "Custom crating for valuables", price: 1800 }
      ],
      storage: [
        { value: "short-term", label: "Short-term storage (1-3 months)", price: 800 },
        { value: "long-term", label: "Long-term storage (3+ months)", price: 700 },
        { value: "climate", label: "Climate-controlled storage", price: 1200 },
        { value: "vehicle", label: "Vehicle storage", price: 1000 },
        { value: "furniture", label: "Furniture storage", price: 600 }
      ],
      additional: [
        { value: "assembly", label: "Furniture assembly/disassembly", price: 400 },
        { value: "appliance", label: "Appliance disconnection", price: 300 },
        { value: "cleaning", label: "Move-in/Move-out cleaning", price: 850 },
        { value: "junk", label: "Junk removal", price: 600 },
        { value: "pet", label: "Pet relocation", price: 900 },
        { value: "transport", label: "Vehicle transport", price: 1500 }
      ]
    },

    // 3. Move Complexity Levels
    complexityLevels: [
      { value: "basic", label: "Basic (Pre-packed, ground floor, minimal items)", multiplier: 1.0 },
      { value: "standard", label: "Standard (Some packing, stairs/elevator)", multiplier: 1.3 },
      { value: "complex", label: "Complex (Full packing, multi-floors)", multiplier: 1.6 },
      { value: "premium", label: "Premium (White glove, high-value items)", multiplier: 2.2 }
    ],

    // Origin/Destination Options
    floorLevels: [
      { value: "ground", label: "Ground Floor" },
      { value: "1", label: "1st Floor" },
      { value: "2", label: "2nd Floor" },
      { value: "3", label: "3rd Floor" },
      { value: "4", label: "4th Floor" },
      { value: "5+", label: "5th+ Floor (Elevator Required)" }
    ],
    stairsCount: [
      { value: "none", label: "No Stairs (Elevator/Ground)" },
      { value: "1-10", label: "1-10 Steps" },
      { value: "11-20", label: "11-20 Steps" },
      { value: "21+", label: "21+ Steps" }
    ],
    parkingAccess: [
      { value: "driveway", label: "Direct Driveway Access" },
      { value: "street", label: "Street Parking (< 10m)" },
      { value: "lot", label: "Parking Lot" },
      { value: "difficult", label: "Difficult/Far Access (> 20m)" }
    ],
    
    // Move Details
    moveSizes: [
      { value: "studio", label: "Studio / Bachelor" },
      { value: "1-bed", label: "1 Bedroom Home" },
      { value: "2-bed", label: "2 Bedroom Home" },
      { value: "3-bed", label: "3 Bedroom Home" },
      { value: "4-bed", label: "4+ Bedroom Home" },
      { value: "office-small", label: "Small Office" },
      { value: "office-large", label: "Large Office" },
      { value: "custom", label: "Custom / Partial Move" }
    ],
    
    // Inventory Items (Categorized for UI generation)
    inventoryItems: {
      furniture: [
        { id: "bed_single", label: "Bed (Single)" },
        { id: "bed_double", label: "Bed (Double)" },
        { id: "bed_queen", label: "Bed (Queen)" },
        { id: "bed_king", label: "Bed (King)" },
        { id: "sofa_2", label: "Sofa (2-seater)" },
        { id: "sofa_3", label: "Sofa (3-seater)" },
        { id: "sofa_l", label: "Sofa (L-shaped)" },
        { id: "sofa_sectional", label: "Sofa (Sectional)" },
        { id: "dining_table", label: "Dining Table & Chairs" },
        { id: "coffee_table", label: "Coffee Table" },
        { id: "tv_stand", label: "TV Stand/Entertainment Unit" },
        { id: "wardrobe", label: "Wardrobe/Closet" },
        { id: "dresser", label: "Dresser/Chest of Drawers" },
        { id: "desk", label: "Desk" },
        { id: "bookshelf", label: "Bookshelf" },
        { id: "side_table", label: "Side Table" }
      ],
      appliances: [
        { id: "fridge", label: "Refrigerator/Fridge-freezer" },
        { id: "washing_machine", label: "Washing Machine" },
        { id: "dryer", label: "Dryer" },
        { id: "dishwasher", label: "Dishwasher" },
        { id: "stove", label: "Stove/Oven" },
        { id: "microwave", label: "Microwave" },
        { id: "tv_small", label: "TV (<40\")" },
        { id: "tv_med", label: "TV (40-55\")" },
        { id: "tv_large", label: "TV (55\"+)" },
        { id: "ac", label: "Air Conditioner" }
      ],
      special: [
        { id: "piano_upright", label: "Piano (Upright)" },
        { id: "piano_baby", label: "Piano (Baby Grand)" },
        { id: "piano_grand", label: "Piano (Grand)" },
        { id: "pool_table", label: "Pool Table" },
        { id: "gym_equip", label: "Gym Equipment" },
        { id: "safe_small", label: "Safe (<50kg)" },
        { id: "safe_med", label: "Safe (50-150kg)" },
        { id: "safe_large", label: "Safe (150kg+)" },
        { id: "antique", label: "Antique Furniture" },
        { id: "artwork", label: "Artwork/Paintings" },
        { id: "chandelier", label: "Chandelier" },
        { id: "outdoor_furn", label: "Outdoor Furniture" },
        { id: "plants", label: "Plants (Large)" }
      ]
    },
    
    // Packing & Boxes
    boxTypes: [
      { id: "box_small", label: "Small Boxes (Books/Canned goods)" },
      { id: "box_medium", label: "Medium Boxes (Kitchen/Decor)" },
      { id: "box_large", label: "Large Boxes (Bedding/Clothes)" },
      { id: "box_wardrobe", label: "Wardrobe Boxes" },
      { id: "loose_items", label: "Loose Items (Estimate)" }
    ],

    propertyTypes: [
      { value: "apartment", label: "Apartment/1-2 Bedrooms", multiplier: 1.0 },
      { value: "house", label: "House/3-4 Bedrooms", multiplier: 1.4 },
      { value: "townhouse", label: "Townhouse/2-3 Bedrooms", multiplier: 1.2 },
      { value: "villa", label: "Villa/5+ Bedrooms", multiplier: 1.8 },
      { value: "office", label: "Office", multiplier: 1.5 },
      { value: "warehouse", label: "Warehouse", multiplier: 2.0 },
      { value: "storage", label: "Storage Unit", multiplier: 0.8 }
    ],

    addOns: [
      { id: "packing-materials", name: "Packing Materials Supply", price: 200 },
      { id: "storage", name: "Temporary Storage (1 month)", price: 300 },
      { id: "insurance", name: "Premium Moving Insurance", price: 350 },
      { id: "disassembly", name: "Furniture Disassembly/Assembly", price: 250 },
      { id: "cleaning", name: "Post-Move Cleaning", price: 400 }
    ]
  },
  "au-pair": {
    title: "Au Pair Services",
    icon: Users,
    basePrice: 65,
    steps: 5,
    propertyTypes: [
      { value: "apartment", label: "Apartment", multiplier: 1.0 },
      { value: "house", label: "House", multiplier: 1.1 },
      { value: "townhouse", label: "Townhouse", multiplier: 1.05 },
      { value: "villa", label: "Villa", multiplier: 1.2 }
    ],
    careTypes: [
      { 
        value: "full-time-live-in", 
        label: "Full-Time Live-In Au Pair", 
        price: 3500, // Monthly placement/base fee
        description: "25-45 hours/week. Includes room, board & stipend. 6-24 month contract." 
      },
      { 
        value: "part-time", 
        label: "Part-Time Au Pair", 
        price: 85, // Hourly rate
        description: "10-24 hours/week. Flexible duration (min 3 months). Childcare only." 
      },
      { 
        value: "after-school", 
        label: "After-School Care", 
        price: 95, // Hourly rate
        description: "2-4 hours/day. School pickup, homework help & activities." 
      },
      { 
        value: "emergency", 
        label: "Emergency/Temporary Care", 
        price: 120, // Premium hourly rate
        description: "Immediate availability. Short-term (1 day - 4 weeks)." 
      },
      { 
        value: "specialized", 
        label: "Specialized Au Pair", 
        price: 150, // Premium hourly rate
        description: "Special needs, newborn specialist, or multiple children expertise." 
      }
    ],
    childrenCount: [
      { value: "1", label: "1 Child", multiplier: 1.0 },
      { value: "2", label: "2 Children", multiplier: 1.4 },
      { value: "3", label: "3 Children", multiplier: 1.7 },
      { value: "4+", label: "4+ Children", multiplier: 2.0 }
    ],
    childAgeGroups: [
      { value: "0-3m", label: "0-3 months" },
      { value: "3-12m", label: "3-12 months" },
      { value: "1-2y", label: "1-2 years" },
      { value: "3-5y", label: "3-5 years" },
      { value: "6-8y", label: "6-8 years" },
      { value: "9-12y", label: "9-12 years" },
      { value: "13-15y", label: "13-15 years" },
      { value: "16-18y", label: "16-18 years" }
    ],
    accommodationTypes: [
      { value: "separate-room", label: "Separate Room" },
      { value: "shared-bathroom", label: "Shared Bathroom" },
      { value: "private-bathroom", label: "Private Bathroom" },
      { value: "separate-cottage", label: "Separate Cottage/Flat" }
    ],
    contractDurations: [
      { value: "3-months", label: "3 Months" },
      { value: "6-months", label: "6 Months" },
      { value: "12-months", label: "12 Months" },
      { value: "24-months", label: "24 Months" },
      { value: "ongoing", label: "Ongoing" }
    ],
    daysPerWeek: [
      { value: "mon-fri", label: "Monday - Friday" },
      { value: "mon-sat", label: "Monday - Saturday" },
      { value: "7-days", label: "7 Days / Week" },
      { value: "custom", label: "Custom Schedule" }
    ],
    hoursPerDay: [
      { value: "2-4", label: "2-4 hours" },
      { value: "5-8", label: "5-8 hours" },
      { value: "9-12", label: "9-12 hours" },
      { value: "full-day", label: "Full Day (12+ hours)" }
    ],
    petTypes: [
      { value: "none", label: "None" },
      { value: "dog", label: "Dog" },
      { value: "cat", label: "Cat" },
      { value: "multiple", label: "Multiple Pets" }
    ],
    languages: [
      { value: "english", label: "English" },
      { value: "afrikaans", label: "Afrikaans" },
      { value: "zulu", label: "Zulu" },
      { value: "xhosa", label: "Xhosa" },
      { value: "other", label: "Other" }
    ],
    educationLevels: [
      { value: "high-school", label: "High School" },
      { value: "diploma", label: "Diploma" },
      { value: "degree", label: "Degree" },
      { value: "certification", label: "Childcare Certification" }
    ],
    experienceLevels: [
      { value: "entry", label: "Entry Level" },
      { value: "1-2y", label: "1-2 Years" },
      { value: "3-5y", label: "3-5 Years" },
      { value: "5y+", label: "5+ Years" }
    ],
    dutiesList: [
      { id: "childcare", label: "Childcare and supervision" },
      { id: "school-transport", label: "School drop-off/pick-up" },
      { id: "meal-prep", label: "Meal preparation for children" },
      { id: "light-housework", label: "Light housework (children's areas only)" },
      { id: "homework", label: "Homework assistance" },
      { id: "activities", label: "Organize activities and playtime" },
      { id: "bedtime", label: "Bathing and bedtime routine" },
      { id: "laundry", label: "Laundry (children's only)" }
    ],
    childrenAges: [
      { value: "infant", label: "Infant (0-1 year)", multiplier: 1.3 },
      { value: "toddler", label: "Toddler (1-3 years)", multiplier: 1.2 },
      { value: "preschool", label: "Preschool (3-5 years)", multiplier: 1.1 },
      { value: "school", label: "School Age (6+ years)", multiplier: 1.0 }
    ],
    addOns: [
      { id: "background-check", name: "Enhanced Background Check", price: 120 },
      { id: "first-aid", name: "Certified First Aid Training", price: 80 },
      { id: "transport", name: "Child Transportation Service", price: 100 },
      { id: "meal-prep", name: "Meal Preparation for Children", price: 60 },
      { id: "overnight", name: "Overnight Care Available", price: 150 },
      { id: "tutoring", name: "Subject-Specific Tutoring", price: 200 }
    ]
  },
  "locksmith": {
    title: "Locksmith Services",
    icon: Wrench,
    basePrice: 450,
    steps: 4,
    serviceCategories: [
      { value: "automotive", label: "Automotive Locksmith" },
      { value: "residential", label: "Residential Locksmith" },
      { value: "commercial", label: "Commercial Locksmith" },
      { value: "emergency", label: "Emergency Services" }
    ],
    serviceTypes: {
      automotive: [
        { value: "lockout", label: "Locked Keys in Car", price: 450 },
        { value: "lost-keys", label: "Lost Car Keys", price: 850 },
        { value: "broken-key", label: "Broken Key Extraction", price: 550 },
        { value: "transponder", label: "Transponder Key Programming", price: 950 },
        { value: "duplication", label: "Car Key Duplication", price: 350 },
        { value: "ignition", label: "Ignition Repair/Replacement", price: 1200 }
      ],
      residential: [
        { value: "lockout", label: "Home Lockout", price: 450 },
        { value: "install", label: "New Lock Installation", price: 350 },
        { value: "repair", label: "Lock Repair", price: 280 },
        { value: "replace", label: "Lock Replacement", price: 350 },
        { value: "rekey", label: "Rekey Existing Locks", price: 250 },
        { value: "high-security", label: "High-Security Lock Install", price: 850 },
        { value: "smart-lock", label: "Smart Lock Installation", price: 650 },
        { value: "safe", label: "Safe Opening/Repair", price: 950 }
      ],
      commercial: [
        { value: "lockout", label: "Office Lockout", price: 550 },
        { value: "master-key", label: "Master Key System", price: 1500 },
        { value: "access-control", label: "Access Control Systems", price: 2500 },
        { value: "electronic", label: "Electronic Lock Install", price: 1200 },
        { value: "panic-bar", label: "Panic Bar Installation", price: 1800 },
        { value: "file-cabinet", label: "File Cabinet Locks", price: 250 }
      ],
      emergency: [
        { value: "247-lockout", label: "24/7 Emergency Lockout", price: 650 },
        { value: "break-in", label: "Break-in Repair", price: 850 },
        { value: "security-check", label: "Post-Burglary Assessment", price: 450 }
      ]
    },
    vehicleMakes: [
      "Toyota", "Volkswagen", "Ford", "Hyundai", "Nissan", "BMW", "Mercedes-Benz", 
      "Audi", "Honda", "Kia", "Mazda", "Suzuki", "Renault", "Chevrolet", "Isuzu", "Other"
    ],
    keyTypes: [
      { value: "traditional", label: "Traditional Metal Key" },
      { value: "transponder", label: "Transponder Chip Key" },
      { value: "smart", label: "Smart Key / Fob" },
      { value: "remote", label: "Remote Head Key" }
    ],
    propertyTypes: [
      { value: "house", label: "House", multiplier: 1.0 },
      { value: "apartment", label: "Apartment/Flat", multiplier: 1.0 },
      { value: "townhouse", label: "Townhouse/Cluster", multiplier: 1.0 },
      { value: "other", label: "Other", multiplier: 1.0 }
    ],
    lockTypes: [
      { value: "deadbolt", label: "Deadbolt" },
      { value: "knob", label: "Knob Lock" },
      { value: "lever", label: "Lever Handle" },
      { value: "smart", label: "Smart Lock" },
      { value: "padlock", label: "Padlock" }
    ],
    businessTypes: [
      { value: "office", label: "Office Building" },
      { value: "retail", label: "Retail Store" },
      { value: "warehouse", label: "Warehouse/Industrial" },
      { value: "restaurant", label: "Restaurant/Hospitality" },
      { value: "other", label: "Other" }
    ],
    urgencyLevels: [
      { value: "emergency", label: "Emergency (Immediate)", multiplier: 2.0 },
      { value: "urgent", label: "Urgent (Within 2 hours)", multiplier: 1.5 },
      { value: "standard", label: "Standard (Scheduled)", multiplier: 1.0 }
    ],
    addOns: [
      { id: "extra-key", name: "Additional Key Copy", price: 150 },
      { id: "lube", name: "Lock Lubrication Service", price: 120 },
      { id: "security-audit", name: "Full Security Audit", price: 450 }
    ]
  }
};

// Apply admin overrides from localStorage (enable/disable, edits, new services)
let mergedServiceConfigs: Record<string, ServiceConfig> = { ...baseServiceConfigs };
try {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('serviceConfigOverrides') : null;
  const overrides = raw ? JSON.parse(raw) as Record<string, Partial<ServiceConfig>> : {};
  for (const [id, override] of Object.entries(overrides)) {
    if (mergedServiceConfigs[id]) {
      mergedServiceConfigs[id] = { ...mergedServiceConfigs[id], ...override } as ServiceConfig;
    } else {
      mergedServiceConfigs[id] = {
        title: override.title || id,
        icon: Wrench,
        basePrice: (override.basePrice as number) ?? 0,
        steps: (override.steps as number) ?? 4,
        propertyTypes: (override.propertyTypes as any) ?? [],
        addOns: (override.addOns as any) ?? [],
        description: override.description,
        enabled: override.enabled !== undefined ? override.enabled : true,
        minHours: override.minHours as number | undefined,
      } as ServiceConfig;
    }
  }
} catch (e) {
  // silently ignore malformed overrides
}

export const serviceConfigs: Record<string, ServiceConfig> = mergedServiceConfigs;

export const serviceIdMapping: Record<string, string> = {
  "cleaning": "cleaning",
  "house-cleaning": "cleaning",
  "HOUSE_CLEANING": "cleaning",
  "gardening": "garden-care",
  "garden-care": "garden-care",
  "GARDEN_CARE": "garden-care",
  "garden-maintenance": "garden-care",
  "pool-cleaning": "pool-cleaning",
  "POOL_CLEANING_MAINTENANCE": "pool-cleaning",
  "plumbing": "plumbing",
  "plumbing-services": "plumbing",
  "PLUMBING_SERVICES": "plumbing",
  "electrical": "electrical",
  "electrical-services": "electrical",
  "ELECTRICAL_SERVICES": "electrical",
  "chef-catering": "chef-catering",
  "CHEF_CATERING": "chef-catering",
  "waitering": "event-staff",
  "event-staff": "event-staff",
  "event-staffing": "event-staff",
  "WAITERING_SERVICES": "event-staff",
  "beauty-wellness": "beauty-wellness",
  "BEAUTY_WELLNESS": "beauty-wellness",
  "moving": "moving",
  "MOVING_SERVICES": "moving",
  "au-pair": "au-pair",
  "AU_PAIR_SERVICES": "au-pair",
  "locksmith": "locksmith",
  "LOCKSMITH_SERVICES": "locksmith"
};
