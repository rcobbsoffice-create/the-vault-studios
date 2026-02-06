import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

const CART_STORAGE_KEY = 'printaudiolab_cart';

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
        }
    }, [items]);

    const addItem = (product) => {
        setItems(currentItems => {
            // Check if item already exists
            const existingItem = currentItems.find(item => item.id === product.id);
            if (existingItem) {
                // Item already in cart, don't add duplicate for services
                return currentItems;
            }
            // Add new item
            return [...currentItems, {
                id: product.id,
                name: product.name,
                price: product.price,
                type: product.category || 'press-release',
                quantity: 1
            }];
        });
    };

    const removeItem = (productId) => {
        setItems(currentItems => currentItems.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const getItemCount = () => {
        return items.length;
    };

    const getTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const isInCart = (productId) => {
        return items.some(item => item.id === productId);
    };

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const toggleCart = () => setIsOpen(!isOpen);

    const value = {
        items,
        isOpen,
        addItem,
        removeItem,
        clearCart,
        getItemCount,
        getTotal,
        isInCart,
        openCart,
        closeCart,
        toggleCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
