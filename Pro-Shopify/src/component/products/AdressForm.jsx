import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Api from '../../Services/Api';
import { toast } from 'react-toastify';
import {
  FiX, FiHome, FiBriefcase, FiMapPin, FiUser, FiPhone, FiMail
} from 'react-icons/fi';

const AddressForm = ({ onSave, onClose, initialData = {} }) => {
  const formik = useFormik({
    initialValues: {
      fullName: initialData.fullName || '',
      phone: initialData.phone || '',
      street: initialData.street || '',
      city: initialData.city || '',
      state: initialData.state || '',
      postalCode: initialData.postalCode || '',
      country: initialData.country || 'India',
      label: initialData.label || 'Home',
      isDefault: initialData.isDefault || false,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required('Full name is required'),
      phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number')
        .required('Phone number is required'),
      street: Yup.string().required('Street address is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      postalCode: Yup.string()
        .matches(/^\d{6}$/, 'Postal code must be 6 digits')
        .required('Postal code is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to continue');
          return;
        }

        await Api.post('/users/addresses', values, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast.success('Address saved successfully!');
        if (onSave) onSave();
        if (onClose) onClose();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to save address');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue } = formik;

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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Label Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {['Home', 'Work', 'Other'].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFieldValue('label', label)}
                  className={`flex items-center justify-center py-2 px-3 rounded-lg border transition-colors ${
                    values.label === label
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
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  placeholder="John Doe"
                />
              </div>
              {touched.fullName && errors.fullName && (
                <div className="text-red-500 text-sm mt-1">{errors.fullName}</div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  placeholder="+91 9876543210"
                />
              </div>
              {touched.phone && errors.phone && (
                <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
              )}
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <textarea
                name="street"
                value={values.street}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="123 Main St, Apartment 4B"
              />
              {touched.street && errors.street && (
                <div className="text-red-500 text-sm mt-1">{errors.street}</div>
              )}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Mumbai"
                />
                {touched.city && errors.city && (
                  <div className="text-red-500 text-sm mt-1">{errors.city}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  name="state"
                  value={values.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Maharashtra"
                />
                {touched.state && errors.state && (
                  <div className="text-red-500 text-sm mt-1">{errors.state}</div>
                )}
              </div>
            </div>

            {/* Postal Code & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  name="postalCode"
                  value={values.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="400001"
                />
                {touched.postalCode && errors.postalCode && (
                  <div className="text-red-500 text-sm mt-1">{errors.postalCode}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <div className="relative">
                  <input
                    name="country"
                    value={values.country}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  />
                  <FiMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Default Address Toggle */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                name="isDefault"
                checked={values.isDefault}
                onChange={() => setFieldValue('isDefault', !values.isDefault)}
                className="h-4 w-4 text-[#d10024] focus:ring-[#d10024] border-gray-300 rounded"
              />
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">Set as default address</label>
                <p className="text-gray-500">Use this as your primary shipping address</p>
              </div>
            </div>

            {/* Submit / Cancel */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-[#d10024] to-[#b10024] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center justify-center min-w-24"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
