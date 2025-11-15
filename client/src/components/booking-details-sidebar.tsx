import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar as CalendarIcon, Clock, User, Home } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface BookingDetailsSidebarProps {
  serviceName: string;
  serviceIcon: React.ElementType;
  address?: string;
  propertyType?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedHours?: number;
  totalCost?: number;
  showCost?: boolean;
}

export default function BookingDetailsSidebar({
  serviceName,
  serviceIcon: Icon,
  address,
  propertyType,
  scheduledDate,
  scheduledTime,
  estimatedHours = 0,
  totalCost = 0,
  showCost = true
}: BookingDetailsSidebarProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not selected";
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return "Not selected";
    return time;
  };

  return (
    <Card className="bg-card border-border shadow-sm sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold text-foreground">
            Booking Details
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Service</div>
          <div className="text-sm font-semibold text-foreground">{serviceName}</div>
        </div>

        <Separator />

        {/* Address */}
        {address && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="text-xs font-medium text-muted-foreground">Where</div>
              </div>
              <div className="text-sm text-foreground line-clamp-2">{address}</div>
              {propertyType && (
                <div className="text-xs text-muted-foreground mt-1 capitalize">{propertyType}</div>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Date & Time */}
        {(scheduledDate || scheduledTime) && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="text-xs font-medium text-muted-foreground">When</div>
              </div>
              <div className="text-sm text-foreground">{formatDate(scheduledDate)}</div>
              {scheduledTime && (
                <div className="text-xs text-muted-foreground mt-1">{formatTime(scheduledTime)}</div>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Estimated Hours */}
        {estimatedHours > 0 && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="text-xs font-medium text-muted-foreground">Duration</div>
              </div>
              <div className="text-sm text-foreground">
                {estimatedHours} {estimatedHours === 1 ? 'hour' : 'hours'}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Total Cost (Footer) */}
        {showCost && totalCost > 0 && (
          <div className="bg-foreground text-background p-4 -mx-6 -mb-6 mt-6 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Total</div>
              <div className="text-xl font-bold">{formatCurrency(totalCost)}</div>
            </div>
            <div className="text-xs opacity-75 mt-1">Estimated booking cost</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
