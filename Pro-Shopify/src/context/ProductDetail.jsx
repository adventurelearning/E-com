import React, { useEffect } from 'react'
import { createContext, useState } from 'react';
import Api from '../Services/Api';

export  const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [product, setProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

    const fetchProductDetails = async () => {
      try {
        const response = await Api.get('/products');
        setProduct(response.data);
        console.log("Fetched user from backend:", response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };
    useEffect(() => {
    fetchProductDetails();
  }, []);
  return (
    <ProductContext.Provider value={{ product, setProduct, refreshProduct: fetchProductDetails, 
    selectedProduct, setSelectedProduct, selectedQuantity, setSelectedQuantity }}>
      {children}
    </ProductContext.Provider>
  );
};

