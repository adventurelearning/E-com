import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Api from '../../Services/Api';

const PendingProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [remarks, setRemarks] = useState('');
  
  useEffect(() => {
    const fetchPendingProducts = async () => {
      try {
        console.log(
          'Fetching pending products from API...'
        );
        
        const { data } = await Api.get('supplier-products/pending');
        console.log('Pending Products:', data);
        
        setProducts(data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load pending products');
        setLoading(false);
      }
    };
    
    fetchPendingProducts();
  }, []);

  const handleApprove = async (id) => {
    try {
      await Api.post(`supplier-products/approve/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product approved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving product');
    }
  };

  const openRejectModal = (product) => {
    setSelectedProduct(product);
    setRemarks('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedProduct) return;
    
    try {
      await Api.post(`supplier-products/reject/${selectedProduct._id}`, { remarks });
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      toast.success('Product rejected successfully');
      setShowRejectModal(false);
    } catch (err) {
      toast.error('Error rejecting product');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pending Products</h1>
          <p className="text-gray-600 mt-1">Review and approve supplier products</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mt-4">No pending products</h3>
          <p className="text-gray-500 mt-2">All supplier products have been reviewed</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.images[0] && (
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
                      {product.addedBy?.name ? (
                        <div className="text-sm text-gray-900">{product.addedBy.name}</div>
                      ) : (
                        <span className="text-sm text-gray-500">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{product.category}</div>
                      <div className="text-sm text-gray-500">{product.subcategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.discountPrice.toFixed(2)}
                        <span className="ml-2 text-xs text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-red-600">
                        {product.discountPercent}% off
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleApprove(product._id)}
                          className="text-green-600 hover:text-green-800 flex items-center group"
                          title="Approve product"
                        >
                          <div className="p-1.5 rounded-lg group-hover:bg-green-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </button>
                        <button
                          onClick={() => openRejectModal(product)}
                          className="text-red-600 hover:text-red-800 flex items-center group"
                          title="Reject product"
                        >
                          <div className="p-1.5 rounded-lg group-hover:bg-red-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM9 4a1 1 0 00.894.553L10 5.382l.106-.21A1 1 0 0011 4h2.382l-.724 1.447a1 1 0 00.106 1.01l3 5a1 1 0 01.106.45V15a1 1 0 01-1 1H5a1 1 0 01-1-1v-3.043a1 1 0 01.106-.45l3-5a1 1 0 00.106-1.01L4.618 6H7a1 1 0 00.894-.553L8 5.382l.106-.21A1 1 0 009 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Reject Product</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-red-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to reject <strong className="font-semibold">{selectedProduct.name}</strong>?
                </p>
                
                <div className="w-full mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide reason for rejection..."
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-sm hover:from-red-700 hover:to-orange-700"
              >
                Reject Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProductsPage;