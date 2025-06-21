
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, BookOpen, Target, Star } from "lucide-react";
import AIAssistant from "./AIAssistant";

const Hero = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-us');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden min-h-screen">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-yellow-50"></div>
      
      {/* Animated Background Shapes */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-yellow-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200 rounded-full opacity-25 animate-bounce delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      
      {/* Floating Icons */}
      <div className="absolute top-32 left-20 animate-float delay-1000">
        <Sparkles className="h-8 w-8 text-yellow-400 opacity-60" />
      </div>
      <div className="absolute top-48 right-32 animate-float delay-2000">
        <BookOpen className="h-6 w-6 text-blue-400 opacity-60" />
      </div>
      <div className="absolute bottom-32 left-32 animate-float delay-500">
        <Target className="h-7 w-7 text-green-400 opacity-60" />
      </div>
      <div className="absolute bottom-48 right-20 animate-float delay-1500">
        <Star className="h-6 w-6 text-purple-400 opacity-60" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[80vh]">
          
          {/* Main Content - Center on mobile, left on desktop */}
          <div className="lg:col-span-5 text-center lg:text-left relative z-10 order-2 lg:order-1">
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Learning 
                <span className="relative inline-block">
                  <span className="bg-yellow-300 px-2 py-1 transform -rotate-1 inline-block animate-pulse">
                    beyond
                  </span>
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-fade-in delay-300">
                  boundaries
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in delay-500">
                An innovative, personalized platform to excel in academics, 
                build skills, and achieve your educational goals.
              </p>
              
              <div className="mb-8 animate-fade-in delay-700">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl" 
                  onClick={scrollToContact}
                >
                  CONTACT US
                  <ArrowDown className="ml-2 h-5 w-5 animate-bounce" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Male Image (Now Larger) */}
          <div className="lg:col-span-4 relative flex justify-center order-1 lg:order-2">
            <div className="relative animate-float">
              {/* Enhanced Vibrant Pop Accent */}
              <div className="absolute -z-10 top-6 left-6 w-80 h-80 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl transform rotate-6 opacity-80 shadow-2xl"></div>
              
              {/* Enhanced Vector-like overlays */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center z-10 animate-pulse shadow-lg">
                <span className="text-3xl">⚡</span>
              </div>
              
              {/* Main Image Container */}
              <div className="relative bg-white p-3 rounded-2xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-105">
                <img 
                  src="/lovable-uploads/3df443c5-1372-4e08-a7f9-ac16c1a1370d.png"
                  alt="Educator"
                  className="w-72 h-96 object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500 filter contrast-110"
                />
              </div>
              
              {/* Enhanced decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-14 h-14 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center z-10 animate-bounce shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              
              <div className="absolute top-12 -left-12 w-6 h-6 bg-yellow-300 rounded-full animate-pulse shadow-md"></div>
              <div className="absolute bottom-16 -right-12 w-8 h-8 bg-blue-300 rounded-full animate-pulse delay-500 shadow-md"></div>
            </div>
          </div>
          
          {/* Female Image (Now Smaller) - Removed circles */}
          <div className="lg:col-span-3 relative flex justify-center order-3">
            <div className="relative animate-float delay-1000">
              {/* Smaller Vibrant Pop Accent */}
              <div className="absolute -z-10 top-4 left-4 w-64 h-64 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl transform -rotate-6 opacity-80 shadow-xl"></div>
              
              {/* Vector-like Enhancement */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center z-10 animate-pulse shadow-md">
                <span className="text-2xl">⭐</span>
              </div>
              
              {/* Main Image Container - Smaller */}
              <div className="relative bg-white p-2 rounded-2xl shadow-xl transform rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-105">
                <img 
                  src="/lovable-uploads/1409b904-b780-421f-a0b0-b8572008cfef.png"
                  alt="Mihir - Educator"
                  className="w-56 h-72 object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500 filter contrast-110"
                />
              </div>
              
              {/* Smaller decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center z-10 animate-bounce delay-500 shadow-md">
                <span className="text-lg">📚</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="bg-white/80 p-3 rounded-full shadow-lg backdrop-blur-sm">
          <ArrowDown className="h-6 w-6 text-gray-600" />
        </div>
      </div>
      
      {/* AI Assistant Component */}
      <AIAssistant />
      
      {/* Additional decorative elements */}
      <div className="absolute top-1/4 left-0 w-2 h-24 bg-gradient-to-b from-blue-400 to-transparent opacity-30"></div>
      <div className="absolute bottom-1/4 right-0 w-2 h-32 bg-gradient-to-t from-yellow-400 to-transparent opacity-30"></div>
    </section>
  );
};

export default Hero;
