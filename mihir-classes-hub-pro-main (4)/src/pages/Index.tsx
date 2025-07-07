import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { Capacitor } from '@capacitor/core';

const Index = () => {
  const isNative = Capacitor.isNativePlatform();
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <div id="contact-us">
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
