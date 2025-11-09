// Add-ons configuration for different service types
// Maps service categories to their available add-ons with pricing

export interface AddOn {
  id: string;
  name: string;
  price: number;
  estimatedHours: number;
  keywords: string[]; // Keywords for auto-suggestion
}

export const serviceAddOns: Record<string, AddOn[]> = {
  "house-cleaning": [
    { id: "deep-clean", name: "Deep Cleaning", price: 250, estimatedHours: 2, keywords: ["deep", "thorough", "intensive"] },
    { id: "carpet-clean", name: "Carpet Cleaning", price: 180, estimatedHours: 1.5, keywords: ["carpet", "rug", "floor"] },
    { id: "window-clean", name: "Window Cleaning", price: 150, estimatedHours: 1, keywords: ["window", "glass"] },
    { id: "appliance-clean", name: "Appliance Cleaning (Oven/Fridge)", price: 200, estimatedHours: 1, keywords: ["oven", "fridge", "stove", "appliance"] },
    { id: "laundry", name: "Laundry Service", price: 120, estimatedHours: 1, keywords: ["laundry", "wash", "iron", "clothes"] },
    { id: "balcony-clean", name: "Balcony/Patio Cleaning", price: 100, estimatedHours: 0.5, keywords: ["balcony", "patio", "outdoor"] },
  ],
  
  "plumbing": [
    { id: "leak-repair", name: "Leak Repair", price: 300, estimatedHours: 1.5, keywords: ["leak", "drip", "water", "pipe"] },
    { id: "drain-unclog", name: "Drain Unclogging", price: 250, estimatedHours: 1, keywords: ["clog", "block", "drain", "sink"] },
    { id: "toilet-repair", name: "Toilet Repair", price: 350, estimatedHours: 1.5, keywords: ["toilet", "flush", "cistern"] },
    { id: "geyser-service", name: "Geyser Service/Repair", price: 500, estimatedHours: 2, keywords: ["geyser", "hot water", "heater"] },
    { id: "pipe-replacement", name: "Pipe Replacement", price: 450, estimatedHours: 2.5, keywords: ["pipe", "replace", "burst"] },
    { id: "tap-install", name: "Tap Installation/Replacement", price: 200, estimatedHours: 1, keywords: ["tap", "faucet", "mixer"] },
  ],
  
  "electrical": [
    { id: "outlet-install", name: "Outlet Installation", price: 180, estimatedHours: 1, keywords: ["outlet", "socket", "plug"] },
    { id: "light-install", name: "Light Fixture Installation", price: 220, estimatedHours: 1, keywords: ["light", "fixture", "lamp", "chandelier"] },
    { id: "switch-repair", name: "Switch Repair/Replacement", price: 150, estimatedHours: 0.5, keywords: ["switch", "dimmer"] },
    { id: "circuit-repair", name: "Circuit Breaker Repair", price: 400, estimatedHours: 2, keywords: ["circuit", "breaker", "trip", "power"] },
    { id: "wiring-check", name: "Electrical Wiring Inspection", price: 350, estimatedHours: 1.5, keywords: ["wiring", "inspect", "safety"] },
    { id: "fan-install", name: "Ceiling Fan Installation", price: 280, estimatedHours: 1.5, keywords: ["fan", "ceiling"] },
  ],
  
  "garden-maintenance": [
    { id: "lawn-mow", name: "Lawn Mowing", price: 150, estimatedHours: 1, keywords: ["lawn", "mow", "grass", "cut"] },
    { id: "hedge-trim", name: "Hedge Trimming", price: 180, estimatedHours: 1.5, keywords: ["hedge", "trim", "bush", "shrub"] },
    { id: "weeding", name: "Weeding", price: 120, estimatedHours: 1, keywords: ["weed", "remove"] },
    { id: "fertilize", name: "Fertilizing", price: 200, estimatedHours: 1, keywords: ["fertilize", "feed", "nutrient"] },
    { id: "tree-prune", name: "Tree Pruning", price: 350, estimatedHours: 2, keywords: ["tree", "prune", "branch"] },
    { id: "garden-design", name: "Garden Redesign Consultation", price: 500, estimatedHours: 2, keywords: ["design", "plan", "layout"] },
  ],
  
  "chef-catering": [
    { id: "appetizers", name: "Appetizers/Starters", price: 300, estimatedHours: 1, keywords: ["appetizer", "starter", "snack"] },
    { id: "dessert", name: "Dessert Course", price: 250, estimatedHours: 1, keywords: ["dessert", "sweet", "cake"] },
    { id: "beverages", name: "Beverage Service", price: 180, estimatedHours: 0.5, keywords: ["beverage", "drink", "cocktail"] },
    { id: "dietary", name: "Special Dietary Requirements", price: 200, estimatedHours: 0.5, keywords: ["vegan", "vegetarian", "halal", "kosher", "allergy", "gluten"] },
    { id: "table-setup", name: "Table Setting & Decoration", price: 150, estimatedHours: 1, keywords: ["table", "decor", "setting"] },
    { id: "cleanup", name: "Full Cleanup Service", price: 220, estimatedHours: 1.5, keywords: ["clean", "wash", "tidy"] },
  ],
  
  "event-staff": [
    { id: "extra-waiter", name: "Additional Waiter", price: 350, estimatedHours: 4, keywords: ["waiter", "server", "extra", "more"] },
    { id: "bartender", name: "Bartender Service", price: 400, estimatedHours: 4, keywords: ["bartender", "bar", "drink"] },
    { id: "supervisor", name: "Event Supervisor", price: 500, estimatedHours: 6, keywords: ["supervisor", "manager", "coordinator"] },
    { id: "cleanup-crew", name: "Cleanup Crew", price: 300, estimatedHours: 2, keywords: ["cleanup", "clean", "tidy"] },
    { id: "equipment", name: "Equipment Rental (Tables/Chairs)", price: 250, estimatedHours: 0, keywords: ["table", "chair", "equipment", "tent"] },
  ],
  
  "handyman": [
    { id: "furniture-assembly", name: "Furniture Assembly", price: 200, estimatedHours: 1.5, keywords: ["furniture", "assemble", "build"] },
    { id: "painting", name: "Interior Painting", price: 400, estimatedHours: 3, keywords: ["paint", "wall", "color"] },
    { id: "door-repair", name: "Door Repair/Installation", price: 300, estimatedHours: 2, keywords: ["door", "hinge", "lock"] },
    { id: "drywall-repair", name: "Drywall Repair", price: 250, estimatedHours: 1.5, keywords: ["drywall", "wall", "hole", "patch"] },
    { id: "shelf-install", name: "Shelf Installation", price: 150, estimatedHours: 1, keywords: ["shelf", "bracket", "mount"] },
    { id: "tile-repair", name: "Tile Repair/Replacement", price: 350, estimatedHours: 2, keywords: ["tile", "grout", "floor"] },
  ],
  
  "beauty-wellness": [
    { id: "massage", name: "Full Body Massage", price: 500, estimatedHours: 1, keywords: ["massage", "relax", "spa"] },
    { id: "facial", name: "Facial Treatment", price: 350, estimatedHours: 1, keywords: ["facial", "skin", "face"] },
    { id: "manicure", name: "Manicure", price: 150, estimatedHours: 0.5, keywords: ["manicure", "nails", "hands"] },
    { id: "pedicure", name: "Pedicure", price: 180, estimatedHours: 1, keywords: ["pedicure", "feet", "toes"] },
    { id: "waxing", name: "Waxing Service", price: 200, estimatedHours: 0.5, keywords: ["wax", "hair removal"] },
    { id: "makeup", name: "Professional Makeup", price: 400, estimatedHours: 1.5, keywords: ["makeup", "cosmetic", "beauty"] },
  ],
};

// Function to suggest add-ons based on keywords in comment
export function suggestAddOns(serviceCategory: string, comment: string): AddOn[] {
  const addons = serviceAddOns[serviceCategory] || [];
  const lowerComment = comment.toLowerCase();
  
  return addons.filter(addon => 
    addon.keywords.some(keyword => lowerComment.includes(keyword))
  );
}
