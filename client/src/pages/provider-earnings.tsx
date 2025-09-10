import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Star,
  Calculator,
  CreditCard,
  PieChart,
  Users,
  Award
} from "lucide-react";

export default function ProviderEarnings() {
  const serviceRates = [
    { service: "House Cleaning", rate: "R120-180/hour", commission: "15%", netRate: "R102-153/hour" },
    { service: "Garden Maintenance", rate: "R100-150/hour", commission: "15%", netRate: "R85-128/hour" },
    { service: "Plumbing Services", rate: "R200-300/hour", commission: "15%", netRate: "R170-255/hour" },
    { service: "Electrical Work", rate: "R250-350/hour", commission: "15%", netRate: "R213-298/hour" },
    { service: "Chef & Catering", rate: "R150-250/hour", commission: "15%", netRate: "R128-213/hour" },
    { service: "Elder Care", rate: "R80-120/hour", commission: "15%", netRate: "R68-102/hour" }
  ];

  const bonusStructure = [
    { metric: "Perfect 5-Star Rating", bonus: "+10% for the month", requirement: "All services rated 5 stars" },
    { metric: "High Volume", bonus: "+5% on 20+ services", requirement: "Complete 20+ services per month" },
    { metric: "Emergency Response", bonus: "+R50 per call", requirement: "Accept emergency service calls" },
    { metric: "Customer Retention", bonus: "+15% on repeat customers", requirement: "Service returning customers" },
    { metric: "Peak Hours", bonus: "+20% during peak", requirement: "Work weekends and evenings" },
    { metric: "Berry Stars Program", bonus: "Up to +15%", requirement: "Maintain Berry Stars status" }
  ];

  const paymentSchedule = [
    { day: "Weekly", description: "Payments processed every Friday for services completed the previous week" },
    { day: "Monthly", description: "Bonuses and incentives paid on the first Friday of each month" },
    { day: "Instant", description: "Emergency services paid within 24 hours of completion" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4" data-testid="page-provider-earnings">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Provider Earnings
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understand how much you can earn as a Berry Events service provider, 
            our commission structure, bonus opportunities, and payment schedules.
          </p>
        </div>

        {/* Earnings Overview */}
        <section className="mb-16">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg text-center">
              <CardContent className="p-6">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-gray-900">R180/hour</div>
                <div className="text-gray-600">Average Earnings</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-gray-900">15%</div>
                <div className="text-gray-600">Platform Commission</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
              <CardContent className="p-6">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <div className="text-2xl font-bold text-gray-900">+15%</div>
                <div className="text-gray-600">Max Bonus Rate</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
              <CardContent className="p-6">
                <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-gray-900">Weekly</div>
                <div className="text-gray-600">Payment Frequency</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Service Rates */}
        <section className="mb-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                Service Rates & Earnings
              </CardTitle>
              <p className="text-gray-600">Competitive rates with transparent commission structure</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Service Type</th>
                      <th className="text-left py-3">Customer Rate</th>
                      <th className="text-left py-3">Commission</th>
                      <th className="text-left py-3">Your Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRates.map((rate, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-medium">{rate.service}</td>
                        <td className="py-3">{rate.rate}</td>
                        <td className="py-3">
                          <Badge variant="outline">{rate.commission}</Badge>
                        </td>
                        <td className="py-3 font-semibold text-green-600">{rate.netRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bonus Structure */}
        <section className="mb-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-600" />
                Bonus & Incentive Structure
              </CardTitle>
              <p className="text-gray-600">Earn extra income through our performance-based bonuses</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {bonusStructure.map((bonus, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{bonus.metric}</h4>
                      <Badge className="bg-green-100 text-green-800">{bonus.bonus}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{bonus.requirement}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Payment Schedule */}
        <section className="mb-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-green-600" />
                Payment Schedule
              </CardTitle>
              <p className="text-gray-600">Reliable, on-time payments you can count on</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentSchedule.map((schedule, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{schedule.day}</h4>
                      <p className="text-gray-600">{schedule.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Earnings Calculator */}
        <section className="mb-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Potential Monthly Earnings</CardTitle>
              <p className="text-gray-600 text-center">Based on different activity levels</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <h4 className="font-bold text-lg mb-2">Part-Time</h4>
                  <p className="text-gray-600 mb-4">10 hours/week</p>
                  <div className="text-3xl font-bold text-green-600 mb-2">R6,800</div>
                  <p className="text-sm text-gray-500">Base earnings per month</p>
                </div>
                <div className="text-center p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
                  <h4 className="font-bold text-lg mb-2">Full-Time</h4>
                  <p className="text-gray-600 mb-4">40 hours/week</p>
                  <div className="text-3xl font-bold text-green-600 mb-2">R27,200</div>
                  <p className="text-sm text-gray-500">Base earnings per month</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h4 className="font-bold text-lg mb-2">With Bonuses</h4>
                  <p className="text-gray-600 mb-4">Full-time + bonuses</p>
                  <div className="text-3xl font-bold text-green-600 mb-2">R31,280</div>
                  <p className="text-sm text-gray-500">Including 15% bonuses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="shadow-lg bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Start Earning Today</h3>
              <p className="text-green-100 mb-6">
                Join thousands of service providers earning reliable income with Berry Events.
              </p>
              <Button 
                className="bg-white text-green-600 hover:bg-gray-100"
                onClick={() => window.location.href = '/provider-onboarding'}
                data-testid="button-start-earning"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Start Earning
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}