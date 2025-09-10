import React, { useState, useEffect } from 'react';
import Api from '../Services/Api';

const AdminFooter = () => {
  const [footerData, setFooterData] = useState({
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    email: '',
    phone: '',
    chatButtonText: '',
    productsSections: [],
    copyrightText: '',
    socialLinks: []
  });
  
  const [newProductSection, setNewProductSection] = useState({ title: '', links: [] });
  const [productLinkInputs, setProductLinkInputs] = useState({});
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '', image: null, imageUrl: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await Api.get('/footer');
      setFooterData(response.data);
      setEditingId(response.data._id);
      
      // Initialize link inputs for each section
      const initialInputs = {};
      response.data.productsSections.forEach((_, index) => {
        initialInputs[index] = { text: '', url: '' };
      });
      setProductLinkInputs(initialInputs);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching footer data:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFooterData({
      ...footerData,
      [name]: value
    });
  };

  // Product Sections Functions
  const handleAddProductSection = () => {
    if (newProductSection.title) {
      const updatedSections = [...footerData.productsSections, newProductSection];
      setFooterData({
        ...footerData,
        productsSections: updatedSections
      });
      
      // Add input state for the new section
      setProductLinkInputs({
        ...productLinkInputs,
        [updatedSections.length - 1]: { text: '', url: '' }
      });
      
      setNewProductSection({ title: '', links: [] });
    }
  };

  const handleRemoveProductSection = (index) => {
    const updatedSections = [...footerData.productsSections];
    updatedSections.splice(index, 1);
    setFooterData({
      ...footerData,
      productsSections: updatedSections
    });
    
    // Remove input state for the deleted section
    const updatedInputs = {...productLinkInputs};
    delete updatedInputs[index];
    
    // Reindex the remaining inputs
    const reindexedInputs = {};
    Object.keys(updatedInputs).forEach((key, newIndex) => {
      reindexedInputs[newIndex] = updatedInputs[key];
    });
    
    setProductLinkInputs(reindexedInputs);
  };

  const handleProductLinkInputChange = (sectionIndex, field, value) => {
    setProductLinkInputs({
      ...productLinkInputs,
      [sectionIndex]: {
        ...productLinkInputs[sectionIndex],
        [field]: value
      }
    });
  };

  const handleAddProductLink = (sectionIndex) => {
    const linkInput = productLinkInputs[sectionIndex];
    if (linkInput.text && linkInput.url) {
      const updatedSections = [...footerData.productsSections];
      updatedSections[sectionIndex].links.push({
        text: linkInput.text,
        url: linkInput.url
      });
      
      setFooterData({
        ...footerData,
        productsSections: updatedSections
      });
      
      // Clear the input fields for this section
      setProductLinkInputs({
        ...productLinkInputs,
        [sectionIndex]: { text: '', url: '' }
      });
    }
  };

  const handleRemoveProductLink = (sectionIndex, linkIndex) => {
    const updatedSections = [...footerData.productsSections];
    updatedSections[sectionIndex].links.splice(linkIndex, 1);
    
    setFooterData({
      ...footerData,
      productsSections: updatedSections
    });
  };

  // Social Links Functions
  const handleSocialLinkInputChange = (e) => {
    const { name, value } = e.target;
    setNewSocialLink({
      ...newSocialLink,
      [name]: value
    });
  };

  const handleSocialImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size must be less than 2MB');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: uploadFormData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      setNewSocialLink(prev => ({
        ...prev,
        imageUrl: data.secure_url
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSocialLink = () => {
    if (newSocialLink.platform && newSocialLink.url && newSocialLink.imageUrl) {
      const updatedSocialLinks = [...footerData.socialLinks, {
        platform: newSocialLink.platform,
        url: newSocialLink.url,
        imageUrl: newSocialLink.imageUrl
      }];
      
      setFooterData({
        ...footerData,
        socialLinks: updatedSocialLinks
      });
      
      setNewSocialLink({ platform: '', url: '', image: null, imageUrl: '' });
      setUploadError('');
    }
  };

  const handleRemoveSocialLink = (index) => {
    const updatedSocialLinks = [...footerData.socialLinks];
    updatedSocialLinks.splice(index, 1);
    
    setFooterData({
      ...footerData,
      socialLinks: updatedSocialLinks
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing footer
        await Api.put(`/footer/${editingId}`, footerData);
        setMessage('Footer updated successfully!');
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          setMessage('');
        }, 3000);
      } else {
        // Create new footer
        await Api.post('/footer', footerData);
        setMessage('Footer created successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving footer:', error);
      setMessage('Error saving footer. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete the footer? This action cannot be undone.')) {
      try {
        await Api.delete(`/footer/${editingId}`);
        setMessage('Footer deleted successfully!');
        // Reset form
        setFooterData({
          companyName: '',
          addressLine1: '',
          addressLine2: '',
          email: '',
          phone: '',
          chatButtonText: '',
          productsSections: [],
          copyrightText: '',
          socialLinks: []
        });
        setProductLinkInputs({});
        setEditingId(null);
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting footer:', error);
        setMessage('Error deleting footer. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-base">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Footer Content Management</h1>
      
      {message && (
        <div className={`p-3 mb-4 rounded text-sm md:text-base ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSuccessPopup(false)}></div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl z-10 transform transition-all duration-300 scale-100 opacity-100 w-full max-w-xs md:max-w-md">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full mx-auto mb-3 md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 text-center mb-2">Success!</h3>
            <p className="text-gray-600 text-center text-sm md:text-base">Footer updated successfully.</p>
            <button 
              className="mt-3 md:mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full text-sm md:text-base"
              onClick={() => setShowSuccessPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Contact Us Section */}
        <div className="bg-white p-4 md:p-6 rounded shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Contact Us Section</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={footerData.companyName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={footerData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={footerData.addressLine1}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={footerData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={footerData.addressLine2}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Chat Button Text</label>
              <input
                type="text"
                name="chatButtonText"
                value={footerData.chatButtonText}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        {/* Products Sections */}
        <div className="bg-white p-4 md:p-6 rounded shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Link Sections</h2>
          
          {footerData.productsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4 md:mb-6 p-3 md:p-4 border rounded">
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <h3 className="text-base md:text-lg font-medium">{section.title}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveProductSection(sectionIndex)}
                  className="text-red-600 px-2 py-1 md:px-3 md:py-1 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Remove Section
                </button>
              </div>
              
              {section.links.map((link, linkIndex) => (
                <div key={linkIndex} className="flex items-center mb-1 md:mb-2 ml-2 md:ml-4 p-1 md:p-2 bg-gray-50 rounded">
                  <span className="mr-1 md:mr-2 font-medium text-xs md:text-sm">{link.text}</span>
                  <span className="text-gray-600 text-xs md:text-sm truncate flex-1">{link.url}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProductLink(sectionIndex, linkIndex)}
                    className="ml-2 md:ml-4 text-red-600 hover:text-red-800 text-xs md:text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <div className="mt-2 md:mt-4 ml-2 md:ml-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">Link Text</label>
                  <input
                    type="text"
                    placeholder="Link Text"
                    value={productLinkInputs[sectionIndex]?.text || ''}
                    onChange={(e) => handleProductLinkInputChange(sectionIndex, 'text', e.target.value)}
                    className="w-full p-2 border rounded text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">URL</label>
                  <input
                    type="text"
                    placeholder="URL"
                    value={productLinkInputs[sectionIndex]?.url || ''}
                    onChange={(e) => handleProductLinkInputChange(sectionIndex, 'url', e.target.value)}
                    className="w-full p-2 border rounded text-xs md:text-sm"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleAddProductLink(sectionIndex)}
                    className="bg-blue-500 text-white px-2 py-1 md:px-4 md:py-2 rounded hover:bg-blue-600 transition-colors w-full text-xs md:text-sm"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 md:mt-6 p-3 md:p-4 border rounded">
            <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Add New Link Section</h3>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <input
                type="text"
                placeholder="Section Title"
                value={newProductSection.title}
                onChange={(e) => setNewProductSection({...newProductSection, title: e.target.value})}
                className="p-2 border rounded flex-grow text-xs md:text-sm"
              />
              <button
                type="button"
                onClick={handleAddProductSection}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-xs md:text-sm"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="bg-white p-4 md:p-6 rounded shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Social Media Links</h2>
          
          {footerData.socialLinks.map((social, index) => (
            <div key={index} className="mb-3 md:mb-4 p-3 md:p-4 border rounded flex items-center justify-between">
              <div className="flex items-center">
                <img src={social.imageUrl} alt={social.platform} className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 object-contain" />
                <div>
                  <p className="font-medium text-xs md:text-sm">{social.platform}</p>
                  <p className="text-xs md:text-sm text-gray-600 truncate max-w-xs">{social.url}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSocialLink(index)}
                className="text-red-600 hover:text-red-800 text-xs md:text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="mt-4 md:mt-6 p-3 md:p-4 border rounded">
            <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Add New Social Media Link</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1">Platform Name</label>
                <input
                  type="text"
                  name="platform"
                  value={newSocialLink.platform}
                  onChange={handleSocialLinkInputChange}
                  placeholder="e.g., Facebook, Twitter"
                  className="w-full p-2 border rounded text-xs md:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  name="url"
                  value={newSocialLink.url}
                  onChange={handleSocialLinkInputChange}
                  placeholder="https://example.com"
                  className="w-full p-2 border rounded text-xs md:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1">Icon Image</label>
                <div className="flex flex-col">
                  <input
                    type="file"
                    onChange={handleSocialImageUpload}
                    className="w-full p-2 border rounded text-xs"
                    accept="image/*"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="mt-1 md:mt-2 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-blue-500 mr-1 md:mr-2"></div>
                      <span className="text-xs md:text-sm text-blue-600">Uploading...</span>
                    </div>
                  )}
                  {uploadError && (
                    <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-600">{uploadError}</p>
                  )}
                  {newSocialLink.imageUrl && (
                    <div className="mt-1 md:mt-2">
                      <p className="text-xs md:text-sm font-medium">Preview:</p>
                      <img src={newSocialLink.imageUrl} alt="Preview" className="w-6 h-6 md:w-8 md:h-8 mt-1 object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="mt-3 md:mt-4 bg-blue-500 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-blue-600 transition-colors text-xs md:text-sm"
              disabled={!newSocialLink.platform || !newSocialLink.url || !newSocialLink.imageUrl || uploading}
            >
              Add Social Link
            </button>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="bg-white p-4 md:p-6 rounded shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Copyright Section</h2>
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1">Copyright Text</label>
            <input
              type="text"
              name="copyrightText"
              value={footerData.copyrightText}
              onChange={handleInputChange}
              className="w-full p-2 border rounded text-xs md:text-sm"
              placeholder="Use {year} for dynamic year"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            {editingId ? 'Update Footer' : 'Create Footer'}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 rounded font-medium hover:bg-red-700 transition-colors text-sm md:text-base"
            >
              Delete Footer
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminFooter;