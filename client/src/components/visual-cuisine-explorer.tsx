import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChefHat, Star, Clock, Users, Heart, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CuisineData {
  id: string;
  name: string;
  flag: string;
  region: string;
  description: string;
  popularDishes: string[];
  signature: string;
  cookingTime: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  price: number;
  rating: number;
  reviews: number;
  gradient: string;
  popularMenus: {
    name: string;
    items: string[];
    price: number;
    description: string;
    servingSize: string;
  }[];
  culturalInfo: string;
  ingredients: string[];
}

const cuisineData: CuisineData[] = [
  {
    id: "south-african",
    name: "South African Traditional",
    flag: "🇿🇦",
    region: "Southern Africa",
    description: "Rich heritage cuisine blending indigenous traditions with colonial influences, featuring hearty braai culture and farm-style cooking.",
    popularDishes: ["Boerewors", "Bobotie", "Biltong", "Potjiekos", "Koeksisters"],
    signature: "Traditional Braai Experience",
    cookingTime: "3-4 hours",
    difficulty: "Medium",
    price: 850,
    rating: 4.8,
    reviews: 324,
    gradient: "from-green-600 to-yellow-500",
    popularMenus: [
      {
        name: "Traditional Braai",
        items: ["Boerewors", "Lamb Chops", "Chicken", "Pap & Morogo", "Chakalaka", "Potato Salad"],
        price: 850,
        description: "Authentic South African barbecue experience with traditional sides",
        servingSize: "Serves 4-6 people"
      },
      {
        name: "Heritage Feast",
        items: ["Bobotie", "Yellow Rice", "Green Beans", "Sambals", "Milk Tart"],
        price: 920,
        description: "Classic Cape Malay influenced dishes with traditional dessert",
        servingSize: "Serves 4-6 people"
      }
    ],
    culturalInfo: "South African cuisine reflects the country's diverse cultural heritage, with influences from indigenous Khoikhoi, Dutch, British, and Malaysian traditions.",
    ingredients: ["Boerewors spice", "Sosatie spice", "Rooibos", "Samp", "Morogo", "Biltong spice"]
  },
  {
    id: "west-african",
    name: "West African",
    flag: "🌍",
    region: "West Africa",
    description: "Bold, flavorful cuisine featuring aromatic spices, vibrant stews, and the famous Jollof rice traditions from Nigeria, Ghana, and Senegal.",
    popularDishes: ["Jollof Rice", "Fufu", "Suya", "Kelewele", "Bissap"],
    signature: "Nigerian Jollof Rice",
    cookingTime: "2-3 hours",
    difficulty: "Medium",
    price: 950,
    rating: 4.9,
    reviews: 267,
    gradient: "from-orange-600 to-red-500",
    popularMenus: [
      {
        name: "Nigerian Feast",
        items: ["Jollof Rice", "Suya", "Plantain", "Pepper Soup", "Chin Chin"],
        price: 950,
        description: "Authentic Nigerian flavors with spicy grilled meat and traditional sweets",
        servingSize: "Serves 4-6 people"
      },
      {
        name: "Ghanaian Special",
        items: ["Banku", "Tilapia", "Kelewele", "Groundnut Soup", "Fufu"],
        price: 920,
        description: "Traditional Ghanaian comfort food with fermented corn accompaniments",
        servingSize: "Serves 4-6 people"
      }
    ],
    culturalInfo: "West African cuisine is characterized by its use of indigenous grains, vegetables, and spices, with dishes often centered around communal eating.",
    ingredients: ["Scotch bonnet peppers", "Palm oil", "Cassava", "Plantain", "Yam", "Groundnuts"]
  },
  {
    id: "east-african",
    name: "East African",
    flag: "🌍",
    region: "East Africa",
    description: "Diverse culinary traditions featuring Ethiopian injera bread, Kenyan nyama choma, and aromatic spice blends from the Indian Ocean trade routes.",
    popularDishes: ["Injera", "Doro Wat", "Ugali", "Nyama Choma", "Mandazi"],
    signature: "Ethiopian Coffee Ceremony",
    cookingTime: "4-5 hours",
    difficulty: "Advanced",
    price: 940,
    rating: 4.7,
    reviews: 189,
    gradient: "from-amber-600 to-orange-500",
    popularMenus: [
      {
        name: "Ethiopian Experience",
        items: ["Injera", "Doro Wat", "Kitfo", "Vegetarian Combo", "Ethiopian Coffee"],
        price: 940,
        description: "Traditional Ethiopian feast with injera bread and spicy stews",
        servingSize: "Serves 4-6 people"
      },
      {
        name: "Kenyan Safari",
        items: ["Nyama Choma", "Ugali", "Sukuma Wiki", "Pilau Rice", "Mandazi"],
        price: 880,
        description: "Kenyan grilled meats with traditional sides and fried bread",
        servingSize: "Serves 4-6 people"
      }
    ],
    culturalInfo: "East African cuisine showcases the region's position as a crossroads of trade, blending African, Arab, and Indian culinary influences.",
    ingredients: ["Berbere spice", "Teff flour", "Cardamom", "Cinnamon", "Coconut", "Tamarind"]
  },
  {
    id: "north-african",
    name: "North African",
    flag: "🌍",
    region: "North Africa",
    description: "Mediterranean-influenced cuisine featuring aromatic tagines, fluffy couscous, and mint tea traditions from Morocco, Egypt, and Tunisia.",
    popularDishes: ["Tagine", "Couscous", "Harira", "Koshari", "Baklava"],
    signature: "Moroccan Lamb Tagine",
    cookingTime: "3-4 hours",
    difficulty: "Advanced",
    price: 1050,
    rating: 4.9,
    reviews: 412,
    gradient: "from-purple-600 to-pink-500",
    popularMenus: [
      {
        name: "Moroccan Royal",
        items: ["Tagine", "Couscous", "Pastilla", "Harira Soup", "Mint Tea", "Baklava"],
        price: 1050,
        description: "Royal Moroccan dining experience with traditional pastries",
        servingSize: "Serves 4-6 people"
      },
      {
        name: "Egyptian Pharaoh",
        items: ["Koshari", "Molokhia", "Fattah", "Basbousa", "Hibiscus Juice"],
        price: 980,
        description: "Egyptian comfort food with ancient grain dishes and sweets",
        servingSize: "Serves 4-6 people"
      }
    ],
    culturalInfo: "North African cuisine reflects centuries of cultural exchange between Africa, the Mediterranean, and the Middle East.",
    ingredients: ["Ras el hanout", "Preserved lemons", "Argan oil", "Rose water", "Orange blossom", "Harissa"]
  },
  {
    id: "central-african",
    name: "Central African",
    flag: "🌍",
    region: "Central Africa",
    description: "Forest-influenced cuisine featuring cassava, plantain, and river fish, with rich stews and traditional fermented beverages.",
    popularDishes: ["Fufu", "Ndolé", "Banga Soup", "Cassava Bread", "Palm Wine"],
    signature: "Congolese Ndolé Stew",
    cookingTime: "2-3 hours",
    difficulty: "Medium",
    price: 890,
    rating: 4.6,
    reviews: 156,
    gradient: "from-green-700 to-blue-500",
    popularMenus: [
      {
        name: "Congolese Celebration",
        items: ["Fufu", "Ndolé", "Grilled Fish", "Plantain", "Palm Wine"],
        price: 890,
        description: "Traditional Congolese feast with forest vegetables and fresh fish",
        servingSize: "Serves 4-6 people"
      },
      {
        name: "Cameroonian Combo",
        items: ["Jollof Rice", "Pepper Soup", "Banga Soup", "Puff Puff"],
        price: 860,
        description: "Cameroonian specialties with spicy soups and fried dough balls",
        servingSize: "Serves 4-6 people"
      }
    ],
    culturalInfo: "Central African cuisine emphasizes fresh ingredients from the rainforest, with communal cooking and eating traditions.",
    ingredients: ["Cassava leaves", "Palm nuts", "Smoked fish", "Plantain leaves", "Wild spinach", "River fish"]
  }
];

interface VisualCuisineExplorerProps {
  onBookCuisine?: (cuisineId: string) => void;
}

export default function VisualCuisineExplorer({ onBookCuisine }: VisualCuisineExplorerProps) {
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineData | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (cuisineId: string) => {
    setFavorites(prev => 
      prev.includes(cuisineId) 
        ? prev.filter(id => id !== cuisineId)
        : [...prev, cuisineId]
    );
  };

  return (
    <div className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-12 w-12 text-orange-600 mr-3" />
            <h2 className="text-4xl font-bold text-gray-900">Explore African Cuisines</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the rich culinary heritage of Africa through our authentic cuisine specializations. 
            Each region offers unique flavors, traditional cooking methods, and cultural experiences.
          </p>
        </div>

        {/* Interactive Cuisine Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {cuisineData.map((cuisine) => (
            <Card 
              key={cuisine.id} 
              className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0 overflow-hidden"
            >
              <div className={`h-48 bg-gradient-to-r ${cuisine.gradient} relative`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                <div className="absolute top-4 left-4">
                  <span className="text-4xl">{cuisine.flag}</span>
                </div>
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(cuisine.id);
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        favorites.includes(cuisine.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-white'
                      }`} 
                    />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">{cuisine.name}</h3>
                  <p className="text-sm opacity-90">{cuisine.region}</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">{cuisine.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{cuisine.rating}</span>
                      <span className="text-gray-500 text-sm">({cuisine.reviews} reviews)</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {cuisine.difficulty}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {cuisine.cookingTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      From R{cuisine.price}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Popular Dishes:</h4>
                    <div className="flex flex-wrap gap-1">
                      {cuisine.popularDishes.slice(0, 3).map((dish, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {dish}
                        </Badge>
                      ))}
                      {cuisine.popularDishes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{cuisine.popularDishes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="w-full" 
                          onClick={() => setSelectedCuisine(cuisine)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Explore Menus
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-3">
                          <span className="text-3xl">{cuisine.flag}</span>
                          <span className="text-2xl">{cuisine.name}</span>
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 leading-relaxed">{cuisine.culturalInfo}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-lg mb-3">Signature Ingredients</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {cuisine.ingredients.map((ingredient, index) => (
                              <Badge key={index} variant="secondary" className="justify-center">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-lg mb-4">Popular Menu Options</h4>
                          <div className="grid gap-4">
                            {cuisine.popularMenus.map((menu, index) => (
                              <Card key={index} className="border-2 hover:border-primary transition-colors">
                                <CardHeader className="pb-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="text-lg">{menu.name}</CardTitle>
                                      <p className="text-sm text-gray-600 mt-1">{menu.servingSize}</p>
                                    </div>
                                    <span className="text-2xl font-bold text-primary">R{menu.price}</span>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-gray-600 mb-3">{menu.description}</p>
                                  <div className="space-y-2">
                                    <h5 className="font-semibold text-sm">Includes:</h5>
                                    <div className="grid grid-cols-2 gap-1">
                                      {menu.items.map((item, itemIndex) => (
                                        <span key={itemIndex} className="text-sm text-gray-600 flex items-center">
                                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-4 pt-4">
                          <Button 
                            size="lg" 
                            className="flex-1"
                            onClick={() => onBookCuisine?.('chef-catering')}
                          >
                            <ChefHat className="h-5 w-5 mr-2" />
                            Book This Cuisine
                          </Button>
                          <Button 
                            variant="outline" 
                            size="lg"
                            onClick={() => toggleFavorite(cuisine.id)}
                          >
                            <Heart 
                              className={`h-5 w-5 ${
                                favorites.includes(cuisine.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : ''
                              }`} 
                            />
                          </Button>
                        </div>
                      </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      className="w-full"
                      onClick={() => onBookCuisine?.('chef-catering')}
                    >
                      <ChefHat className="h-4 w-4 mr-2" />
                      Book {cuisine.name}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-orange-600">5</div>
            <div className="text-sm text-gray-600">Authentic Cuisines</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-orange-600">50+</div>
            <div className="text-sm text-gray-600">Traditional Dishes</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-orange-600">15+</div>
            <div className="text-sm text-gray-600">Popular Menus</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-orange-600">4.8★</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}