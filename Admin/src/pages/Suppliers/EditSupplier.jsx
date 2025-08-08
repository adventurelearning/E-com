import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Api from '../../Services/Api';

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'supplier',
    permissions: [],
    isActive: true
  });

  const roles = ['admin', 'supplier'];
  const permissionsOptions = [
    'Dashboard',
    'Product Management',
    'Banners',
    'Admin Users',
    'Supplier Management',
    'Suplier',
  ];

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const response = await Api.get(`/adminUsers/${id}`);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          permissions: response.data.permissions || [],
          isActive: response.data.isActive
        });
      } catch (error) {
        toast.error('Failed to load supplier details');
        navigate('/suppliers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSupplier();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await Api.patch(`/adminUsers/${id}`, {
        name: formData.name,
        role: formData.role,
        permissions: formData.permissions
      });
      toast.success('Supplier updated successfully!');
      navigate('/suppliers');
    } catch (error) {
      console.error('Update error:', error);
      const message = error.response?.data?.message || 'Failed to update supplier';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/suppliers')} 
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FiArrowLeft className="mr-1" /> Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Edit Supplier</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Name *</label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'
              }`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
            {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed ${
                errors.email ? 'border-red-500' : ''
              }`}
              name="email"
              value={formData.email}
              readOnly
            />
            <p className="mt-1 text-gray-500 text-sm">Email cannot be changed</p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Role *</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Status</label>
            <div className="flex items-center mt-2">
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="statusToggle"
                  checked={formData.isActive}
                  onChange={() => {}}
                  className="sr-only"
                  disabled
                />
                <div className={`block w-10 h-6 rounded-full ${
                  formData.isActive ? 'bg-green-400' : 'bg-gray-300'
                }`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  formData.isActive ? 'transform translate-x-4' : ''
                }`}></div>
              </div>
              <span className="text-gray-700">
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-1 text-gray-500 text-sm">
              Change status from the suppliers list
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Permissions</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {permissionsOptions.map(permission => (
              <div key={permission} className="flex items-center">
                <input
                  type="checkbox"
                  id={permission}
                  checked={formData.permissions.includes(permission)}
                  onChange={() => handlePermissionChange(permission)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor={permission} className="ml-2 text-gray-700 capitalize">
                  {permission.replace('-', ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/suppliers')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Updating...
              </>
            ) : (
              <>
                <FiSave className="mr-2" /> Update Supplier
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSupplier;