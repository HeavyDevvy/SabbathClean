import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import berryLogo from "@assets/PHOTO-2025-07-11-15-55-28_1755621947509.jpg";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img src={berryLogo} alt="Berry Events Logo" className="w-full h-full object-cover" />
              </div>
              <span className="ml-3 text-xl font-bold">Berry Events</span>
            </div>
            <p className="mt-4 text-gray-300 max-w-md">
              Premium domestic services with verified professionals. Your home, our priority.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" data-testid="link-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" data-testid="link-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" data-testid="link-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" data-testid="link-linkedin">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">House Cleaning</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Deep Cleaning</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Home Maintenance</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Garden Care</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; 2024 Berry Events. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
