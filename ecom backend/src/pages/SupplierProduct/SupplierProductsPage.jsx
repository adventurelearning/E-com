import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Api from '../../Services/Api';
import { getAdminInfo } from '../../utils/auth';

const SupplierProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const {id}=getAdminInfo();
  console.log(id);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await Api.get(`/supplier-products/myproducts/${id}`);
        console.log('Fetched Products:', data);
        
        setProducts(data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load products');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await Api.delete(`/supplier-products/${selectedProduct._id}`);
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
            <p className="text-gray-600 mt-1">Manage your submitted products</p>
          </div>
          <Link 
            to="/Add-SProduct" 
            className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-2.5 px-5 rounded-lg flex items-center transition-all"
          >
            <FiPlus className="mr-2" /> Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto"></div>
            <h3 className="text-xl font-medium text-gray-700 mt-4">No products submitted yet</h3>
            <p className="text-gray-500 mt-2">Get started by adding your first product</p>
            <Link 
              to="/Add-SProduct" 
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPlus className="mr-1" /> Create First Product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.images?.[0] && (
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{product.category}</div>
                        <div className="text-sm text-gray-500">{product.subcategory}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          ₹{product.discountPrice.toFixed(2)}
                          {product.originalPrice > product.discountPrice && (
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              ₹{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {product.discountPercent > 0 && (
                          <div className="text-xs text-green-600">
                            {product.discountPercent}% OFF
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                        {product.status === 'rejected' && product.adminRemarks && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs">
                            {product.adminRemarks}
                          </div>
                        )}
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-red-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete this product?
                </p>
                <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                <p className="text-red-600 mt-4 text-sm bg-red-50 py-2 px-4 rounded-lg">
                  This action cannot be undone. All product data will be permanently removed.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-sm hover:from-red-700 hover:to-orange-700"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProductsPage;