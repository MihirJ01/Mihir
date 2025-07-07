import { Button } from "@/components/ui/button";

const ContactSection = () => {
  return (
    <section className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Section */}
        <div className="text-center mb-16 pb-16 border-b border-gray-700">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          {/* Contact phone number display instead of input/button */}
          <div className="flex flex-col items-center justify-center mt-8">
            <span className="text-lg sm:text-2xl font-bold text-blue-400 mb-2">Contact Us</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white bg-blue-700 px-6 py-3 rounded-xl shadow-lg tracking-wide">+91 98679 12899</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
