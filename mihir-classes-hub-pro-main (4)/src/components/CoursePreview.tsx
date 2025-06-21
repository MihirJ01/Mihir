
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CoursePreview = () => {
  const courses = [
    {
      title: "Advanced Mathematics",
      description: "Master calculus, algebra, and advanced mathematical concepts",
      students: "2,450",
      rating: "4.8",
      price: "₹2,999",
      image: "📐",
      level: "Grade 11-12"
    },
    {
      title: "Physics Fundamentals",
      description: "Understand core physics principles with practical applications",
      students: "1,890",
      rating: "4.9",
      price: "₹2,499",
      image: "⚡",
      level: "Grade 9-10"
    },
    {
      title: "Chemistry Mastery",
      description: "Comprehensive chemistry course from basics to advanced",
      students: "1,650",
      rating: "4.7",
      price: "₹2,799",
      image: "🧪",
      level: "Grade 11-12"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular <span className="text-blue-600">Courses</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our expertly designed courses that help students excel in their academic journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-md"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{course.image}</div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {course.level}
                  </span>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <span>⭐ {course.rating}</span>
                  <span>👥 {course.students} students</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{course.price}</span>
                  <Button className="bg-blue-600 hover:bg-blue-700 group-hover:scale-105 transition-transform">
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursePreview;
