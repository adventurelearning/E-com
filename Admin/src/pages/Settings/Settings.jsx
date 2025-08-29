import React from 'react';
import { Link } from 'react-router-dom';

const Settings = () => {
  // Sample settings data - can be extended in the future
  const settingsSections = [
    // {
    //   title: "Appearance",
    //   description: "Customize how your application looks and feels",
    //   icon: "🎨",
    //   link: "/theme",
    //   color: "bg-blue-100 text-blue-800"
    // },
    {
      title: "Notifications",
      description: "Manage how you receive alerts and updates",
      icon: "🔔",
      link: "/notifications",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Privacy & Security",
      description: "Control your privacy and security settings",
      icon: "🔒",
      link: "/privacy",
      color: "bg-red-100 text-red-800"
    },
    {
      title: "Account",
      description: "Update your account information and preferences",
      icon: "👤",
      link: "/account",
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Language",
      description: "Set your preferred language and region",
      icon: "🌐",
      link: "/language",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      title: "Accessibility",
      description: "Adjust accessibility options and display settings",
      icon: "♿",
      link: "/accessibility",
      color: "bg-indigo-100 text-indigo-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your application preferences and configuration</p>
        </div>
        
        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className={`w-14 h-14 rounded-lg ${section.color} flex items-center justify-center text-2xl mb-4`}>
                {section.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{section.title}</h3>
              <p className="text-gray-600 mb-4">{section.description}</p>
              <Link 
                to={section.link}
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200"
              >
                Configure
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;