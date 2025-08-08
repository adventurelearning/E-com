import React, { createContext, useContext, useState, useEffect } from 'react';
import Api from '../Services/Api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartError, setCartError] = useState(null);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        return;
      }

      const response = await Api.get('/cart');
      const count = response.data?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
      setCartCount(count);
      setCartError(null);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
       setCartError(error.response?.data?.message || 'Failed to load cart');

         if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
    }
  };

  const updateCartCount = (count) => {
    setCartCount(count);
  };

  const resetCart = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await Api.delete('/cart/clear/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    setCartCount(0);
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};

const refreshCart = async () => {
    await fetchCartCount();
  };

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, updateCartCount, resetCart, refreshCart, cartError }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);