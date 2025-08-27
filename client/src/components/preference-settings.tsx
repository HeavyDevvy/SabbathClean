import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecommendations, UserPreferences } from "@/hooks/useRecommendations";
import { 
  Settings,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Languages,
  Save,
  RefreshCw
} from "lucide-react";

interface PreferenceSettingsProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferenceSettings({ 
  userId = "demo-user", 
  isOpen, 
  onClose 
}: PreferenceSettingsProps) {
  const { preferences, updatePreferences, isLoading } = useRecommendations(userId);
  const [localPrefs, setLocalPrefs] = useState<UserPreferences | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!localPrefs) return;
    await updatePreferences(localPrefs);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPrefs(preferences);
      setHasChanges(false);
    }
  };

  const updateLocalPref = (key: keyof UserPreferences, value: any) => {
    if (!localPrefs) return;
    setLocalPrefs({ ...localPrefs, [key]: value });
    setHasChanges(true);
  };

  const services = [
    { id: 'house-cleaning', label: 'House Cleaning' },
    { id: 'chef-catering', label: 'Chef & Catering' },
    { id: 'waitering', label: 'Waitering' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'electrical', label: 'Electrical Work' },
    { id: 'garden-care', label: 'Garden Care' }
  ];

  const timeSlots = ['morning', 'afternoon', 'evening', 'night'];
  const languages = ['english', 'afrikaans', 'zulu', 'xhosa', 'sotho'];

  if (!isOpen || !localPrefs) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold">Recommendation Preferences</h2>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Preferred Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Preferred Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {services.map((service) => (
                  <label key={service.id} className="flex items-center space-x-2 cursor-pointer">
                    <Switch
                      checked={localPrefs.preferredServices?.includes(service.id)}
                      onCheckedChange={(checked) => {
                        const current = localPrefs.preferredServices || [];
                        const updated = checked 
                          ? [...current, service.id]
                          : current.filter(s => s !== service.id);
                        updateLocalPref('preferredServices', updated);
                      }}
                    />
                    <span className="text-sm font-medium">{service.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Budget Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Minimum Budget: R{localPrefs.budgetRange?.min || 100}</Label>
                <Slider
                  value={[localPrefs.budgetRange?.min || 100]}
                  onValueChange={([value]) => 
                    updateLocalPref('budgetRange', { 
                      ...localPrefs.budgetRange, 
                      min: value 
                    })
                  }
                  max={2000}
                  min={50}
                  step={50}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Maximum Budget: R{localPrefs.budgetRange?.max || 1000}</Label>
                <Slider
                  value={[localPrefs.budgetRange?.max || 1000]}
                  onValueChange={([value]) => 
                    updateLocalPref('budgetRange', { 
                      ...localPrefs.budgetRange, 
                      max: value 
                    })
                  }
                  max={5000}
                  min={100}
                  step={100}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Timing Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  Location Radius
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label>Search within {localPrefs.locationRadius || 10}km</Label>
                <Slider
                  value={[localPrefs.locationRadius || 10]}
                  onValueChange={([value]) => updateLocalPref('locationRadius', value)}
                  max={50}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Preferred Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeSlots.map((time) => (
                    <label key={time} className="flex items-center space-x-2 cursor-pointer">
                      <Switch
                        checked={localPrefs.preferredTimes?.includes(time)}
                        onCheckedChange={(checked) => {
                          const current = localPrefs.preferredTimes || [];
                          const updated = checked 
                            ? [...current, time]
                            : current.filter(t => t !== time);
                          updateLocalPref('preferredTimes', updated);
                        }}
                      />
                      <span className="text-sm font-medium capitalize">{time}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provider Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Provider Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Minimum Rating: {localPrefs.providerPreferences?.minRating || 4.0}★</Label>
                <Slider
                  value={[localPrefs.providerPreferences?.minRating || 4.0]}
                  onValueChange={([value]) => 
                    updateLocalPref('providerPreferences', { 
                      ...localPrefs.providerPreferences, 
                      minRating: value 
                    })
                  }
                  max={5}
                  min={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Experience Level</Label>
                <Select
                  value={localPrefs.providerPreferences?.experienceLevel || 'any'}
                  onValueChange={(value) => 
                    updateLocalPref('providerPreferences', { 
                      ...localPrefs.providerPreferences, 
                      experienceLevel: value 
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Level</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="experienced">Experienced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Languages</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {languages.map((lang) => (
                    <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                      <Switch
                        checked={localPrefs.providerPreferences?.language?.includes(lang)}
                        onCheckedChange={(checked) => {
                          const current = localPrefs.providerPreferences?.language || [];
                          const updated = checked 
                            ? [...current, lang]
                            : current.filter(l => l !== lang);
                          updateLocalPref('providerPreferences', { 
                            ...localPrefs.providerPreferences, 
                            language: updated 
                          });
                        }}
                      />
                      <span className="text-sm font-medium capitalize">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Frequency Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{service.label}</span>
                    <Select
                      value={localPrefs.serviceFrequency?.[service.id] || 'once'}
                      onValueChange={(value) => 
                        updateLocalPref('serviceFrequency', { 
                          ...localPrefs.serviceFrequency, 
                          [service.id]: value 
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">One-time</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              These preferences help us provide better recommendations for you.
            </p>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}