import { Star, Award, Briefcase, Code, Users, Mic, BarChart, Cloud, Shield, Cpu, Bot, Database, Laptop, PenTool, GitBranch } from 'lucide-react';

const ZenithMentorPromotion = () => {
  const modules = [
    { title: 'Aptitude Training', icon: <BarChart className="w-8 h-8 text-indigo-500" /> },
    { title: 'Technical Skills Training', icon: <Code className="w-8 h-8 text-green-500" /> },
    { title: 'Combined Technical & Aptitude', icon: <Briefcase className="w-8 h-8 text-purple-500" /> },
  ];

  const technicalCourses = [
    { name: 'C Programming', icon: <Cpu className="w-6 h-6 text-gray-600" /> },
    { name: 'C++', icon: <Cpu className="w-6 h-6 text-gray-600" /> },
    { name: 'Java', icon: <Code className="w-6 h-6 text-red-500" /> },
    { name: 'Python', icon: <Code className="w-6 h-6 text-blue-500" /> },
  ];

  const fullStackCourses = [
    { name: 'Java Full Stack (Spring Boot)', icon: <Code className="w-6 h-6 text-red-500" /> },
    { name: 'Python Full Stack (Django)', icon: <Code className="w-6 h-6 text-blue-500" /> },
    { name: 'MERN Stack', icon: <Database className="w-6 h-6 text-green-500" /> },
    { name: 'MEAN Stack', icon: <Database className="w-6 h-6 text-blue-500" /> },
    { name: '.NET', icon: <Code className="w-6 h-6 text-purple-500" /> },
  ];

  const additionalCourses = [
    { name: 'HTML', icon: <Code className="w-6 h-6 text-orange-500" /> },
    { name: 'CSS', icon: <Code className="w-6 h-6 text-blue-500" /> },
    { name: 'jQuery', icon: <Code className="w-6 h-6 text-blue-400" /> },
    { name: 'JavaScript', icon: <Code className="w-6 h-6 text-yellow-500" /> },
    { name: 'Angular JS', icon: <Code className="w-6 h-6 text-red-600" /> },
    { name: 'React JS', icon: <Code className="w-6 h-6 text-blue-400" /> },
    { name: 'Bootstrap', icon: <Code className="w-6 h-6 text-purple-500" /> },
    { name: 'PHP', icon: <Code className="w-6 h-6 text-indigo-500" /> },
    { name: 'C#', icon: <Code className="w-6 h-6 text-purple-600" /> },
    { name: 'Node.js', icon: <Code className="w-6 h-6 text-green-500" /> },
    { name: 'Flutter', icon: <Code className="w-6 h-6 text-blue-400" /> },
    { name: 'MongoDB', icon: <Database className="w-6 h-6 text-green-600" /> },
    { name: 'MySQL', icon: <Database className="w-6 h-6 text-blue-600" /> },
    { name: 'SQL', icon: <Database className="w-6 h-6 text-gray-600" /> },
    { name: 'AWS', icon: <Cloud className="w-6 h-6 text-orange-500" /> },
    { name: 'Cloud Computing', icon: <Cloud className="w-6 h-6 text-blue-400" /> },
    { name: 'AI & ML', icon: <Bot className="w-6 h-6 text-indigo-500" /> },
    { name: 'Cybersecurity', icon: <Shield className="w-6 h-6 text-red-500" /> },
    { name: 'Web Development', icon: <Laptop className="w-6 h-6 text-gray-600" /> },
  ];

  const nonITCourses = [
    { name: 'Embedded C Programming', icon: <Cpu className="w-6 h-6 text-gray-600" /> },
    { name: 'Embedded Project', icon: <GitBranch className="w-6 h-6 text-gray-600" /> },
    { name: 'PCB Design', icon: <PenTool className="w-6 h-6 text-gray-600" /> },
    { name: 'Matlab', icon: <BarChart className="w-6 h-6 text-gray-600" /> },
    { name: 'AutoCAD', icon: <PenTool className="w-6 h-6 text-gray-600" /> },
  ];

  const specialCourses = [
    { name: 'Data Science', icon: <BarChart className="w-6 h-6 text-blue-500" /> },
    { name: 'Data Analytics', icon: <BarChart className="w-6 h-6 text-green-500" /> },
    { name: 'Business Analytics', icon: <BarChart className="w-6 h-6 text-purple-500" /> },
    { name: 'Google Analytics', icon: <BarChart className="w-6 h-6 text-red-500" /> },
    { name: 'MS Word & Office', icon: <Briefcase className="w-6 h-6 text-blue-600" /> },
    { name: 'Excel & Advance Excel', icon: <Briefcase className="w-6 h-6 text-green-600" /> },
    { name: 'PowerPoint', icon: <Briefcase className="w-6 h-6 text-orange-600" /> },
    { name: 'Power BI', icon: <BarChart className="w-6 h-6 text-yellow-500" /> },
    { name: 'Tableau', icon: <BarChart className="w-6 h-6 text-blue-400" /> },
    { name: 'Tally & Advance Tally', icon: <Briefcase className="w-6 h-6 text-gray-600" /> },
    { name: 'Applied Statistics', icon: <BarChart className="w-6 h-6 text-indigo-500" /> },
  ];

  const services = [
    'Online & Offline Training',
    'Exclusive LMS Access',
    'Aptitude & Technical Test Prep',
    'Mock Interviews & Guidance',
    'Resume Building & Career Gap Assistance',
    'FREE Soft Skills Training',
    'FREE Career Guidance Seminar',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 my-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-600">Zenith Mentor</h1>
        <p className="text-lg text-gray-600 mt-2">Your Gateway to a Your Career Potential!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {modules.map((module, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6 flex flex-col items-center text-center">
            {module.icon}
            <h3 className="text-xl font-semibold text-gray-800 mt-4">{module.title}</h3>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Services</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, index) => (
            <li key={index} className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-3" />
              <span className="text-gray-700">{service}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Courses</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Technical Courses with DSA</h3>
            <div className="flex flex-wrap gap-4">
              {technicalCourses.map((course, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  {course.icon}
                  <span className="ml-2 text-gray-800">{course.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Full Stack Courses</h3>
            <div className="flex flex-wrap gap-4">
              {fullStackCourses.map((course, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  {course.icon}
                  <span className="ml-2 text-gray-800">{course.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Additional Courses</h3>
            <div className="flex flex-wrap gap-4">
              {additionalCourses.map((course, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  {course.icon}
                  <span className="ml-2 text-gray-800">{course.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Non-IT Department Courses</h3>
            <div className="flex flex-wrap gap-4">
              {nonITCourses.map((course, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  {course.icon}
                  <span className="ml-2 text-gray-800">{course.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Special Courses</h3>
            <div className="flex flex-wrap gap-4">
              {specialCourses.map((course, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  {course.icon}
                  <span className="ml-2 text-gray-800">{course.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Internship & Hiring</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-indigo-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-indigo-700 mb-2">Internship</h3>
            <p className="text-gray-700">6-month duration with an experience certificate.</p>
            <p className="text-lg font-bold text-green-600 mt-2">Stipend: ₹15,000/month</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Hiring</h3>
            <p className="text-gray-700">Role: Aptitude Trainer / Soft Skill Trainer</p>
            <p className="text-lg font-bold text-indigo-600 mt-2">Salary: 3 LPA</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
        <p className="text-gray-700">Website: <a href="http://zenithmentor.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">zenithmentor.com</a></p>
        <p className="text-gray-700">Call/WhatsApp: <a href="tel:9080284886" className="text-indigo-600 hover:underline">9080284886</a></p>
        <p className="text-gray-700">Location: Coimbatore</p>
      </div>
    </div>
  );
};

export default ZenithMentorPromotion;