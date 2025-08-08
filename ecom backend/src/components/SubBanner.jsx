import React, { useState, useEffect } from 'react';
import Api from '../Services/Api';

const SubBanner = () => {
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
        link: '' // Add link field
    });
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await Api.get('/subbanners');
            setProducts(response.data);
            console.log(response.data);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            image: file
        });
        
        // Create preview URL
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('subtitle', formData.subtitle);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('buttonText', formData.buttonText);
        formDataToSend.append('isFeatured', formData.isFeatured);
        formDataToSend.append('link', formData.link); // Add link to form data
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        try {
            if (editingProduct) {
                await Api.put(`/subbanners/${editingProduct._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await Api.post('/subbanners', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
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
            link: product.link || '' // Initialize link field
        });
        setPreviewImage(product.imageUrl);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await Api.delete(`/subbanners/${id}`);
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
            link: '' // Reset link field
        });
        setPreviewImage('');
        setEditingProduct(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">SubBanner Management</h1>
            
            {/* Product Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New SubBanner'}
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

                        {/* Add new link input field */}
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
                                onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                                Featured Product
                            </label>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                            <input
                                type="file"
                                name="image"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                accept="image/*"
                            />
                            {previewImage && (
                                <div className="mt-2">
                                    <img src={previewImage} alt="Preview" className="h-20 w-auto rounded-md" />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-4">
                        {editingProduct && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-500 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm 
                            font-medium hover:bg-blue-700 focus:outline-none focus:ring-2
                             focus:ring-blue-500"
                             onClick={handleSubmit}
                        >
                            {editingProduct ? 'Update SubBanner' : 'Add SubBanner'}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Products List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">SubBanner</h2>
                {loading ? (
                    <p>Loading products...</p>
                ) : products.length === 0 ? (
                    <p>No SubBanner found. Add your first SubBanner.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm">
                                <div className="h-48 bg-gray-100 flex items-center justify-center">
                                    {product.imageUrl && (
                                        <img 
                                            src={product.imageUrl}
                                            alt={product.title} 
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">{product.title}</h3>
                                    <p className="text-gray-600">{product.subtitle}</p>
                                    <p className="text-blue-600 font-bold mt-2">${product.price}</p>
                                    {product.link && (
                                        <p className="text-sm mt-2">
                                            <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                Link: {product.link}
                                            </a>
                                        </p>
                                    )}
                                    <div className="mt-4 flex justify-between">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
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

export default SubBanner;