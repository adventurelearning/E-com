import React, { useState, useEffect } from 'react';
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
  const [attributeFamilies, setAttributeFamilies] = useState([]);
  const [selectedAttributeFamily, setSelectedAttributeFamily] = useState(null);
  const [uploadingAttributes, setUploadingAttributes] = useState({});

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
    stock: '',
    sku: '',
    attributeFamily: '',
    attributes: {},
    ratingAttributes: ['Quality', 'Color', 'Design', 'Size'],
    groupId: '',
    metaTitle: '',
    metaKeywords: '',
    metaDescription: '',
  });

  // Cloudinary configuration
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

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
        const [catRes, attrFamilyRes] = await Promise.all([
          Api.get('/categories'),
          Api.get('/attribute-families')
        ]);
        
        setCategories(catRes.data);
        setAttributeFamilies(attrFamilyRes.data.data);

        if (id) {
          const { data } = await Api.get(`/products/${id}`);
console.log('Fetched product data:', data);

          // Map names to IDs
          const categoryObj = catRes.data.find(cat => cat.name === data.category);
          let subcategoryId = '';

          if (categoryObj) {
            const subObj = categoryObj.subcategories.find(sc => sc.name === data.subcategory);
            subcategoryId = subObj?._id || '';
          }

          // Set attribute family
          console.log(attrFamilyRes.data.data);
          console.log(data.attributeFamily);
          
          const attrFamily = attrFamilyRes.data.data.find(af => af._id === data.attributeFamily);
          console.log(attrFamily);
          
          setSelectedAttributeFamily(attrFamily || null);

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
            stock: data.stock,
            sku: data.sku || '',
            attributeFamily: data.attributeFamily || '',
            attributes: data.attributes || {},
            groupId: data.groupId || '',
              ratingAttributes: data.ratingAttributes || ['Quality', 'Color', 'Design', 'Size'],
            metaTitle: data.metaTitle || '',
            metaKeywords: data.metaKeywords || '',
            metaDescription: data.metaDescription || '',
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
        toast.error(id ? 'Failed loading product' : 'Failed loading data');
        // if (id) navigate('/products');
        console.log(err);
        
      }
    }
    init();
  }, [id, navigate]);

  useEffect(() => {
    if (product.attributeFamily) {
      const family = attributeFamilies.find(af => af._id === product.attributeFamily);
      setSelectedAttributeFamily(family || null);
    }
  }, [product.attributeFamily, attributeFamilies]);
console.log('product edit',product);

  // Initialize repeatable groups with 1 instance for new products
  useEffect(() => {
    if (selectedAttributeFamily && !id) {
      setProduct(prev => {
        const newAttributes = { ...prev.attributes };
        let hasChanges = false;
        
        selectedAttributeFamily.groups.forEach(group => {
          if (group.isRepeatable) {
            if (!newAttributes[group.code] || newAttributes[group.code].length === 0) {
              newAttributes[group.code] = [{}]; // Initialize with 1 empty instance
              hasChanges = true;
            }
          }
        });
        
        return hasChanges ? { ...prev, attributes: newAttributes } : prev;
      });
    }
  }, [selectedAttributeFamily, id]);

  // Add a new instance to a repeatable group
  const addRepeatableGroupInstance = (groupCode) => {
    setProduct(prev => {
      const newAttributes = { ...prev.attributes };
      const currentInstances = newAttributes[groupCode] || [];
      
      if (currentInstances.length < 5) { // Limit to 5 instances
        newAttributes[groupCode] = [...currentInstances, {}];
        return { ...prev, attributes: newAttributes };
      }
      
      return prev;
    });
  };

  // Remove an instance from a repeatable group
  const removeRepeatableGroupInstance = (groupCode, instanceIndex) => {
    setProduct(prev => {
      const newAttributes = { ...prev.attributes };
      const currentInstances = newAttributes[groupCode] || [];
      
      if (currentInstances.length > 1) { // Keep at least 1 instance
        newAttributes[groupCode] = currentInstances.filter((_, index) => index !== instanceIndex);
        return { ...prev, attributes: newAttributes };
      }
      
      return prev;
    });
  };

  const validate = () => {
    const errs = {};
    ['name', 'originalPrice', 'category', 'brand', 'stock', 'sku'].forEach(f => {
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

    e.target.value = null;

    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      serverFilename: '',
      status: 'pending',
      file
    }));

    setImages(prev => [...prev, ...newImages]);

    for (const img of newImages) {
      await uploadImage(img);
    }

    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
  };

  const uploadImage = async (img) => {
    setImages(prev =>
      prev.map(i =>
        i.url === img.url ? { ...i, status: 'uploading' } : i
      )
    );

    try {
      const formData = new FormData();
      formData.append('file', img.file);
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
    const img = images[index];
    if (img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url);
    }

    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const calcDiscountPercent = (orig, disc) => {
    if (!orig || orig <= disc) return 0;
    return Math.round(((orig - disc) / orig) * 100);
  };

  const handleAttributeChange = (attributeId, value, groupCode = null, instanceIndex = 0) => {
    setProduct(prev => {
      const newAttributes = { ...prev.attributes };
      
      if (groupCode) {
        if (!newAttributes[groupCode]) newAttributes[groupCode] = [{}];
        if (!newAttributes[groupCode][instanceIndex]) newAttributes[groupCode][instanceIndex] = {};
        newAttributes[groupCode][instanceIndex][attributeId] = value;
      } else {
        newAttributes[attributeId] = value;
      }
      
      return { ...prev, attributes: newAttributes };
    });
  };

  const uploadAttributeFile = async (file, attributeId, groupCode = null, instanceIndex = 0) => {
    // Create a unique key for this attribute upload
    const uploadKey = `${attributeId}-${groupCode || 'no-group'}-${instanceIndex}`;
    setUploadingAttributes(prev => ({ ...prev, [uploadKey]: true }));
    
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

      // Update the attribute value with the Cloudinary URL
      handleAttributeChange(attributeId, data.secure_url, groupCode, instanceIndex);
    } catch (err) {
      toast.error('File upload failed: ' + err.message);
    } finally {
      setUploadingAttributes(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const categoryObj = categories.find(cat => cat._id === product.category);
      const categoryName = categoryObj ? categoryObj.name : '';

      const subcategoryObj = subcategories.find(sc => sc._id === product.subcategory);
      const subcategoryName = subcategoryObj ? subcategoryObj.name : '';

      const isUploading = images.some(img =>
        img.status === 'pending' || img.status === 'uploading'
      );

      if (isUploading) {
        toast.error('Please wait for images to finish uploading');
        return;
      }

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
console.log('Submitting product:', pr);

      if (id) {
        await Api.put(`/products/${id}`, pr);
        toast.success('Product updated!');
      } else {
        await Api.post('/products', pr);
        toast.success('Product added!');
      }

      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      console.log(err);
      
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAttributeInput = (attribute, groupCode = null, instanceIndex = 0) => {
    const value = groupCode 
      ? product.attributes[groupCode]?.[instanceIndex]?.[attribute._id] || ''
      : product.attributes[attribute._id] || '';

    // Create a unique key for this attribute upload status
    const uploadKey = `${attribute._id}-${groupCode || 'no-group'}-${instanceIndex}`;
    const isUploading = uploadingAttributes[uploadKey];

    switch (attribute.type) {
      case 'MCE Editer':
        return (
          <TinyEditor
            value={value}
            onChange={(content) => handleAttributeChange(attribute._id, content, groupCode, instanceIndex)}
            height={200}
          />
        );
      
      case 'keyvalue':
        const keyValuePairs = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {keyValuePairs.map((pair, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={pair.key || ''}
                  onChange={e => {
                    const newPairs = [...keyValuePairs];
                    newPairs[idx] = { ...newPairs[idx], key: e.target.value };
                    handleAttributeChange(attribute._id, newPairs, groupCode, instanceIndex);
                  }}
                  className="flex-1 border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={pair.value || ''}
                  onChange={e => {
                    const newPairs = [...keyValuePairs];
                    newPairs[idx] = { ...newPairs[idx], value: e.target.value };
                    handleAttributeChange(attribute._id, newPairs, groupCode, instanceIndex);
                  }}
                  className="flex-1 border rounded p-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newPairs = keyValuePairs.filter((_, i) => i !== idx);
                    handleAttributeChange(attribute._id, newPairs, groupCode, instanceIndex);
                  }}
                  className="text-red-500 p-2"
                >
                  <FiX />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newPairs = [...keyValuePairs, { key: '', value: '' }];
                handleAttributeChange(attribute._id, newPairs, groupCode, instanceIndex);
              }}
              className="flex items-center gap-1 text-blue-600"
            >
              <FiPlus /> Add Key-Value Pair
            </button>
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={e => handleAttributeChange(attribute._id, e.target.value, groupCode, instanceIndex)}
            className="w-full border rounded p-2"
            rows={4}
          />
        );
      
      case 'select':
      case 'multiselect':
        return (
          <select
            multiple={attribute.type === 'multiselect'}
            value={attribute.type === 'multiselect' ? value || [] : value}
            onChange={e => {
              const newValue = attribute.type === 'multiselect'
                ? Array.from(e.target.selectedOptions, option => option.value)
                : e.target.value;
              handleAttributeChange(attribute._id, newValue, groupCode, instanceIndex);
            }}
            className="w-full border rounded p-2"
          >
            {attribute.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => handleAttributeChange(attribute._id, e.target.checked, groupCode, instanceIndex)}
            className="h-5 w-5"
          />
        );
      
      case 'image':
      case 'file':
        return (
          <div className="space-y-2">
            {value && (
              <div className="flex items-center gap-2">
                {attribute.type === 'image' ? (
                  <img 
                    src={value} 
                    alt="Preview" 
                    className="w-16 h-16 object-contain border rounded"
                  />
                ) : (
                  <a 
                    href={value} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View File
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleAttributeChange(attribute._id, '', groupCode, instanceIndex)}
                  className="text-red-500 p-1"
                >
                  <FiX />
                </button>
              </div>
            )}
            
            {isUploading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                Uploading...
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer text-blue-600">
                <FiUpload size={16} />
                Upload {attribute.type === 'image' ? 'Image' : 'File'}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      uploadAttributeFile(file, attribute._id, groupCode, instanceIndex);
                    }
                    e.target.value = null; // Reset input
                  }}
                  accept={attribute.type === 'image' ? 'image/*' : '*/*'}
                />
              </label>
            )}
          </div>
        );
      
      default:
        return (
          <input
            type={attribute.type === 'price' ? 'number' : 'text'}
            step={attribute.type === 'price' ? '0.01' : undefined}
            value={value}
            onChange={e => handleAttributeChange(attribute._id, e.target.value, groupCode, instanceIndex)}
            className="w-full border rounded p-2"
          />
        );
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    name="sku"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.sku ? 'border-red-500' : 'border-gray-300'
                      }`}
                    value={product.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attribute Family</label>
                  <select
                    name="attributeFamily"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={product.attributeFamily}
                    onChange={handleChange}
                  >
                    <option value="">Select Attribute Family</option>
                    {attributeFamilies.map(af => (
                      <option key={af._id} value={af._id}>{af.name}</option>
                    ))}
                  </select>
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

            {/* Attributes */}
            {selectedAttributeFamily && (
              <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
                <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-3 mb-4">Attributes</h3>
                
                {selectedAttributeFamily.groups.map(group => (
                  <div key={group.code} className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-purple-700">{group.name}</h4>
                      {group.isRepeatable && (
                        <button
                          type="button"
                          onClick={() => addRepeatableGroupInstance(group.code)}
                          disabled={(product.attributes[group.code] || []).length >= 5}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiPlus /> Add {group.name}
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {group.isRepeatable ? (
                        // Dynamic instances for repeatable groups
                        (product.attributes[group.code] || []).map((instance, instanceIndex) => (
                          <div key={instanceIndex} className="border border-purple-200 rounded-lg p-4 bg-purple-50 relative">
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="font-medium">{group.name} #{instanceIndex + 1}</h5>
                              {(product.attributes[group.code] || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRepeatableGroupInstance(group.code, instanceIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiX size={18} />
                                </button>
                              )}
                            </div>
                            
                            <div className="space-y-4">
                              {selectedAttributeFamily.attributes
                                .filter(attr => attr.group === group.code)
                                .map(attrInfo => {
                                  const attribute = attrInfo.attribute;
                                  return (
                                    <div key={attribute._id} className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {attribute.label}
                                        {attrInfo.isRequired && <span className="text-red-500"> *</span>}
                                      </label>
                                      {renderAttributeInput(attribute, group.code, instanceIndex)}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Single column layout for non-repeatable groups
                        <div className="space-y-4">
                          {selectedAttributeFamily.attributes
                            .filter(attr => attr.group === group.code)
                            .map(attrInfo => {
                              const attribute = attrInfo.attribute;
                              return (
                                <div key={attribute._id} className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {attribute.label}
                                    {attrInfo.isRequired && <span className="text-red-500"> *</span>}
                                  </label>
                                  {renderAttributeInput(attribute)}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Meta Details */}
            <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
              <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-3 mb-4">Meta Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    name="metaTitle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={product.metaTitle}
                    onChange={handleChange}
                    placeholder="Meta title for SEO"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                  <input
                    name="metaKeywords"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={product.metaKeywords}
                    onChange={handleChange}
                    placeholder="Comma-separated keywords"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={product.metaDescription}
                    onChange={handleChange}
                    placeholder="Meta description for SEO"
                  />
                </div>
              </div>
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