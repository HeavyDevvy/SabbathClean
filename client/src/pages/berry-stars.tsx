import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Award, 
  TrendingUp, 
  Gift, 
  Crown,
  Zap,
  Target,
  Users,
  DollarSign,
  Calendar
} from "lucide-react";

export default function BerryStars() {
  const tiers = [
    {
      name: "Rising Star",
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      requirement: "Complete 10 services with 4.5+ rating",
      benefits: ["5% bonus on completed services", "Priority customer matching", "Basic provider support"],
      color: "yellow"
    },
    {
      name: "Shining Star", 
      icon: <Award className="h-8 w-8 text-blue-600" />,
      requirement: "Complete 50 services with 4.7+ rating",
      benefits: ["10% bonus on completed services", "Featured provider listing", "Premium customer matching", "Dedicated account manager"],
      color: "blue"
    },
    {
      name: "Super Star",
      icon: <Crown className="h-8 w-8 text-purple-600" />,
      requirement: "Complete 200 services with 4.8+ rating",
      benefits: ["15% bonus on completed services", "Top provider placement", "VIP customer support", "Berry Stars merchandise", "Quarterly bonus opportunities"],
      color: "purple"
    }
  ];

  const rewards = [
    {
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      title: "Performance Bonuses",
      description: "Earn extra income based on your service quality and customer satisfaction ratings"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Priority Matching",
      description: "Get priority access to high-value customers and premium service requests"
    },
    {
      icon: <Gift className="h-6 w-6 text-purple-600" />,
      title: "Exclusive Perks",
      description: "Access to provider events, training workshops, and special recognition programs"
    },
    {
      icon: <Target className="h-6 w-6 text-orange-600" />,
      title: "Growth Support",
      description: "Business development resources, marketing support, and expansion opportunities"
    }
  ];

  const achievements = [
    { name: "Perfect Week", description: "Complete 7 services in a week with 5-star ratings", points: 500 },
    { name: "Customer Favorite", description: "Receive 10 customer compliments in a month", points: 300 },
    { name: "Safety Champion", description: "Complete 100 services with zero safety incidents", points: 750 },
    { name: "Training Master", description: "Complete all advanced training modules", points: 400 },
    { name: "Speed Demon", description: "Complete services 20% faster than average", points: 250 },
    { name: "Reliability Star", description: "100% on-time completion rate for 30 days", points: 600 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4" data-testid="page-berry-stars">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full flex items-center justify-center">
              <Star className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Berry Stars Program
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our exclusive rewards program for exceptional service providers. 
            Earn bonuses, unlock benefits, and grow your business with Berry Events.
          </p>
        </div>

        {/* Star Tiers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Star Tiers</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <Card key={index} className={`shadow-lg border-2 ${
                tier.color === 'yellow' ? 'border-yellow-200' :
                tier.color === 'blue' ? 'border-blue-200' : 'border-purple-200'
              }`}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {tier.icon}
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <p className="text-gray-600">{tier.requirement}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tier.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Rewards Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Program Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewards.map((reward, index) => (
              <Card key={index} className="shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {reward.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{reward.title}</h3>
                  <p className="text-gray-600 text-sm">{reward.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
                Achievement System
              </CardTitle>
              <p className="text-gray-600 text-center">Unlock special badges and earn bonus points</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <Badge variant="outline">{achievement.points} pts</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Become a Berry Star?</h3>
              <p className="text-blue-100 mb-6">
                Join our rewards program and start earning bonuses for exceptional service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => window.location.href = '/provider-onboarding'}
                  data-testid="button-join-program"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Join the Program
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => window.location.href = '/provider-dashboard'}
                  data-testid="button-view-dashboard"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}