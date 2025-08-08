import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSave, FiArrowLeft, FiUpload, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import Api from '../../Services/Api';

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
    category: '',
    subcategory: '',
    brand: '',
    colors: [],
    sizeChart: [],
    stock: ''
  });

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

  useEffect(() => {
    async function init() {
      try {
        const catRes = await Api.get('/categories');
        setCategories(catRes.data);

        if (id) {
          const { data } = await Api.get(`/products/${id}`);
          setProduct({
            name: data.name,
            description: data.description,
            originalPrice: data.originalPrice,
            discountPrice: data.discountPrice,
            category: data.category,
            subcategory: data.subcategory,
            brand: data.brand,
            colors: data.colors || [],
            sizeChart: data.sizeChart || [],
            stock: data.stock
          });

          // Initialize images with existing server images
          if (data.images?.length) {
            const initialImages = data.images.map(img => ({
              url:img,
              serverFilename: img,
              status: 'uploaded'
            }));
            setImages(initialImages);
          }

          const selCat = catRes.data.find(c => c._id === data.category);
          setSubcategories(selCat?.subcategories || []);
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
    ['name', 'description', 'originalPrice', 'discountPrice', 'category', 'brand', 'stock'].forEach(f => {
      if (!product[f] || (typeof product[f] === 'string' && !product[f].trim())) errs[f] = 'Required';
    });
    if (Number(product.discountPrice) > Number(product.originalPrice)) {
      errs.discountPrice = 'Discounted price must be ≤ original price';
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
      const fd = new FormData();
      fd.append('photo', img.file);

      const { data } = await Api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update with server URL and filename
      setImages(prev =>
        prev.map(i =>
          i.url === img.url
            ? {
              url: data.location,
              serverFilename: data.location,
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
      toast.error('Image upload failed');
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
        images: finalImages,
        category: categoryName,
        discountPercent: calcDiscountPercent(
          product.originalPrice,
          product.discountPrice
        )
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
    <div className="container mt-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
          <h4 className="mb-0">{id ? 'Edit Product' : 'Add Product'}</h4>
          <button 
            className="btn btn-light btn-sm d-flex align-items-center" 
            onClick={() => navigate('/products')}
          >
            <FiArrowLeft className="me-1" /> Back
          </button>
        </div>
        
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-4">
              <h5 className="mb-3 pb-2 border-bottom text-primary">Basic Information</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Product Name *</label>
                  <input
                    name="name"
                    className={`form-control ${errors.name && 'is-invalid'}`}
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Brand *</label>
                  <input
                    name="brand"
                    className={`form-control ${errors.brand && 'is-invalid'}`}
                    value={product.brand}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                  />
                  {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-medium">Description *</label>
                <textarea 
                  name="description" 
                  className={`form-control ${errors.description && 'is-invalid'}`} 
                  rows="4"
                  value={product.description} 
                  onChange={handleChange}
                  placeholder="Describe your product in detail"
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-4">
              <h5 className="mb-3 pb-2 border-bottom text-primary">Pricing</h5>
              <div className="row">
                {['originalPrice','discountPrice'].map((f, i) => (
                  <div key={f} className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      {f === 'originalPrice' ? 'Original Price *' : 'Discount Price *'}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        name={f}
                        type="text"
                        className={`form-control ${errors[f] && 'is-invalid'}`}
                        value={product[f]}
                        onChange={handleChange}
                        placeholder={f === 'originalPrice' ? "Original price" : "Discounted price"}
                      />
                    </div>
                    {errors[f] && <div className="invalid-feedback d-block">{errors[f]}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Category & Stock */}
            <div className="mb-4">
              <h5 className="mb-3 pb-2 border-bottom text-primary">Category & Inventory</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Category *</label>
                  <select
                    name="category"
                    className={`form-select ${errors.category && 'is-invalid'}`}
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
                  {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Subcategory *</label>
                  <select
                    name="subcategory"
                    className={`form-select ${errors.subcategory && 'is-invalid'}`}
                    value={product.subcategory}
                    onChange={handleChange}
                    disabled={!product.category}
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map(sc => (
                      <option key={sc._id} value={sc.name}>{sc.name}</option>
                    ))}
                  </select>
                  {errors.subcategory && <div className="invalid-feedback">{errors.subcategory}</div>}
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Total Stock *</label>
                  <input
                    name="stock"
                    type="text"
                    className={`form-control ${errors.stock && 'is-invalid'}`}
                    value={product.stock}
                    onChange={handleChange}
                    placeholder="Total available stock"
                  />
                  {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="mb-4">
              <h5 className="mb-3 pb-2 border-bottom text-primary">Product Images</h5>
              <label className="form-label fw-medium">Upload Images *</label>
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <label 
                    className={`btn btn-outline-primary me-3 ${images.length >= 5 ? 'disabled' : ''}`}
                    style={{ cursor: images.length >= 5 ? 'not-allowed' : 'pointer' }}
                  >
                    <FiUpload className="me-1" />
                    Select Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="d-none"
                      onChange={handleImageSelect}
                      disabled={images.length >= 5}
                    />
                  </label>
                  <span className="text-muted small">
                    {images.length} of 5 images selected
                  </span>
                </div>
                {errors.images && <div className="text-danger small mt-1">{errors.images}</div>}
              </div>
              
              <div className="d-flex flex-wrap gap-3 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="position-relative border rounded p-2 bg-light">
                    <div className="position-relative">
                      <img 
                        src={img.url} 
                        className="img-thumbnail" 
                        style={{ 
                          height: 100, 
                          width: 100, 
                          objectFit: 'contain',
                          opacity: img.status === 'uploading' ? 0.7 : 1,
                          backgroundColor: '#f8f9fa'
                        }} 
                        alt="preview"
                      />
                      {img.status === 'uploading' && (
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <div className="spinner-border spinner-border-sm text-primary"></div>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-danger bg-opacity-25 d-flex align-items-center justify-content-center rounded">
                          <span className="text-danger fw-bold">Error</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="d-flex justify-content-center mt-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-danger d-flex align-items-center"
                        onClick={() => removeImage(i)}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-text text-muted mt-2">
                Max 5 images. Recommended size: 800x800px. Formats: JPG, PNG, WEBP.
              </div>
            </div>

            {/* Colors */}
            <div className="mb-4">
              <h5 className="mb-3 pb-2 border-bottom text-primary">Colors</h5>
              <label className="form-label fw-medium">Available Colors</label>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                {product.colors.map((c, i) => (
                  <span key={i} className="badge bg-primary d-flex align-items-center py-2 px-3">
                    <span className="me-2">{c}</span>
                    <FiX 
                      className="cursor-pointer" 
                      onClick={() => {
                        const nc = product.colors.filter((_, j) => j !== i);
                        setProduct(prev => ({ ...prev, colors: nc }));
                      }} 
                    />
                  </span>
                ))}
              </div>
              
              <div className="d-flex gap-2 align-items-center" style={{ maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Add a new color"
                  className="form-control"
                  value={currentColor}
                  onChange={e => setCurrentColor(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center"
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
                  <FiPlus className="me-1" /> Add
                </button>
              </div>
            </div>

            {/* Size Chart */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 className="text-primary">Size Chart</h5>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                  onClick={() => setProduct(prev => ({
                    ...prev,
                    sizeChart: [...prev.sizeChart, { label: '', stock: 0 }]
                  }))}
                >
                  <FiPlus className="me-1" /> Add Size
                </button>
              </div>
              
              <div className="row g-3">
                {product.sizeChart.map((sz, i) => (
                  <div key={i} className="col-md-4">
                    <div className="card border">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-medium">Size #{i + 1}</span>
                          <button 
                            className="btn btn-sm btn-outline-danger p-0 d-flex align-items-center justify-content-center"
                            style={{ width: '24px', height: '24px' }}
                            type="button" 
                            onClick={() => {
                              setProduct(prev => ({
                                ...prev,
                                sizeChart: prev.sizeChart.filter((_, j) => j !== i)
                              }));
                            }}
                          >
                            <FiMinus size={14} />
                          </button>
                        </div>
                        
                        <div className="mb-2">
                          <label className="form-label small text-muted mb-1">Size Name</label>
                          <input 
                            type="text"
                            className="form-control form-control-sm" 
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
                          <label className="form-label small text-muted mb-1">Stock</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
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
                    </div>
                  </div>
                ))}
              </div>
              
              {product.sizeChart.length === 0 && (
                <div className="text-center py-4 bg-light rounded">
                  <p className="text-muted">No sizes added yet</p>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                    onClick={() => setProduct(prev => ({
                      ...prev,
                      sizeChart: [...prev.sizeChart, { label: '', stock: 0 }]
                    }))}
                  >
                    <FiPlus className="me-1" /> Add First Size
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
              <button 
                type="button" 
                className="btn btn-outline-secondary px-4 d-flex align-items-center" 
                onClick={() => navigate('/products')}
                disabled={isSubmitting}
              >
                <FiArrowLeft className="me-1" /> Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary px-4 d-flex align-items-center" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <FiSave className="me-1" />
                )}
                {id ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Product;