import {
  Sparkles,
  Scissors,
  Droplets,
  Droplet,
  Zap,
  TreePine,
  ChefHat,
  Users,
  Wrench
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
  serviceTypes?: Array<{ value: string; label: string; price: number }>;
  sessionDuration?: Array<{ value: string; label: string; multiplier: number }>;
  movingTypes?: Array<{ value: string; label: string; price: number; description: string }>;
  movingDistance?: Array<{ value: string; label: string; multiplier: number }>;
  careTypes?: Array<{ value: string; label: string; price: number; description: string }>;
  childrenCount?: Array<{ value: string; label: string; multiplier: number }>;
  childrenAges?: Array<{ value: string; label: string; multiplier: number }>;
  addOns: Array<{ id: string; name: string; price: number; description?: string }>;
}

export const serviceConfigs: Record<string, ServiceConfig> = {
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
  },
  "moving": {
    title: "Moving Services",
    icon: Wrench,
    basePrice: 600,
    steps: 4,
    propertyTypes: [
      { value: "apartment", label: "Apartment/1-2 Bedrooms", multiplier: 1.0 },
      { value: "house", label: "House/3-4 Bedrooms", multiplier: 1.4 },
      { value: "townhouse", label: "Townhouse/2-3 Bedrooms", multiplier: 1.2 },
      { value: "villa", label: "Villa/5+ Bedrooms", multiplier: 1.8 }
    ],
    movingTypes: [
      { value: "local", label: "Local Moving (Same City)", price: 600, description: "Moving within the same city or nearby areas" },
      { value: "long-distance", label: "Long-Distance Moving", price: 1200, description: "Intercity or interstate moving" },
      { value: "office", label: "Office Relocation", price: 800, description: "Business and office moving services" },
      { value: "furniture", label: "Furniture Moving & Assembly", price: 400, description: "Specialized furniture transport and setup" },
      { value: "packing", label: "Packing & Unpacking Services", price: 350, description: "Professional packing and unpacking assistance" },
      { value: "piano", label: "Piano & Specialty Items", price: 900, description: "Special handling for delicate items" }
    ],
    movingDistance: [
      { value: "local", label: "Local (0-50km)", multiplier: 1.0 },
      { value: "regional", label: "Regional (50-200km)", multiplier: 1.5 },
      { value: "long-distance", label: "Long Distance (200km+)", multiplier: 2.2 }
    ],
    addOns: [
      { id: "packing-materials", name: "Packing Materials Supply", price: 200 },
      { id: "storage", name: "Temporary Storage (1 month)", price: 300 },
      { id: "insurance", name: "Premium Moving Insurance", price: 150 },
      { id: "disassembly", name: "Furniture Disassembly/Assembly", price: 250 },
      { id: "cleaning", name: "Post-Move Cleaning", price: 400 }
    ]
  },
  "au-pair": {
    title: "Au Pair Services",
    icon: Users,
    basePrice: 65,
    steps: 4,
    propertyTypes: [
      { value: "apartment", label: "Apartment", multiplier: 1.0 },
      { value: "house", label: "House", multiplier: 1.1 },
      { value: "townhouse", label: "Townhouse", multiplier: 1.05 },
      { value: "villa", label: "Villa", multiplier: 1.2 }
    ],
    careTypes: [
      { value: "live-in", label: "Live-in Au Pair (6-12 months)", price: 3500, description: "Full-time live-in childcare provider" },
      { value: "part-time", label: "Part-time Childcare", price: 65, description: "Flexible part-time childcare hours" },
      { value: "after-school", label: "After-school Care", price: 80, description: "Care and supervision after school hours" },
      { value: "weekend", label: "Weekend & Holiday Care", price: 90, description: "Weekend and special occasion care" },
      { value: "overnight", label: "Overnight Babysitting", price: 120, description: "Extended overnight care services" },
      { value: "educational", label: "Educational Support & Tutoring", price: 95, description: "Homework help and educational activities" }
    ],
    childrenCount: [
      { value: "1", label: "1 Child", multiplier: 1.0 },
      { value: "2", label: "2 Children", multiplier: 1.4 },
      { value: "3", label: "3 Children", multiplier: 1.7 },
      { value: "4+", label: "4+ Children", multiplier: 2.0 }
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
      { id: "overnight", name: "Overnight Care Available", price: 150 }
    ]
  }
};

export const serviceIdMapping: Record<string, string> = {
  "cleaning": "cleaning",
  "house-cleaning": "cleaning",
  "gardening": "garden-care",
  "garden-care": "garden-care",
  "garden-maintenance": "garden-care",
  "pool-cleaning": "pool-cleaning",
  "plumbing": "plumbing",
  "plumbing-services": "plumbing",
  "electrical": "electrical",
  "electrical-services": "electrical",
  "chef-catering": "chef-catering",
  "waitering": "event-staff",
  "event-staff": "event-staff",
  "event-staffing": "event-staff",
  "beauty-wellness": "beauty-wellness",
  "moving": "moving",
  "au-pair": "au-pair"
};
