import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download } from "lucide-react";

interface AppStoreCardsProps {
  className?: string;
}

export default function AppStoreCards({ className = "" }: AppStoreCardsProps) {
  const handleiOSDownload = () => {
    // In production, this would redirect to the actual App Store URL
    window.open('https://apps.apple.com/app/berry-events/id123456789', '_blank');
  };

  const handleAndroidDownload = () => {
    // In production, this would redirect to the actual Google Play Store URL
    window.open('https://play.google.com/store/apps/details?id=com.berryevents.app', '_blank');
  };

  return (
    <div className={`grid md:grid-cols-2 gap-4 ${className}`}>
      {/* iOS App Store Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Download for iOS</h3>
                  <p className="text-blue-100 text-sm">Available on the App Store</p>
                </div>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Get the full Berry Events experience on your iPhone or iPad
              </p>
              <Button 
                onClick={handleiOSDownload}
                variant="outline" 
                className="bg-white text-blue-600 border-white hover:bg-blue-50"
                data-testid="button-ios-download"
              >
                <Download className="h-4 w-4 mr-2" />
                App Store
              </Button>
            </div>
            <div className="hidden sm:flex flex-col items-center text-white/60 ml-4">
              <svg className="w-16 h-16 mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-xs">iOS</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Android Google Play Store Card */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Download for Android</h3>
                  <p className="text-green-100 text-sm">Available on Google Play</p>
                </div>
              </div>
              <p className="text-green-100 text-sm mb-4">
                Get the full Berry Events experience on your Android device
              </p>
              <Button 
                onClick={handleAndroidDownload}
                variant="outline" 
                className="bg-white text-green-600 border-white hover:bg-green-50"
                data-testid="button-android-download"
              >
                <Download className="h-4 w-4 mr-2" />
                Google Play
              </Button>
            </div>
            <div className="hidden sm:flex flex-col items-center text-white/60 ml-4">
              <svg className="w-16 h-16 mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <span className="text-xs">Android</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}