import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiPlus } from 'react-icons/fi';

import { toast } from 'react-toastify';
import Api from '../../Services/Api';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await  Api.get('/adminUsers');
    const onlySuppliers = response.data.filter(user => user.role === 'supplier');
    setSuppliers(onlySuppliers);    
  } catch (error) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await Api.patch(`/adminUsers/${id}/status`);
      toast.success('Status updated successfully');
      fetchSuppliers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await Api.delete(`/adminUsers/${id}`);
        toast.success('Supplier deleted successfully');
        fetchSuppliers();
      } catch (error) {
        toast.error('Failed to delete supplier');
      }
    }
  };

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { 
      key: 'role', 
      title: 'Role',
      render: (item) => (
        <span className="capitalize">{item.role}</span>
      )
    },
    { 
      key: 'isActive', 
      title: 'Status',
      render: (item) => <StatusBadge isActive={item.isActive} />
    },
    { 
      key: 'createdAt', 
      title: 'Joined',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    },
      {
    key: 'viewProducts',
    title: 'Products',
    render: (item) => (
      <button
        onClick={() => window.location.href = `/supplier-products/${item._id}`}
        title="View Products"
        className="text-blue-600 hover:text-blue-800 flex gap-2"
      >
        <FiBox className="text-lg" /> 
        <p>View Products</p>
      </button>
    )
  }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Suppliers</h2>
        <Link 
          to="/add-supplier" 
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <FiPlus className="mr-2" /> Add New Supplier
        </Link>
      </div>
      
      <DataTable 
        data={suppliers}
        columns={columns}
        onEdit={(supplier) => window.location = `/edit-supplier/${supplier._id}`}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default SupplierList;