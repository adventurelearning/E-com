import React, { createContext, useState, useEffect, useContext } from 'react';
import Api from '../Services/Api';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await Api.get('/products');
      setProduct(response.data.products || response.data);
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (id) => {
    try {
      setLoading(true);
      const response = await Api.get(`/products/${id}`);
      setSelectedProduct(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch product details');
      console.error("Error fetching product:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, []);

  return (
    <ProductContext.Provider value={{ 
      product, 
      loading, 
      error, 
      selectedProduct, 
      setSelectedProduct,
      selectedQuantity, 
      setSelectedQuantity,
      refreshProducts: fetchProductDetails,
      fetchProductById
    }}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use the product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};