import React from "react";
import { FaEnvelope, FaPhoneAlt, FaCommentAlt, FaArrowRight } from "react-icons/fa";

const Footer = () => {
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
                  <p className="font-medium">Pro-Shopify - Mega Super Store</p>
                  <p>507-Union Trade Centre</p>
                  <p>France</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaEnvelope className="text-[#d10024] mr-3" />
                <a href="mailto:sales@yourcompany.com" className="hover:text-[#d10024]
                transition-colors">
                    sales@yourcompany.com</a>
              </div>
              
              <div className="flex items-center">
                <FaPhoneAlt className="text-[#d10024] mr-3" />
                <a href="tel:+919876543210" className="hover:text-[#d10024] transition-colors">
                    (+91) 0000-000-000</a>
              </div>
              
              <button className="flex items-center mt-4 bg-[#d10024] hover:bg-[#d10024] text-white 
              px-2 py-3 rounded-lg transition-all transform hover:-translate-y-1">
                <FaCommentAlt className="mr-2" />
                <span className="">Online Chat Customer Support</span>
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <h3 className="text-xl font-bold text-black mb-4 relative pb-2 after:content-[''] 
            after:absolute 
            after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#d10024]">
              Products
            </h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-3">
              <a href="#" className="hover:text-[#d10024] transition-colors flex items-center group">
                <FaArrowRight className="mr-2 text-xs text-[#d10024] opacity-0 group-hover:opacity-100
                 transition-opacity" />
                Prices Drop
              </a>
              <a href="#" className="hover:text-[#d10024] transition-colors flex items-center group">
                <FaArrowRight className="mr-2 text-xs text-[#d10024] opacity-0 group-hover:opacity-100
                 transition-opacity" />
                Delivery
              </a>
              <a href="#" className="hover:text-[#d10024] transition-colors flex items-center group">
                <FaArrowRight className="mr-2 text-xs text-[#d10024] opacity-0 group-hover:opacity-100
                 transition-opacity" />
                New Products
              </a>
              <a href="#" className="hover:text-[#d10024] transition-colors flex items-center group">
                <FaArrowRight className="mr-2 text-xs text-[#d10024] opacity-0 group-hover:opacity-100
                 transition-opacity" />
                Best Sales
              </a>
              <a href="#" className="hover:text-[#d10024] transition-colors flex items-center group">
                <FaArrowRight className="mr-2 text-xs text-[#d10024] opacity-0 group-hover:opacity-100 
                transition-opacity" />
                Contact Us
              </a>
            </div>
          </div>

          {/* Our Company Section */}
          <div>
            <h3 className="text-xl font-bold text-black mb-4 relative pb-2 after:content-[''] 
            after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#d10024]">
              Our Company
            </h3>
            <div className="space-y-3">
              {['Delivery', 'Legal Notice', 'Terms And Conditions Of Use', 'About Us', 
              'Secure Payment', 'Login'].map((item) => (
                <a key={item} href="#" className="hover:purple-blue-400 transition-colors 
                flex items-center group block">
                  <FaArrowRight className="mr-2 text-xs text-[#d10024] opacity-0 
                  group-hover:opacity-100 transition-opacity" />
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-xl font-bold text-black mb-4 relative pb-2 after:content-[''] 
            after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#d10024]">
              Subscribe To Newsletter
            </h3>
            <p className="mb-6 text-black-300">
              Subscribe to our latest newsletter to get news about special discounts.
            </p>
            
            <form className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Your Email Address" 
                  className="w-full p-3 pl-4 bg-gray-400 border border-gray-400 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-white"
                  required
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#d10024] hover:bg-[#d10024] text-white font-medium
                 py-3 px-4 rounded-lg transition-all transform hover:-translate-y-1 flex items-center 
                 justify-center"
              >
                SUBSCRIBE
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" 
                fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 
                  4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  id="agreeTerms" 
                  className="mt-1 mr-3 rounded bg-gray-700 border-gray-600 text-[#d10024]
                   focus:ring-[#d10024]"
                  required
                />
                <label htmlFor="agreeTerms" className="text-sm text-black-300">
                  I agree to the terms and conditions and the privacy policy
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between 
        items-center">
          <div className="text-black-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Pro-shopify. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-black-400 hover:text-[#d10024] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 
                9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 
                0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 
                2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-black-400 hover:text-[#d10024] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 
                8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 
                0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 
                0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 
                0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 
                1.84" />
              </svg>
            </a>
            <a href="#" className="text-black-400 hover:text-[#d10024] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 
                2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 
                1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 
                1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 
                1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 
                0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 
                4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3
                .808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1
                .772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685
                 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-
                 .467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 
                 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 
                 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 
                 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-
                 .182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1
                 .37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 
                 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-
                 .047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 
                 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 
                 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;