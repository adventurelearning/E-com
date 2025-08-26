import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSave, FiArrowLeft, FiUpload, FiX, FiPlus, FiMinus, FiCalendar } from 'react-icons/fi';
import Api from '../../Services/Api';
import TinyEditor from '../../components/Editor';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [currentColor, setCurrentColor] = useState('');

  const [images, setImages] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    specialPrice: '',
    specialPriceStart: '',
    specialPriceEnd: '',
    category: '',
    subcategory: '',
    brand: '',
    colors: [],
    sizeChart: [],
    stock: '',
    specifications: [],
    featureDescriptions: [],
    ratingAttributes: ['Quality', 'Color', 'Design', 'Size'],
    groupId: '',
  });

  // Cloudinary configuration
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME; // Replace with your Cloudinary cloud name
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET; // Replace with your upload preset

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [images]);

  // Convert UTC ISO string to local datetime string (YYYY-MM-DDTHH:mm)
  const utcToLocalDatetimeString = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date)) return '';

    // Format date in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    async function init() {
      try {
        const catRes = await Api.get('/categories');
        setCategories(catRes.data);

        if (id) {
          const { data } = await Api.get(`/products/${id}`);

          // Map names to IDs
          const categoryObj = catRes.data.find(cat => cat.name === data.category);
          let subcategoryId = '';

          if (categoryObj) {
            const subObj = categoryObj.subcategories.find(sc => sc.name === data.subcategory);
            subcategoryId = subObj?._id || '';
          }

          setProduct({
            name: data.name,
            description: data.description,
            originalPrice: data.originalPrice,
            discountPrice: data.discountPrice,
            specialPrice: data.specialPrice || '',
            specialPriceStart: utcToLocalDatetimeString(data.specialPriceStart),
            specialPriceEnd: utcToLocalDatetimeString(data.specialPriceEnd),
            category: categoryObj?._id || '',
            subcategory: subcategoryId,
            brand: data.brand,
            colors: data.colors || [],
            sizeChart: data.sizeChart || [],
            stock: data.stock,
            specifications: data.specifications || [],
            featureDescriptions: data.featureDescriptions || [],
            ratingAttributes: data.ratingAttributes || ['Quality', 'Color', 'Design', 'Size'],
            groupId: data.groupId || '',
          });

          // Set subcategories for dropdown
          setSubcategories(categoryObj?.subcategories || []);

          // Initialize images
          if (data.images?.length) {
            setImages(data.images.map(img => ({
              url: img,
              serverFilename: img,
              status: 'uploaded'
            })));
          }
        }
      } catch (err) {
        toast.error(id ? 'Failed loading product' : 'Failed loading categories');
        if (id) navigate('/products');
      }
    }
    init();
  }, [id, navigate]);

  const validate = () => {
    const errs = {};
    ['name', 'originalPrice', 'category', 'brand', 'stock'].forEach(f => {
      if (!product[f] || (typeof product[f] === 'string' && !product[f].trim())) errs[f] = 'Required';
    });

    // Description validation
    if (!product.description || product.description.trim() === '<p><br></p>' || product.description.trim() === '') {
      errs.description = 'Description is required';
    }

    if (Number(product.discountPrice) > Number(product.originalPrice)) {
      errs.discountPrice = 'Discounted price must be ≤ original price';
    }

    // Special price validation
    if (product.specialPrice) {
      if (!product.specialPriceStart) errs.specialPriceStart = 'Start date required';
      if (!product.specialPriceEnd) errs.specialPriceEnd = 'End date required';

      if (product.specialPriceStart && product.specialPriceEnd) {
        const startDate = new Date(product.specialPriceStart);
        const endDate = new Date(product.specialPriceEnd);

        if (endDate <= startDate) {
          errs.specialPriceEnd = 'End date must be after start date';
        }

        if (Number(product.specialPrice) >= Number(product.originalPrice)) {
          errs.specialPrice = 'Special price must be less than original price';
        }
      }
    }

    // Check for at least one successfully uploaded image
    const hasValidImages = images.some(img => img.status === 'uploaded');
    if (!hasValidImages) {
      errs.images = 'At least one image is required';
    }

    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEditorChange = (content) => {
    setProduct(prev => ({ ...prev, description: content }));
    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Reset file input
    e.target.value = null;

    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      serverFilename: '',
      status: 'pending',
      file
    }));

    // Add all image previews to UI immediately
    setImages(prev => [...prev, ...newImages]);

    // Upload one-by-one
    for (const img of newImages) {
      await uploadImage(img);
    }

    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
  };

  const uploadImage = async (img) => {
    // Update status to uploading
    setImages(prev =>
      prev.map(i =>
        i.url === img.url ? { ...i, status: 'uploading' } : i
      )
    );

    try {
      const formData = new FormData();
      formData.append('file', img.file);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, 
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      // Update with server URL and filename
      setImages(prev =>
        prev.map(i =>
          i.url === img.url
            ? {
              url: data.secure_url,
              serverFilename: data.secure_url,
              status: 'uploaded'
            }
            : i
        )
      );

      // Clean up blob URL
      URL.revokeObjectURL(img.url);
    } catch (err) {
      setImages(prev =>
        prev.map(i =>
          i.url === img.url ? { ...i, status: 'error' } : i
        )
      );
      toast.error('Image upload failed: ' + err.message);
    }
  };

  const removeImage = (index) => {
    // Revoke blob URL if it exists
    const img = images[index];
    if (img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url);
    }

    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFeatureImage = async (file, featureIndex) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, 
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return data.secure_url;
    } catch (err) {
      toast.error('Feature image upload failed: ' + err.message);
      return null;
    }
  };

  const calcDiscountPercent = (orig, disc) => {
    if (!orig || orig <= disc) return 0;
    return Math.round(((orig - disc) / orig) * 100);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // Convert category ID to name
      const categoryObj = categories.find(cat => cat._id === product.category);
      const categoryName = categoryObj ? categoryObj.name : '';

      // Convert subcategory ID to name
      const subcategoryObj = subcategories.find(sc => sc._id === product.subcategory);
      const subcategoryName = subcategoryObj ? subcategoryObj.name : '';

      // Check if any images are still uploading
      const isUploading = images.some(img =>
        img.status === 'pending' || img.status === 'uploading'
      );

      if (isUploading) {
        toast.error('Please wait for images to finish uploading');
        return;
      }

      // Get only successfully uploaded images
      const finalImages = images
        .filter(img => img.status === 'uploaded')
        .map(img => img.serverFilename);

      const pr = {
        ...product,
        specialPriceStart: product.specialPriceStart
          ? new Date(product.specialPriceStart).toISOString()
          : '',
        specialPriceEnd: product.specialPriceEnd
          ? new Date(product.specialPriceEnd).toISOString()
          : '',
        images: finalImages,
        category: categoryName,
        subcategory: subcategoryName,
        discountPercent: calcDiscountPercent(
          product.originalPrice,
          product.discountPrice
        ),
        ratingAttributes: product.ratingAttributes,
        groupId: product.groupId,
      };

      if (id) {
        await Api.put(`/products/${id}`, pr);
        toast.success('Product updated!');
      } else {
        await Api.post('/products', pr);
        toast.success('Product added!');
      }

      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{id ? 'Edit Product' : 'Add Product'}</h2>
          <button
            className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all"
            onClick={() => navigate('/products')}
          >
            <FiArrowLeft className="text-lg" /> Back to Products
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-3 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    name="name"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input
                    name="brand"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.brand ? 'border-red-500' : 'border-gray-300'
                      }`}
                    value={product.brand}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                  />

                  {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <div className={`border border-gray-300 rounded-lg ${errors.description ? 'border-red-500' : ''}`}>
                    <TinyEditor
                      value={product.description}
                      onChange={handleEditorChange}
                      height={400}
                    />
                  </div>
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group ID</label>
                  <input
                    name="groupId"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={product.groupId}
                    onChange={handleChange}
                    placeholder="Enter group identifier"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Group products together (optional)
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Products are grouped using a <strong>Group ID</strong> to represent color variations.
                    On the frontend, only the first product image from each group is shown to preview the color variant.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-3 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-700">
                      ₹
                    </div>
                    <input
                      name="originalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                        }`}
                      value={product.originalPrice}
                      onChange={handleChange}
                      placeholder="Original price"
                    />
                  </div>
                  {errors.originalPrice && <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>}
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-700">
                      ₹
                    </div>
                    <input
                      name="discountPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.discountPrice ? 'border-red-500' : 'border-gray-300'
                        }`}
                      value={product.discountPrice}
                      onChange={handleChange}
                      placeholder="Discounted price"
                    />
                  </div>
                  {errors.discountPrice && <p className="mt-1 text-sm text-red-600">{errors.discountPrice}</p>}
                </div>

                {/* Special Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-700">
                      ₹
                    </div>
                    <input
                      name="specialPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.specialPrice ? 'border-red-500' : 'border-gray-300'
                        }`}
                      value={product.specialPrice}
                      onChange={handleChange}
                      placeholder="Limited-time offer"
                    />
                  </div>
                  {errors.specialPrice && <p className="mt-1 text-sm text-red-600">{errors.specialPrice}</p>}
                </div>

                {/* Special Price Dates */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Price Start Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-purple-700">
                        <FiCalendar />
                      </div>
                      <input
                        type="datetime-local"
                        name="specialPriceStart"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.specialPriceStart ? 'border-red-500' : 'border-gray-300'
                          }`}
                        value={product.specialPriceStart}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.specialPriceStart && <p className="mt-1 text-sm text-red-600">{errors.specialPriceStart}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Price End Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-purple-700">
                        <FiCalendar />
                      </div>
                      <input
                        type="datetime-local"
                        name="specialPriceEnd"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.specialPriceEnd ? 'border-red-500' : 'border-gray-300'
                          }`}
                        value={product.specialPriceEnd}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.specialPriceEnd && <p className="mt-1 text-sm text-red-600">{errors.specialPriceEnd}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Stock */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-3 mb-4">Category & Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    value={product.category}
                    onChange={e => {
                      handleChange(e);
                      const sel = categories.find(c => c._id === e.target.value);
                      setSubcategories(sel?.subcategories || []);
                      setProduct(prev => ({ ...prev, subcategory: '' }));
                    }}
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory *</label>
                  <select
                    name="subcategory"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.subcategory ? 'border-red-500' : 'border-gray-300'
                      } ${!product.category ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    value={product.subcategory}
                    onChange={handleChange}
                    disabled={!product.category}
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map(sc => (
                      <option key={sc._id} value={sc._id}>{sc.name}</option>
                    ))}
                  </select>
                  {errors.subcategory && <p className="mt-1 text-sm text-red-600">{errors.subcategory}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock *</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                    value={product.stock}
                    onChange={handleChange}
                    placeholder="Total available stock"
                  />
                  {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-3 mb-4">Product Images</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images *</label>
                <div className="flex items-center gap-4">
                  <label
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${images.length >= 5
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                  >
                    <FiUpload className="text-lg" />
                    Select Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                      disabled={images.length >= 5}
                    />
                  </label>
                  <span className="text-sm text-gray-500">
                    {images.length} of 5 images selected
                  </span>
                </div>
                {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
              </div>

              <div className="flex flex-wrap gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative border border-purple-200 rounded-lg p-2 bg-purple-50">
                    <div className="relative">
                      <img
                        src={img.url}
                        className="w-24 h-24 object-contain rounded bg-gray-50"
                        style={{
                          opacity: img.status === 'uploading' ? 0.7 : 1,
                        }}
                        alt="preview"
                      />
                      {img.status === 'uploading' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="absolute inset-0 bg-red-100 bg-opacity-50 flex items-center justify-center rounded">
                          <span className="text-red-600 font-semibold">Error</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      onClick={() => removeImage(i)}
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Max 5 images. Recommended size: 800x800px. Formats: JPG, PNG, WEBP.
              </p>
            </div>

            {/* Colors */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-3 mb-4">Colors</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full">
                      <span>{c}</span>
                      <button
                        type="button"
                        className="text-purple-600 hover:text-purple-800"
                        onClick={() => {
                          const nc = product.colors.filter((_, j) => j !== i);
                          setProduct(prev => ({ ...prev, colors: nc }));
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Add a new color"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={currentColor}
                  onChange={e => setCurrentColor(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                  onClick={() => {
                    if (currentColor.trim()) {
                      setProduct(prev => ({
                        ...prev,
                        colors: [...prev.colors, currentColor.trim()]
                      }));
                      setCurrentColor('');
                    }
                  }}
                >
                  <FiPlus size={18} /> Add
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-800">Specifications</h3>
                <button
                  type="button"
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-200"
                  onClick={() => setProduct(prev => ({
                    ...prev,
                    specifications: [...prev.specifications, { key: '', value: '' }]
                  }))}
                >
                  <FiPlus size={18} /> Add Specification
                </button>
              </div>

              {product.specifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-purple-700">Specification #{i + 1}</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setProduct(prev => ({
                              ...prev,
                              specifications: prev.specifications.filter((_, j) => j !== i)
                            }));
                          }}
                        >
                          <FiX size={18} />
                        </button>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm text-gray-600 mb-1">Key</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g. Material, Weight"
                          value={spec.key}
                          onChange={e => {
                            const tmp = [...product.specifications];
                            tmp[i].key = e.target.value;
                            setProduct(prev => ({ ...prev, specifications: tmp }));
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Value</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g. Cotton, 250g"
                          value={spec.value}
                          onChange={e => {
                            const tmp = [...product.specifications];
                            tmp[i].value = e.target.value;
                            setProduct(prev => ({ ...prev, specifications: tmp }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-purple-50 rounded-lg border border-dashed border-purple-300">
                  <p className="text-purple-500">No specifications added yet</p>
                </div>
              )}
            </div>

            {/* Feature Descriptions */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-800">Feature Descriptions</h3>
                <button
                  type="button"
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-200"
                  onClick={() => setProduct(prev => ({
                    ...prev,
                    featureDescriptions: [...prev.featureDescriptions, { title: '', description: '', image: '' }]
                  }))}
                >
                  <FiPlus size={18} /> Add Feature
                </button>
              </div>

              {product.featureDescriptions.length > 0 ? (
                product.featureDescriptions.map((feature, i) => (
                  <div key={i} className="mb-6 border border-purple-200 rounded-lg p-5 bg-purple-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-purple-700">Feature #{i + 1}</h4>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setProduct(prev => ({
                            ...prev,
                            featureDescriptions: prev.featureDescriptions.filter((_, j) => j !== i)
                          }));
                        }}
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Feature Title *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Feature title"
                        value={feature.title}
                        onChange={e => {
                          const tmp = [...product.featureDescriptions];
                          tmp[i].title = e.target.value;
                          setProduct(prev => ({ ...prev, featureDescriptions: tmp }));
                        }}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows="3"
                        placeholder="Describe this feature in detail..."
                        value={feature.description}
                        onChange={e => {
                          const tmp = [...product.featureDescriptions];
                          tmp[i].description = e.target.value;
                          setProduct(prev => ({ ...prev, featureDescriptions: tmp }));
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Feature Image (Optional)</label>
                      <div className="flex flex-col md:flex-row gap-6">
                        {feature.image ? (
                          <div className="flex-shrink-0 relative">
                            <img
                              src={feature.image}
                              className="w-48 h-32 object-contain rounded-lg border border-purple-200 bg-white"
                              alt="feature"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              onClick={() => {
                                const tmp = [...product.featureDescriptions];
                                tmp[i].image = '';
                                setProduct(prev => ({ ...prev, featureDescriptions: tmp }));
                              }}
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-shrink-0">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`feature-image-${i}`}
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                // Reset input
                                e.target.value = null;

                                // Upload image
                                const imageUrl = await uploadFeatureImage(file, i);
                                if (imageUrl) {
                                  const tmp = [...product.featureDescriptions];
                                  tmp[i].image = imageUrl;
                                  setProduct(prev => ({ ...prev, featureDescriptions: tmp }));
                                }
                              }}
                            />
                            <label
                              htmlFor={`feature-image-${i}`}
                              className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-purple-300 rounded-lg bg-white text-purple-600 hover:bg-purple-50 cursor-pointer"
                            >
                              <FiUpload size={24} className="mb-2" />
                              <span className="text-sm">Upload Image</span>
                            </label>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            Recommended size: 600x400px<br />
                            Formats: JPG, PNG, WEBP<br />
                            Max file size: 2MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-purple-50 rounded-lg border border-dashed border-purple-300">
                  <p className="text-purple-500">No feature descriptions added yet</p>
                </div>
              )}
            </div>

            {/* Size Chart */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-800">Size Chart</h3>
                <button
                  type="button"
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-200"
                  onClick={() => setProduct(prev => ({
                    ...prev,
                    sizeChart: [...prev.sizeChart, { label: '', stock: 0 }]
                  }))}
                >
                  <FiPlus size={18} /> Add Size
                </button>
              </div>

              {product.sizeChart.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.sizeChart.map((sz, i) => (
                    <div key={i} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-purple-700">Size #{i + 1}</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setProduct(prev => ({
                              ...prev,
                              sizeChart: prev.sizeChart.filter((_, j) => j !== i)
                            }));
                          }}
                        >
                          <FiX size={18} />
                        </button>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm text-gray-600 mb-1">Size Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g. S, M, L"
                          value={sz.label}
                          onChange={e => {
                            const tmp = [...product.sizeChart];
                            tmp[i].label = e.target.value;
                            setProduct(prev => ({ ...prev, sizeChart: tmp }));
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Stock</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Available quantity"
                          value={sz.stock}
                          onChange={e => {
                            const tmp = [...product.sizeChart];
                            tmp[i].stock = Number(e.target.value);
                            setProduct(prev => ({ ...prev, sizeChart: tmp }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-purple-50 rounded-lg border border-dashed border-purple-300">
                  <p className="text-purple-500 mb-3">No sizes added yet</p>
                  <button
                    type="button"
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-200 mx-auto"
                    onClick={() => setProduct(prev => ({
                      ...prev,
                      sizeChart: [...prev.sizeChart, { label: '', stock: 0 }]
                    }))}
                  >
                    <FiPlus size={18} /> Add First Size
                  </button>
                </div>
              )}
            </div>

            {/* Rating Categories */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-800">Rating Categories</h3>
                <button
                  type="button"
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-200"
                  onClick={() => setProduct(prev => ({
                    ...prev,
                    ratingAttributes: [...prev.ratingAttributes, '']
                  }))}
                >
                  <FiPlus size={18} /> Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.ratingAttributes?.map((category, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={category}
                      placeholder="Category name"
                      onChange={e => {
                        const updated = [...product.ratingAttributes];
                        updated[i] = e.target.value;
                        setProduct(prev => ({ ...prev, ratingAttributes: updated }));
                      }}
                    />
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 p-2"
                      onClick={() => {
                        const filtered = product.ratingAttributes.filter((_, j) => j !== i);
                        setProduct(prev => ({ ...prev, ratingAttributes: filtered }));
                      }}
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm text-gray-600">
                These categories will appear in product reviews for customers to rate separately.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4 border-t border-purple-200">
              <button
                type="button"
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-300"
                onClick={() => navigate('/products')}
                disabled={isSubmitting}
              >
                <FiArrowLeft /> Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg flex items-center gap-2 hover:from-purple-700 hover:to-indigo-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiSave /> {id ? 'Update Product' : 'Save Product'}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Product;