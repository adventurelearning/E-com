import React, { useState } from 'react';
import Api from '../../Services/Api';
import { toast } from 'react-toastify';
import { FiX, FiHome, FiBriefcase, FiMapPin, FiUser, FiPhone, FiMail } from 'react-icons/fi';

const AddressForm = ({ onSave, onClose, initialData = {} }) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    phone: initialData.phone || '',
    street: initialData.street || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || 'India',
    label: initialData.label || 'Home',
    isDefault: initialData.isDefault || false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      await Api.post('/users/addresses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Address saved successfully!');
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'Home': return <FiHome className="mr-2" />;
      case 'Work': return <FiBriefcase className="mr-2" />;
      default: return <FiMapPin className="mr-2" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiMapPin className="mr-2 text-[#d10024]" />
              {initialData._id ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Close"
            >
              <FiX className="text-xl" />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Address Type */}
            <div className="grid grid-cols-3 gap-3">
              {['Home', 'Work', 'Other'].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFormData({...formData, label})}
                  className={`flex items-center justify-center py-2 px-3 rounded-lg border transition-colors ${
                    formData.label === label
                      ? 'border-[#d10024] bg-purple-50 text-[#d10024]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {getLabelIcon(label)}
                  {label}
                </button>
              ))}
            </div>

            {/* Full Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg "
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg "
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <textarea
                name="street"
                value={formData.street}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg "
                placeholder="123 Main St, Apartment 4B"
                required
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg "
                  placeholder="Mumbai"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Maharashtra"
                  required
                />
              </div>
            </div>

            {/* Postal Code & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg  "
                  placeholder="400001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <div className="relative">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <FiMail />
                  </div>
                </div>
              </div>
            </div>

            {/* Default Address Toggle */}
            <div className="flex items-center pt-2">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  id="defaultAddress"
                  className="h-4 w-4 text-[#d10024] focus:ring-[#d10024] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="defaultAddress" className="font-medium text-gray-700">
                  Set as default address
                </label>
                <p className="text-gray-500">Use this as your primary shipping address</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-[#d10024] to-[#b10024] text-white rounded-lg text-sm font-medium hover:from-[#d10024]
                 hover:to-[#b10024] transition-colors disabled:opacity-70 flex items-center justify-center min-w-24"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Address'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;