import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], restaurant: null });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart({ items: [], restaurant: null }); return; }
    try {
      setLoading(true);
      const { data } = await cartAPI.get();
      setCart(data.cart || { items: [], restaurant: null });
    } catch (e) {
      setCart({ items: [], restaurant: null });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (foodId, quantity = 1) => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return { success: false }; }
    try {
      const { data } = await cartAPI.add({ foodId, quantity });
      setCart(data.cart);
      toast.success('Added to cart!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add to cart';
      if (error.response?.status === 409) {
        return { success: false, conflict: true, message: msg };
      }
      toast.error(msg);
      return { success: false };
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const { data } = await cartAPI.update(itemId, { quantity });
      setCart(data.cart);
    } catch (e) { toast.error('Failed to update cart'); }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await cartAPI.remove(itemId);
      setCart(data.cart);
      toast.success('Item removed');
    } catch (e) { toast.error('Failed to remove item'); }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart({ items: [], restaurant: null });
    } catch (e) { toast.error('Failed to clear cart'); }
  };

  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal = cart.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

  const getItemQuantity = (foodId) => {
    const item = cart.items?.find((i) => (i.food?._id || i.food)?.toString() === foodId?.toString());
    return item?.quantity || 0;
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, itemCount, subtotal, getItemQuantity, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
