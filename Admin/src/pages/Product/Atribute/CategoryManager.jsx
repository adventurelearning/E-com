// src/components/CategoryManager.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiX, FiPlus, FiSave, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiImage, FiArrowLeft } from 'react-icons/fi';
import Api from '../../../Services/Api';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    imageUrl: '',
    subcategories: [],
    visibleInMenu: true,
    order: 0
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await Api.get('/categories');
        setCategories(data);

        // Initialize expanded state for each category
        const expanded = {};
        data.forEach(cat => {
          expanded[cat._id] = false;
        });
        setExpandedCategories(expanded);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

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
      formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return data.secure_url;
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

      const { data } = await Api.post('/categories', categoryData);

      setCategories([...categories, data]);
      toast.success('Category added successfully');

      // Reset form
      setNewCategory({
        name: '',
        imageUrl: '',
        subcategories: [],
        visibleInMenu: true,
        order: 0
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
      visibleInMenu: category.visibleInMenu,
      order: category.order
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

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-800 mb-4 md:mb-0">Category Management</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center font-medium"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-lg hover:opacity-90 flex items-center font-medium"
          >
            <FiPlus className="mr-2" /> Add Category
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category._id} className="border border-purple-200 rounded-lg overflow-hidden">
            <div
              className="flex justify-between items-center p-4 bg-purple-50 cursor-pointer"
              onClick={() => toggleCategory(category._id)}
            >
              <div className="flex items-center">
                {category.imageUrl && (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-12 h-12 rounded-md object-cover mr-4 border border-purple-300"
                  />
                )}
                <span className="font-bold text-lg text-purple-800">{category.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCategory(category);
                  }}
                  className="p-2 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category._id);
                  }}
                  className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                >
                  <FiTrash2 size={18} />
                </button>
                {expandedCategories[category._id] ? (
                  <FiChevronUp className="text-purple-600 text-xl" />
                ) : (
                  <FiChevronDown className="text-purple-600 text-xl" />
                )}
              </div>
            </div>

            {expandedCategories[category._id] && (
              <div className="bg-white p-4 border-t border-purple-100">
                <h4 className="font-medium text-gray-700 mb-3">Subcategories</h4>
                {category.subcategories.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No subcategories found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.subcategories.map(subcategory => (
                      <div
                        key={subcategory._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="font-medium text-gray-700">{subcategory.name}</span>
                        <button
                          onClick={() => handleDeleteSubcategory(category._id, subcategory._id)}
                          className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex justify-between items-center bg-purple-700 text-white rounded-t-xl">
              <h3 className="text-xl font-bold">Add New Category</h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
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
                onClick={() => setShowAddCategoryModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                disabled={uploadingImage}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={uploadingImage || !newCategory.name.trim()}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center font-medium"
              >
                <FiSave className="mr-2" /> Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
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
    </div>
  );
};

export default CategoryManager;