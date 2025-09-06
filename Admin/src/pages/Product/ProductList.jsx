// src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiChevronDown, FiChevronUp, FiImage, FiSave, FiList } from 'react-icons/fi';
import Api from '../../Services/Api';
import { FaComments } from 'react-icons/fa';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const navigate = useNavigate();

  // States for modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

  // Category states
  const [newCategory, setNewCategory] = useState({
    name: '',
    imageUrl: '',
    subcategories: [],
    visibleInMenu: true, // New field
    order: 0            // New field
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [progress, setProgress] = useState(0);

  // Data states
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Get full image URL
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_IMAGE_UPLOAD_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: productsData } = await Api.get('/products');
        setProducts(productsData);
        setFilteredProducts(productsData);

        // Fetch categories with subcategories
        const { data: categoriesData } = await Api.get('/categories');
        setCategories(categoriesData);

        // Initialize expanded state for each category
        const expanded = {};
        categoriesData.forEach(cat => {
          expanded[cat._id] = false;
        });
        setExpandedCategories(expanded);

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
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle image selection for category
  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload image with progress tracking
  const uploadImage = async () => {
    if (!categoryImage) return null;

    try {
      setUploadingImage(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', categoryImage);
      formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET); // Add upload preset

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          // Note: Cloudinary doesn't support progress tracking in the same way
          // You might need to use a different approach for progress tracking
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return data.secure_url; // Cloudinary returns secure_url instead of location
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle category creation
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      const imageUrl = await uploadImage();

      const categoryData = {
        ...newCategory,
        imageUrl: imageUrl || '',
        visibleInMenu: newCategory.visibleInMenu,
        order: newCategory.order
      };
      console.log('Adding category:', categoryData);


      const { data } = await Api.post('/categories', categoryData);

      setCategories([...categories, data]);
      toast.success('Category added successfully');

      // Reset form
      setNewCategory({
        name: '',
        imageUrl: '',
        subcategories: [],

      });
      setNewSubcategoryName('');
      setCategoryImage(null);
      setCategoryImagePreview('');
      setShowAddCategoryModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  // Add subcategory to the new category
  const handleAddSubToNewCategory = () => {
    if (!newSubcategoryName.trim()) {
      toast.error('Subcategory name cannot be empty');
      return;
    }

    setNewCategory(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, { name: newSubcategoryName }]
    }));
    setNewSubcategoryName('');
  };

  // Handle category edit
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      imageUrl: category.imageUrl,
      subcategories: category.subcategories,
      visibleInMenu: category.visibleInMenu, // New field
      order: category.order                  // New field
    });
    if (category.imageUrl) {
      setCategoryImagePreview(category.imageUrl);
    }
    setShowEditCategoryModal(true);
  };

  // Handle category update
  const handleUpdateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      let imageUrl = editingCategory.imageUrl;

      // Only upload new image if one was selected
      if (categoryImage) {
        imageUrl = await uploadImage();
      }

      const categoryData = {
        ...newCategory,
        imageUrl: imageUrl || editingCategory.imageUrl
      };

      const { data } = await Api.put(`/categories/${editingCategory._id}`, categoryData);

      setCategories(categories.map(cat =>
        cat._id === editingCategory._id ? data : cat
      ));

      toast.success('Category updated successfully');
      setShowEditCategoryModal(false);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category and all its subcategories?')) {
      try {
        await Api.delete(`/categories/${categoryId}`);
        setCategories(categories.filter(cat => cat._id !== categoryId));
        toast.success('Category deleted successfully');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  // Handle subcategory deletion
  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await Api.delete(`/categories/${categoryId}/subcategories/${subcategoryId}`);

        // Refresh categories
        const { data: updatedCategories } = await Api.get('/categories');
        setCategories(updatedCategories);

        toast.success('Subcategory deleted successfully');
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        toast.error(error.response?.data?.message || 'Failed to delete subcategory');
      }
    }
  };

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
    <div className="container mx-auto px-3 py-4 bg-gray-50 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="border-b px-4 py-3 flex justify-between items-center bg-purple-700 text-white rounded-t-lg">
              <h3 className="text-lg font-bold">Add New Category</h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm font-medium">Category Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  disabled={uploadingImage}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm font-medium">Category Image</label>
                <div className="relative">
                  <div className="flex items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-md cursor-pointer bg-purple-50 hover:bg-purple-100 overflow-hidden">
                    {categoryImagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={categoryImagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-md"
                        />
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          onClick={(e) => {
                            e.preventDefault();
                            setCategoryImage(null);
                            setCategoryImagePreview('');
                          }}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <FiImage className="w-8 h-8 mb-2 text-purple-400" />
                        <p className="mb-1 text-xs text-gray-500">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF (MAX. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleCategoryImageChange}
                      disabled={uploadingImage}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm font-medium">Subcategories</label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    className="flex-grow px-3 py-2 border border-purple-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                    placeholder="Enter subcategory name"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                  />
                  <button
                    onClick={handleAddSubToNewCategory}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-r-md flex items-center text-sm"
                  >
                    <FiPlus className="mr-1" /> Add
                  </button>
                </div>

                {newCategory.subcategories.length > 0 ? (
                  <div className="bg-purple-50 rounded-md p-2 border border-purple-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {newCategory.subcategories.map((sub, index) => (
                        <div
                          key={index}
                          className="bg-white border border-purple-200 rounded-sm px-2 py-1 flex items-center justify-between"
                        >
                          <span className="truncate font-medium text-purple-800 text-xs">{sub.name}</span>
                          <button
                            onClick={() => {
                              const updatedSubs = [...newCategory.subcategories];
                              updatedSubs.splice(index, 1);
                              setNewCategory({ ...newCategory, subcategories: updatedSubs });
                            }}
                            className="text-red-500 hover:text-red-700 ml-1"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 rounded-md p-4 text-center border-2 border-dashed border-purple-200">
                    <p className="text-purple-500 text-sm">No subcategories added yet</p>
                  </div>
                )}
              </div>

              {uploadingImage && (
                <div className="mb-4 p-3 bg-purple-50 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-purple-700 font-medium text-sm">Uploading image...</span>
                    <span className="text-purple-700 font-bold text-sm">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm font-medium">Menu Visibility</label>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newCategory.visibleInMenu}
                      onChange={(e) => setNewCategory({
                        ...newCategory,
                        visibleInMenu: e.target.checked
                      })}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    <span className="ml-2 text-xs font-medium text-gray-900">
                      {newCategory.visibleInMenu ? 'Visible in Menu' : 'Hidden in Menu'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm font-medium">Display Order</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                  placeholder="Lower numbers appear first"
                  value={newCategory.order}
                  onChange={(e) => setNewCategory({
                    ...newCategory,
                    order: parseInt(e.target.value) || 0
                  })}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Categories are sorted by this number (ascending)
                </p>
              </div>
            </div>

            <div className="border-t px-4 py-3 flex justify-end gap-2 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium text-sm"
                disabled={uploadingImage}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={uploadingImage || !newCategory.name.trim()}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center font-medium text-sm"
              >
                <FiSave className="mr-1" /> Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal - Similar structure to Add Modal with reduced sizes */}
      {showEditCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex justify-between items-center bg-purple-700 text-white rounded-t-xl">
              <h3 className="text-xl font-bold">Edit Category</h3>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Category Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  disabled={uploadingImage}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Category Image</label>
                <div className="relative">
                  <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 overflow-hidden">
                    {categoryImagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={categoryImagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <button
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          onClick={(e) => {
                            e.preventDefault();
                            setCategoryImage(null);
                            setCategoryImagePreview('');
                          }}
                        >
                          <FiX size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiImage className="w-10 h-10 mb-3 text-purple-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF (MAX. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleCategoryImageChange}
                      disabled={uploadingImage}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Subcategories</label>
                <div className="flex mb-3">
                  <input
                    type="text"
                    className="flex-grow px-4 py-3 border border-purple-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter subcategory name"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                  />
                  <button
                    onClick={handleAddSubToNewCategory}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-r-lg flex items-center"
                  >
                    <FiPlus className="mr-1" /> Add
                  </button>
                </div>

                {newCategory.subcategories.length > 0 ? (
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {newCategory.subcategories.map((sub, index) => (
                        <div
                          key={index}
                          className="bg-white border border-purple-200 rounded-md px-3 py-2 flex items-center justify-between"
                        >
                          <span className="truncate font-medium text-purple-800">{sub.name}</span>
                          <button
                            onClick={() => {
                              const updatedSubs = [...newCategory.subcategories];
                              updatedSubs.splice(index, 1);
                              setNewCategory({ ...newCategory, subcategories: updatedSubs });
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 rounded-lg p-6 text-center border-2 border-dashed border-purple-200">
                    <p className="text-purple-500">No subcategories added yet</p>
                  </div>
                )}
              </div>

              {uploadingImage && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-700 font-medium">Uploading image...</span>
                    <span className="text-purple-700 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* NEW: Visible In Menu Toggle */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Menu Visibility</label>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newCategory.visibleInMenu}
                      onChange={(e) => setNewCategory({
                        ...newCategory,
                        visibleInMenu: e.target.checked
                      })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {newCategory.visibleInMenu ? 'Visible in Menu' : 'Hidden in Menu'}
                    </span>
                  </label>
                </div>
              </div>

              {/* NEW: Order Input */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Display Order</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Lower numbers appear first"
                  value={newCategory.order}
                  onChange={(e) => setNewCategory({
                    ...newCategory,
                    order: parseInt(e.target.value) || 0
                  })}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Categories are sorted by this number (ascending)
                </p>
              </div>

            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                disabled={uploadingImage}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                disabled={uploadingImage || !newCategory.name.trim()}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center font-medium"
              >
                <FiSave className="mr-2" /> Update Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="border-b px-4 py-3 flex justify-between items-center bg-purple-700 text-white rounded-t-lg">
              <h3 className="text-lg font-bold">Manage Categories</h3>
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowAddCategoryModal(true);
                    setShowCategoriesModal(false);
                  }}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center font-medium text-sm"
                >
                  <FiPlus className="mr-1" /> Add New Category
                </button>
              </div>

              <div className="space-y-3">
                {categories.map(category => (
                  <div key={category._id} className="border border-purple-200 rounded-md overflow-hidden">
                    <div
                      className="flex justify-between items-center p-3 bg-purple-50 cursor-pointer"
                      onClick={() => toggleCategory(category._id)}
                    >
                      <div className="flex items-center">
                        {category.imageUrl && (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-10 h-10 rounded object-cover mr-3 border border-purple-300"
                          />
                        )}
                        <span className="font-bold text-base text-purple-800">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                            setShowCategoriesModal(false);
                          }}
                          className="p-1 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category._id);
                          }}
                          className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          <FiTrash2 size={16} />
                        </button>
                        {expandedCategories[category._id] ? (
                          <FiChevronUp className="text-purple-600 text-lg" />
                        ) : (
                          <FiChevronDown className="text-purple-600 text-lg" />
                        )}
                      </div>
                    </div>

                    {expandedCategories[category._id] && (
                      <div className="bg-white p-3 border-t border-purple-100">
                        <h4 className="font-medium text-gray-700 mb-2 text-sm">Subcategories</h4>
                        {category.subcategories.length === 0 ? (
                          <div className="text-center py-3 text-gray-500 text-sm">
                            No subcategories found
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2">
                            {category.subcategories.map(subcategory => (
                              <div
                                key={subcategory._id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                              >
                                <span className="font-medium text-gray-700 text-sm">{subcategory.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-purple-800 mb-3 md:mb-0">Product Inventory</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center font-medium text-sm"
          >
            <FiList className="mr-1" /> View Categories
          </button>
          <Link
            to="/add-product"
            className="px-3 py-1.5 bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-md hover:opacity-90 flex items-center font-medium text-sm"
          >
            <FiPlus className="mr-1" /> Add Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-600">
            <FiSearch className="text-lg" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
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
            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
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

      <div>
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-purple-200">
            <div className="mx-auto bg-purple-100 rounded-full p-3 w-14 h-14 flex items-center justify-center">
              <FiSearch className="text-purple-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold mt-3 text-purple-800">No products found</h3>
            <p className="text-gray-500 mt-1 text-sm">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-purple-100">
                <div className="relative">
                  {product.images?.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="bg-purple-50 w-full h-36 flex items-center justify-center">
                      <span className="text-purple-400 text-sm">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description }}></p>

                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-base font-bold text-purple-700">
                      ₹{product.discountPrice?.toFixed(2)}
                    </span>
                    {product.originalPrice > product.discountPrice && (
                      <>
                        <span className="text-gray-400 line-through text-xs">
                          ₹{product.originalPrice?.toFixed(2)}
                        </span>
                        <span className="bg-green-100 text-green-600 px-1 py-0.5 text-xs rounded font-semibold">
                          {product.discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    <p className="truncate">
                      <span className="font-medium text-purple-700">{product.category}</span>
                      {product.subcategory && ` / ${product.subcategory}`}
                    </p>
                    {product.brand && (
                      <p className="text-xs text-gray-400">Brand: {product.brand}</p>
                    )}
                  </div>

                  {product.colors?.length > 0 && (
                    <div className="flex gap-0.5 mb-2">
                      {product.colors.slice(0, 3).map((color, index) => (
                        <span key={index} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {color}
                        </span>
                      ))}
                      {product.colors.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                          +{product.colors.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-row gap-1">
                    {/* Edit Button */}
                    <button
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="px-2 py-1 bg-white border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 flex items-center justify-center text-xs"
                    >
                      <FiEdit2 className="mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="px-2 py-1 bg-red-50 border border-red-500 text-red-500 rounded-md hover:bg-red-100 flex items-center justify-center text-xs"
                    >
                      <FiTrash2 className="mr-1" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>

                    {/* Reviews Button */}
                    <button
                      className="px-2 py-1 bg-blue-50 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 flex items-center justify-center text-xs"
                      onClick={() => navigate(`/product/${product._id}/reviews`)}
                    >
                      <FaComments className="mr-1" />
                      <span className="hidden sm:inline">Reviews</span>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;