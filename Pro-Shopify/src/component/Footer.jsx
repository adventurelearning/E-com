import React, { useState, useEffect } from "react";
import { FaEnvelope, FaPhoneAlt, FaCommentAlt, FaArrowRight } from "react-icons/fa";
import Api from "../Services/Api";

const Footer = () => {
  const [footerData, setFooterData] = useState({
    companyName: "",
    addressLine1: "",
    addressLine2: "",
    email: "",
    phone: "",
    chatButtonText: "",
    productsSections: [],
    companySections: [],
    copyrightText: "",
    socialLinks: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await Api.get('/footer');
      setFooterData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching footer data:', error);
      // Set default data if API fails
      setFooterData({
        companyName: "Your Company",
        addressLine1: "123 Main Street",
        addressLine2: "City, State 12345",
        email: "info@example.com",
        phone: "+1 (555) 123-4567",
        chatButtonText: "Chat with us",
        copyrightText: "© {year} Your Company. All rights reserved.",
        productsSections: [
          {
            title: "Products",
            links: [
              { text: "Web Development", url: "#" },
              { text: "Mobile Apps", url: "#" },
              { text: "UI/UX Design", url: "#" },
              { text: "Digital Marketing", url: "#" }
            ]
          }
        ],
        companySections: [
          {
            title: "Company",
            links: [
              { text: "About Us", url: "#" },
              { text: "Careers", url: "#" },
              { text: "Blog", url: "#" },
              { text: "Press", url: "#" }
            ]
          }
        ],
        socialLinks: [
          { platform: "Facebook", url: "#", imageUrl: "/facebook-icon.svg" },
          { platform: "Twitter", url: "#", imageUrl: "/twitter-icon.svg" },
          { platform: "Instagram", url: "#", imageUrl: "/instagram-icon.svg" },
          { platform: "LinkedIn", url: "#", imageUrl: "/linkedin-icon.svg" }
        ]
      });
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200 p-8">Loading footer...</div>;
  }

  return (
    <footer className="  bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200">
      <div className="  mx-auto px-8 py-8">
        {/* Top Section - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Contact Us Section */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 relative pb-2 after:content-[''] 
            after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-blue-500">
              Contact Us
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="mt-1 mr-3 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 
                    010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm md:text-base">
                  <p className="font-medium text-white">{footerData.companyName}</p>
                  <p>{footerData.addressLine1}</p>
                  <p>{footerData.addressLine2}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FaEnvelope className="text-blue-500 mr-3 text-sm md:text-base" />
                <a href={`mailto:${footerData.email}`} className="hover:text-blue-500 transition-colors text-sm md:text-base">
                  {footerData.email}
                </a>
              </div>

              <div className="flex items-center">
                <FaPhoneAlt className="text-blue-500 mr-3 text-sm md:text-base" />
                <a href={`tel:${footerData.phone}`} className="hover:text-blue-500 transition-colors text-sm md:text-base">
                  {footerData.phone}
                </a>
              </div>

              <button className="flex items-center mt-4 bg-blue-600 hover:bg-blue-700 text-white 
              px-4 py-3 rounded-lg transition-all transform hover:-translate-y-0.5 w-full md:w-auto justify-center text-sm md:text-base">
                <FaCommentAlt className="mr-2" />
                <span>{footerData.chatButtonText}</span>
              </button>
            </div>
          </div>

          {/* Products Sections */}
          {footerData.productsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mt-8 md:mt-0">
              <h3 className="text-lg md:text-xl font-bold text-white mb-4 relative pb-2 after:content-[''] 
              after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-blue-500">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    className="hover:text-blue-500 transition-colors flex items-center group  text-sm md:text-base"
                  >
                    <FaArrowRight className="mr-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <span className="truncate">{link.text}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Company Sections */}
          {footerData.companySections.map((section, sectionIndex) => (
            <div key={`company-${sectionIndex}`} className="mt-8 md:mt-0">
              <h3 className="text-lg md:text-xl font-bold text-white mb-4 relative pb-2 after:content-[''] 
              after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-blue-500">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    className="hover:text-blue-500 transition-colors flex items-center group text-sm md:text-base"
                  >
                    <FaArrowRight className="mr-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <span className="truncate">{link.text}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter Subscription */}
          {/* <div className="mt-8 md:mt-0">
            <h3 className="text-lg md:text-xl font-bold text-white mb-4 relative pb-2 after:content-[''] 
            after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-blue-500">
              Newsletter
            </h3>
            <p className="text-sm md:text-base mb-4">Subscribe to our newsletter for the latest updates</p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                required
              />
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm md:text-base"
              >
                Subscribe
              </button>
            </form>
          </div> */}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-xs md:text-sm mb-4 md:mb-0 text-center md:text-left">
            {footerData.copyrightText.replace('{year}', new Date().getFullYear())}
          </div>
          <div className="flex space-x-4 md:space-x-6">
            {footerData.socialLinks && footerData.socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.platform}
              >
                <div className="w-6 h-6 md:w-5 md:h-5 flex items-center justify-center">
                  {/* In a real implementation, you would use actual social media icons */}
                  <img src={social.imageUrl} alt={social.platform} className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;