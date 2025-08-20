import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddressInputProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  className?: string;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

export default function AddressInput({ value, onChange, placeholder = "Enter your address", className }: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Debounced address search
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Using Nominatim (OpenStreetMap) API for address geocoding
      // Focus on South Africa but allow global search if no SA results
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&countrycodes=za&q=${encodeURIComponent(query)}&accept-language=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // If no South African results, try global search
        if (data.length === 0) {
          const globalResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}&accept-language=en`
          );
          
          if (globalResponse.ok) {
            const globalData = await globalResponse.json();
            setSuggestions(globalData);
            setShowSuggestions(globalData.length > 0);
          }
        } else {
          setSuggestions(data);
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Address search error:', error);
      // Silently fail - user can still type address manually
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for address search
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Available",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address from coordinates using multiple fallbacks
          let address = "";
          let success = false;

          // Try Nominatim first (OpenStreetMap)
          try {
            const nominatimResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
            );
            
            if (nominatimResponse.ok) {
              const nominatimData = await nominatimResponse.json();
              if (nominatimData.display_name) {
                address = nominatimData.display_name;
                success = true;
              }
            }
          } catch (nominatimError) {
            console.log('Nominatim failed, trying fallback...');
          }

          // Fallback to BigDataCloud if Nominatim fails
          if (!success) {
            try {
              const fallbackResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.locality && fallbackData.principalSubdivision) {
                  address = `${fallbackData.locality}, ${fallbackData.principalSubdivision}, ${fallbackData.countryName || 'South Africa'}`;
                  success = true;
                }
              }
            } catch (fallbackError) {
              console.log('Fallback geocoding also failed');
            }
          }

          // If all geocoding fails, use coordinates
          if (!success) {
            address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }

          onChange(address);
          toast({
            title: "Location Found",
            description: success ? "Your address has been filled in." : "Your coordinates have been filled in.",
          });
          
        } catch (error) {
          console.error('Geocoding error:', error);
          // Fallback to coordinates only
          const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          onChange(coordsAddress);
          toast({
            title: "Location Found",
            description: "Your coordinates have been filled in.",
          });
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        // Handle location errors more gracefully - reduce aggressive error messaging
        console.warn("Location detection failed:", error.code);
        
        // Only show toast for permission denied as it's user-actionable
        if (error.code === error.PERMISSION_DENIED) {
          toast({
            title: "Location access needed",
            description: "Allow location access to find your address automatically",
            variant: "default", // Less aggressive than "destructive"
          });
        }
        // For timeouts and other errors, fail silently to avoid user annoyance
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 600000 // 10 minutes cache
      }
    );
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <div className={`relative ${className}`}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="pr-10"
              autoComplete="address-line1"
              data-testid="input-address"
            />
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="shrink-0"
                data-testid="button-get-location"
              >
                <Navigation className={`h-4 w-4 ${isLoadingLocation ? 'animate-pulse' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use my current location</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Address Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id || index}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                onClick={() => selectSuggestion(suggestion)}
                data-testid={`suggestion-${index}`}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {suggestion.display_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}