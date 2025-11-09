// ADDED: Multi-service booking feature - Updated add-ons to use centralized JSON configuration
// Add-ons configuration for different service types
// Maps service categories to their available add-ons with pricing

// Import add-ons data from JSON
import addonsData from './addons.json';

export interface AddOn {
  id: string;
  name: string;
  price: number;
  estimatedHours: number;
  keywords: string[]; // Keywords for auto-suggestion
}

// Transform JSON data to match existing AddOn interface
// ADDED: Automatically estimate hours based on price (R250/hour baseline)
function transformAddons(jsonAddons: any[]): Record<string, AddOn[]> {
  const result: Record<string, AddOn[]> = {};
  
  jsonAddons.forEach(service => {
    result[service.serviceId] = service.addons.map((addon: any) => ({
      id: addon.id,
      name: addon.label,
      price: addon.priceZAR,
      estimatedHours: Math.max(0.5, Math.round((addon.priceZAR / 250) * 2) / 2), // Estimate based on R250/hour, rounded to nearest 0.5
      keywords: addon.keywords
    }));
  });
  
  // Add service ID mappings for backward compatibility
  // ADDED: Map alternative service names to primary IDs
  if (result['house-cleaning']) {
    result['cleaning'] = result['house-cleaning'];
  }
  if (result['garden-care']) {
    result['garden-maintenance'] = result['garden-care'];
  }
  if (result['waitering']) {
    result['event-staff'] = result['waitering'];
  }
  
  return result;
}

// ADDED: New comprehensive add-ons sourced from JSON configuration
export const serviceAddOns: Record<string, AddOn[]> = transformAddons(addonsData);

// Function to suggest add-ons based on keywords in comment
export function suggestAddOns(serviceCategory: string, comment: string): AddOn[] {
  const addons = serviceAddOns[serviceCategory] || [];
  const lowerComment = comment.toLowerCase();
  
  return addons.filter(addon => 
    addon.keywords.some(keyword => lowerComment.includes(keyword))
  );
}
