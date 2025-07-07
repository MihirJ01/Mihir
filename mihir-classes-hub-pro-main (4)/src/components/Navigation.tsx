import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Capacitor } from '@capacitor/core';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-us');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-md">
              <img 
                src="/lovable-uploads/ae5781fb-b384-4333-b465-3fca780bb394.png"
                alt="MihirClasses Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              MihirClasses
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/app'}>
              Log in
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={scrollToContact}>
              About
            </Button>
            {!isNative && (
              <a
                href="/MihirClasses.apk"
                className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow text-sm transition"
                download
              >
                Download App
              </a>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2 px-3 pt-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => window.location.href = '/app'}>
                  Log in
                </Button>
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={scrollToContact}>
                  About
                </Button>
                {!isNative && (
                  <a
                    href="/MihirClasses.apk"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow text-sm transition text-center"
                    download
                  >
                    Download App
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
