import React, { useState, useEffect } from 'react';
import Api from '../Services/Api';

const Offer = () => {
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    price: '',
    discountPrice: '',
    link: '',
    bannerImageUrl: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await Api.get('/offers');
      setOffers(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Failed to fetch offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', UPLOAD_PRESET);
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: uploadData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        bannerImageUrl: data.secure_url
      }));
      
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      bannerImageUrl: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bannerImageUrl && !editingId) {
      setError('Please upload an image first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const offerData = {
        title: formData.title,
        subtitle: formData.subtitle,
        price: formData.price,
        discountPrice: formData.discountPrice,
        link: formData.link,
        bannerImage: formData.bannerImageUrl
      };

      if (editingId) {
        if (!formData.bannerImageUrl) {
          delete offerData.bannerImage;
        }
        await Api.put(`/offers/${editingId}`, offerData);
        setSuccess('Offer updated successfully!');
      } else {
        await Api.post('/offers', offerData);
        setSuccess('Offer created successfully!');
      }
      
      setTimeout(() => setSuccess(''), 3000);
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      setError('Failed to save offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title,
      subtitle: offer.subtitle,
      price: offer.price,
      discountPrice: offer.discountPrice,
      link: offer.link,
      bannerImageUrl: offer.bannerImage
    });
    setEditingId(offer._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      setLoading(true);
      await Api.delete(`/offers/${id}`);
      setSuccess('Offer deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      setError('Failed to delete offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      price: '',
      discountPrice: '',
      link: '',
      bannerImageUrl: ''
    });
    setEditingId(null);
    setError('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Offers</h1>
      
      {/* Status Messages */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError('')} className="absolute top-0 right-0 p-3">
            <span className="text-red-700">&times;</span>
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{success}</span>
          <button onClick={() => setSuccess('')} className="absolute top-0 right-0 p-3">
            <span className="text-green-700">&times;</span>
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editingId ? 'Edit Offer' : 'Add New Offer'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter offer title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle *</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter offer subtitle"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link *</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="https://example.com/offer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image {!editingId && '*'}
              </label>
              
              {formData.bannerImageUrl ? (
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                  <img 
                    src={formData.bannerImageUrl} 
                    alt="Preview" 
                    className="h-40 w-full object-contain mx-auto rounded-md mb-2" 
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 transition"
                  >
                    Remove Image
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Image ready to be saved with your offer</p>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                  <svg 
                    className="mx-auto h-12 w-12 text-gray-400" 
                    stroke="currentColor" 
                    fill="none" 
                    viewBox="0 0 48 48" 
                    aria-hidden="true"
                  >
                    <path 
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                  <div className="mt-4 flex justify-center text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload an image</span>
                      <input
                        type="file"
                        name="bannerImage"
                        onChange={handleFileChange}
                        className="sr-only"
                        accept="image/*"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  {uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">Uploading image...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
              disabled={uploading || loading || (!formData.bannerImageUrl && !editingId)}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingId ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingId ? 'Update Offer' : 'Add Offer'
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Current Offers</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'}
          </span>
        </div>
        
        {loading && !offers.length ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No offers</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new offer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {offer.bannerImage ? (
                        <img 
                          src={offer.bannerImage} 
                          alt={offer.title} 
                          className="h-16 w-auto object-cover rounded-md shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-24 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                      <div className="text-sm text-gray-500">{offer.subtitle}</div>
                      <div className="text-xs text-blue-500 truncate max-w-xs">{offer.link}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 line-through">${offer.price}</div>
                      <div className="text-sm font-bold text-red-600">${offer.discountPrice}</div>
                      {offer.price > 0 && (
                        <div className="text-xs text-green-600">
                          {Math.round((1 - offer.discountPrice / offer.price) * 100)}% off
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offer;