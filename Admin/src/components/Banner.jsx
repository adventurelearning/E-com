import React, { useState, useEffect } from 'react';
import Api from '../Services/Api';

const Banner = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        price: '',
        buttonText: 'SHOP NOW',
        isFeatured: false,
        image: null,
        imageUrl: '',
        link: ''
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await Api.get('/banners');
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image size must be less than 5MB');
            return;
        }

        setUploadError('');
        setUploading(true);

        try {
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('upload_preset', UPLOAD_PRESET);

            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: uploadFormData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            setFormData(prev => ({
                ...prev,
                imageUrl: data.secure_url
            }));

        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadError('Error uploading image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            imageUrl: '',
            image: null
        }));
        setUploadError('');
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.imageUrl && !editingProduct) {
            setUploadError('Please upload an image first');
            return;
        }

        try {
            const productData = {
                title: formData.title,
                subtitle: formData.subtitle,
                price: formData.price,
                buttonText: formData.buttonText,
                isFeatured: formData.isFeatured,
                link: formData.link,
                imageUrl: formData.imageUrl
            };

            if (editingProduct) {
                await Api.put(`/banners/${editingProduct._id}`, productData);
            } else {
                await Api.post('/banners', productData);
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            subtitle: product.subtitle,
            price: product.price,
            buttonText: product.buttonText,
            isFeatured: product.isFeatured,
            image: null,
            imageUrl: product.imageUrl,
            link: product.link || ''
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await Api.delete(`/banners/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            price: '',
            buttonText: 'SHOP NOW',
            isFeatured: false,
            image: null,
            imageUrl: '',
            link: ''
        });
        setEditingProduct(null);
        setUploadError('');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Banner Management</h1>

            {/* Product Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    {editingProduct ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                            <input
                                type="text"
                                name="buttonText"
                                value={formData.buttonText}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                            <input
                                type="url"
                                name="link"
                                value={formData.link}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                                Featured Product
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Banner Image {!editingProduct && <span className="text-red-500">*</span>}
                            </label>
                            <div className="flex items-center gap-2">
                                <label className="flex-1">
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        accept="image/*"
                                        disabled={uploading}
                                    />
                                </label>
                                {formData.imageUrl && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                                        disabled={uploading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {uploading && (
                                <div className="mt-2 flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                    <span className="text-sm text-blue-600">Uploading image...</span>
                                </div>
                            )}

                            {uploadError && (
                                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                            )}

                            {!formData.imageUrl && !uploading && (
                                <p className="mt-2 text-sm text-gray-500">
                                    {editingProduct ?
                                        "Upload a new image to replace the current one" :
                                        "Please upload a banner image"
                                    }
                                </p>
                            )}

                            {formData.imageUrl && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                                    <div className="relative inline-block">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="h-40 w-auto rounded-md border"
                                        />

                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                        {editingProduct && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={uploading || (!formData.imageUrl && !editingProduct)}
                        >
                            {uploading ? 'Uploading...' : (editingProduct ? 'Update Banner' : 'Add Banner')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Banners</h2>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No banners</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new banner.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-gray-400">
                                            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">{product.title}</h3>
                                    <p className="text-gray-600">{product.subtitle}</p>
                                    <p className="text-blue-600 font-bold mt-2">${product.price}</p>
                                    {product.isFeatured && (
                                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-2">
                                            Featured
                                        </span>
                                    )}
                                    {product.link && (
                                        <p className="text-sm mt-2 truncate">
                                            <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                {product.link}
                                            </a>
                                        </p>
                                    )}
                                    <div className="mt-4 flex justify-between">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                        >
                                            Delete
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

export default Banner;