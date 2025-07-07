import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Links */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">MihirClasses</h3>
            <p className="text-gray-400 mb-4">
              Empowering students to achieve academic excellence through innovative online learning.
            </p>
            <div className="flex space-x-4">
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📧</span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📱</span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">🐦</span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📸</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Mathematics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Physics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chemistry</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Biology</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Live Chat</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© 2024 MihirClasses. All rights reserved.</p>
          <p className="text-gray-400 mt-2 md:mt-0">
            Made with ❤️ for students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
