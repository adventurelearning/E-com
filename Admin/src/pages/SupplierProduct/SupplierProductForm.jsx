import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSave, FiArrowLeft, FiUpload, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import Api from '../../Services/Api';

const SupplierProductForm = () => {
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
                    const { data } = await Api.get(`/supplier-products/${id}`);
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
                            url: img,
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
                if (id) navigate('/SProduct');
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
            // Check if any images are still uploading
            const isUploading = images.some(img =>
                img.status === 'pending' || img.status === 'uploading'
            );

            if (isUploading) {
                toast.error('Please wait for images to finish uploading');
                return;
            }
            // Convert category ID to name
            const categoryObj = categories.find(cat => cat._id === product.category);
            const categoryName = categoryObj ? categoryObj.name : '';

            // Convert subcategory ID to name
            const subcategoryObj = subcategories.find(sc => sc._id === product.subcategory);
            const subcategoryName = subcategoryObj ? subcategoryObj.name : '';
            // Get only successfully uploaded images
            const finalImages = images
                .filter(img => img.status === 'uploaded')
                .map(img => img.serverFilename);

            const payload = {
                ...product,
                images: finalImages,
                category: categoryName,
                discountPercent: calcDiscountPercent(
                    parseFloat(product.originalPrice),
                    parseFloat(product.discountPrice)
                )
            };

            if (id) {
                await Api.put(`/supplier-products/${id}`, payload);
                toast.success('Product updated!');
            } else {
                await Api.post('/supplier-products', payload);
                toast.success('Product submitted for approval!');
            }

            setTimeout(() => navigate('/SProduct'), 1200);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-xl px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{id ? 'Edit Product' : 'Create New Product'}</h2>
                    <button
                        className="flex items-center text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
                        onClick={() => navigate('/SProduct')}
                    >
                        <FiArrowLeft className="mr-2" /> Back to Products
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Status Bar */}
                        {id && (
                            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex-1">
                                    <h3 className="font-medium text-blue-800">Product Status</h3>
                                    <p className="text-blue-600 text-sm">
                                        {product.status === 'approved'
                                            ? 'This product has been approved and published'
                                            : product.status === 'rejected'
                                                ? `Rejected: ${product.adminRemarks || 'No remarks provided'}`
                                                : 'Pending admin approval'}
                                    </p>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            product.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Draft'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                    <input
                                        name="name"
                                        className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                                        className={`w-full px-4 py-2.5 border ${errors.brand ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        value={product.brand}
                                        onChange={handleChange}
                                        placeholder="Enter brand name"
                                    />
                                    {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                    <textarea
                                        name="description"
                                        className={`w-full px-4 py-2.5 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        rows="4"
                                        value={product.description}
                                        onChange={handleChange}
                                        placeholder="Describe your product in detail"
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Pricing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) *</label>
                                    <input
                                        name="originalPrice"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        className={`w-full px-4 py-2.5 border ${errors.originalPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        value={product.originalPrice}
                                        onChange={handleChange}
                                        placeholder="Original price"
                                    />
                                    {errors.originalPrice && <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price (₹) *</label>
                                    <input
                                        name="discountPrice"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        className={`w-full px-4 py-2.5 border ${errors.discountPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        value={product.discountPrice}
                                        onChange={handleChange}
                                        placeholder="Discounted price"
                                    />
                                    {errors.discountPrice && <p className="mt-1 text-sm text-red-600">{errors.discountPrice}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                                    <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                                        {calcDiscountPercent(
                                            parseFloat(product.originalPrice),
                                            parseFloat(product.discountPrice)
                                        )}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category & Inventory */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Category & Inventory</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <select
                                        name="category"
                                        className={`w-full px-4 py-2.5 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                                        className={`w-full px-4 py-2.5 border ${errors.subcategory ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        value={product.subcategory}
                                        onChange={handleChange}
                                        disabled={!product.category}
                                    >
                                        <option value="">Select subcategory</option>
                                        {subcategories.map(sc => (
                                            <option key={sc._id} value={sc.name}>{sc.name}</option>
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
                                        className={`w-full px-4 py-2.5 border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        value={product.stock}
                                        onChange={handleChange}
                                        placeholder="Total available stock"
                                    />
                                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Product Images</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Images (Max 5) *
                                    </label>
                                    <div className="flex items-center">
                                        <label
                                            className={`inline-flex items-center px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <FiUpload className="mr-2" />
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
                                        <span className="ml-3 text-sm text-gray-500">
                                            {images.length} of 5 images selected
                                        </span>
                                    </div>
                                    {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative border rounded-lg p-2 bg-gray-50 w-32 h-32">
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={img.url}
                                                    className="w-full h-full object-contain rounded"
                                                    alt="preview"
                                                />
                                                {img.status === 'uploading' && (
                                                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                                                    </div>
                                                )}
                                                {img.status === 'error' && (
                                                    <div className="absolute inset-0 bg-red-100 bg-opacity-70 flex items-center justify-center text-red-600 font-medium">
                                                        Error
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

                                <p className="text-sm text-gray-500">
                                    Recommended size: 800x800px. Formats: JPG, PNG, WEBP.
                                </p>
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Colors</h3>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((c, i) => (
                                        <div key={i} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                                            <span>{c}</span>
                                            <button
                                                type="button"
                                                className="ml-2 text-blue-600 hover:text-blue-900"
                                                onClick={() => {
                                                    const nc = product.colors.filter((_, j) => j !== i);
                                                    setProduct(prev => ({ ...prev, colors: nc }));
                                                }}
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Add a new color"
                                        className="flex-grow px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={currentColor}
                                        onChange={e => setCurrentColor(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700"
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
                                        <FiPlus className="mr-1" /> Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Size Chart */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-800">Size Chart</h3>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg flex items-center hover:bg-blue-50"
                                    onClick={() => setProduct(prev => ({
                                        ...prev,
                                        sizeChart: [...prev.sizeChart, { label: '', stock: 0 }]
                                    }))}
                                >
                                    <FiPlus className="mr-1" /> Add Size
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {product.sizeChart.map((sz, i) => (
                                    <div key={i} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-medium">Size #{i + 1}</span>
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                type="button"
                                                onClick={() => {
                                                    setProduct(prev => ({
                                                        ...prev,
                                                        sizeChart: prev.sizeChart.filter((_, j) => j !== i)
                                                    }));
                                                }}
                                            >
                                                <FiMinus size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Size Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                ))}
                            </div>

                            {product.sizeChart.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <p className="text-gray-500 mb-3">No sizes added yet</p>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center mx-auto hover:bg-blue-700"
                                        onClick={() => setProduct(prev => ({
                                            ...prev,
                                            sizeChart: [...prev.sizeChart, { label: '', stock: 0 }]
                                        }))}
                                    >
                                        <FiPlus className="mr-1" /> Add First Size
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center"
                                onClick={() => navigate('/SProduct')}
                                disabled={isSubmitting}
                            >
                                <FiArrowLeft className="mr-2" /> Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-800 disabled:opacity-70 flex items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2" />
                                        {id ? 'Update Product' : 'Submit for Approval'}
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

export default SupplierProductForm;