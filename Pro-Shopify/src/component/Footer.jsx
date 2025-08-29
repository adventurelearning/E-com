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
        productsSections: [],
        companySections: [],
        socialLinks: []
      });
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-gradient-to-r from-white-900 to-white-800 text-black-200 p-8">Loading footer...</div>;
  }

  return (
    <footer className="bg-gradient-to-r from-white-900 to-white-800 text-black-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Contact Us Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-black mb-4 relative pb-2 after:content-[''] 
            after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#d10024]">
              Contact Us
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="mt-1 mr-3 text-[#d10024]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" 
                  fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 
                    010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{footerData.companyName}</p>
                  <p>{footerData.addressLine1}</p>
                  <p>{footerData.addressLine2}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaEnvelope className="text-[#d10024] mr-3" />
                <a href={`mailto:${footerData.email}`} className="hover:text-[#d10024] transition-colors">
                  {footerData.email}
                </a>
              </div>
              
              <div className="flex items-center">
                <FaPhoneAlt className="text-[#d10024] mr-3" />
                <a href={`tel:${footerData.phone}`} className="hover:text-[#d10024] transition-colors">
                  {footerData.phone}
                </a>
              </div>
              
              <button className="flex items-center mt-4 bg-[#d10024] hover:bg-[#d10024] text-white 
              px-2 py-3 rounded-lg transition-all transform hover:-translate-y-1">
                <FaCommentAlt className="mr-2" />
                <span>{footerData.chatButtonText}</span>
              </button>
            </div>
          </div>

          {/* Products Sections */}
          {footerData.productsSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-xl font-bold text-black mb-4 relative pb-2 after:content-[''] 
              after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#d10024]">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <a 
                    key={linkIndex} 
                    href={link.url} 
                    className="hover:text-[#d10024] transition-colors flex items-center group block"
                  >
                    <FaArrowRight className="mr-2 text-xs text-[#d10024] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between 
        items-center">
          <div className="text-black-400 text-sm mb-4 md:mb-0">
            {footerData.copyrightText.replace('{year}', new Date().getFullYear())}
          </div>
          <div className="flex space-x-6">
            {footerData.socialLinks && footerData.socialLinks.map((social, index) => (
              <a 
                key={index} 
                href={social.url} 
                className="text-black-400 hover:text-[#d10024] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img 
                  src={social.imageUrl} 
                  alt={social.platform} 
                  className="w-5 h-5 object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;