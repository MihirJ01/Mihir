
import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Class 12 Student",
      content: "MihirClasses transformed my understanding of Physics. The interactive sessions and personalized attention helped me score 95% in my boards!",
      avatar: "👩‍🎓",
      rating: 5
    },
    {
      name: "Arjun Patel",
      role: "JEE Aspirant",
      content: "The live classes and doubt-solving sessions are incredible. I improved my rank by 2000 positions in just 6 months!",
      avatar: "👨‍🎓",
      rating: 5
    },
    {
      name: "Sneha Reddy",
      role: "NEET Candidate",
      content: "The chemistry courses are so well-structured. Complex topics became easy to understand with their teaching methodology.",
      avatar: "👩‍⚕️",
      rating: 5
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Students <span className="text-blue-600">Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful students who achieved their academic goals with us
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full">
            <span className="font-semibold">4.8/5 Average Rating</span>
            <span className="ml-2">• 10,000+ Happy Students</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
