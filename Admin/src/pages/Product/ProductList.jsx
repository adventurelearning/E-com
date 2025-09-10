// src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiList, FiEye, FiMoreVertical } from 'react-icons/fi';
import Api from '../../Services/Api';
import { FaComments } from 'react-icons/fa';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: productsData } = await Api.get('/products');
        
        setProducts(productsData.products || []);
        setFilteredProducts(productsData.products || []);

        // Fetch categories with subcategories
        const { data: categoriesData } = await Api.get('/categories');
        setCategories(categoriesData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let results = products;

    if (searchTerm) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      results = results.filter(product =>
        product.category === selectedCategory
      );
    }

    if (selectedSubcategory !== 'All') {
      results = results.filter(product =>
        product.subcategory === selectedSubcategory
      );
    }

    setFilteredProducts(results);
  }, [searchTerm, selectedCategory, selectedSubcategory, products]);

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await Api.delete(`/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const allCategories = ['All', ...new Set(products.map(product => product.category))];
  const allSubcategories = ['All', ...new Set(products.map(product => product.subcategory))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Product Inventory</h2>
          {/* <button
            className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all text-white"
            onClick={() => navigate(-1)}
          >
            Back
          </button> */}
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-purple-800 mb-4 md:mb-0">All Products</h1>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/categories')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center text-sm"
              >
                <FiList className="mr-2" /> Categories
              </button>
              <Link
                to="/add-product"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 flex items-center text-sm"
              >
                <FiPlus className="mr-2" /> Add Product
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-3 mb-4">Search & Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-600">
                  <FiSearch className="text-xl" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('All');
                  }}
                >
                  <option value="All">All Categories</option>
                  {allCategories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={selectedCategory === 'All'}
                >
                  <option value="All">All Subcategories</option>
                  {selectedCategory !== 'All' && allSubcategories.filter(sub => sub !== 'All').map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto bg-purple-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <FiSearch className="text-purple-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-purple-800">No products found</h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-purple-800">Product</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-purple-800">Category</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-purple-800">SKU</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-purple-800">Price</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-purple-800">Stock</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-purple-800">Status</th>
                      <th className="py-3 px-4 text-center text-sm font-semibold text-purple-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {filteredProducts.map(product => (
                      <tr key={product._id} className="hover:bg-purple-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-purple-100 flex items-center justify-center">
                              {product.images?.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 object-cover"
                                />
                              ) : (
                                <div className="text-purple-400 text-xs text-center">No Image</div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          <div>{product.category}</div>
                          {product.subcategory && (
                            <div className="text-xs text-gray-500">{product.subcategory}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{product.sku || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-purple-700">
                            ₹{product.discountPrice?.toFixed(2) || product.originalPrice?.toFixed(2)}
                          </div>
                          {product.originalPrice > product.discountPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{product.originalPrice?.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{product.stock}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => navigate(`/product/${product._id}`)}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded-full hover:bg-purple-100"
                              title="Edit Product"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => navigate(`/product/${product._id}/reviews`)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                              title="View Reviews"
                            >
                              <FaComments size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                              title="Delete Product"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredProducts.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;