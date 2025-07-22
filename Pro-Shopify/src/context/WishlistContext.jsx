import { createContext, useContext, useState, useEffect, useCallback } from 'react'; 
import Api from '../Services/Api'; 

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

 
  const fetchWishlistCount = useCallback(async () => {
    setLoadingWishlist(true); 
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setWishlistCount(0);
        setLoadingWishlist(false);
        return;
      }
      const response = await Api.get('/wishlist/count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWishlistCount(response.data.count);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      setWishlistCount(0);
    } finally {
      setLoadingWishlist(false); 
    }
  }, []);

  const fetchWishlistItems = useCallback(async () => {
    setLoadingWishlist(true); 
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setWishlistItems([]);
        setLoadingWishlist(false);
        return;
      }

      const response = await Api.get('/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWishlistItems(Array.isArray(response.data.items) ? response.data.items : []);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      setWishlistItems([]); 
    } finally {
      setLoadingWishlist(false); 
    }
  }, []); 

  const addToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
      
        console.warn('Cannot add to wishlist: User not authenticated.');
        return false;
      }

      await Api.post('/wishlist', { productId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      await Promise.all([fetchWishlistCount(), fetchWishlistItems()]);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to add to wishlist.' };
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Cannot remove from wishlist: User not authenticated.');
        return false;
      }

      await Api.delete(`/wishlist/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      await Promise.all([fetchWishlistCount(), fetchWishlistItems()]);
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to remove from wishlist.' };
    }
  };

  const isInWishlist = useCallback((productId) => {

    return Array.isArray(wishlistItems) && wishlistItems.some(item => item.product?._id === productId);
  }, [wishlistItems]); 

  useEffect(() => {
    fetchWishlistCount();
    fetchWishlistItems();
  }, [fetchWishlistCount, fetchWishlistItems]); 

  return (
    <WishlistContext.Provider
      value={{
        wishlistCount,
        wishlistItems,
        loadingWishlist, 
        fetchWishlistCount,
        fetchWishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);