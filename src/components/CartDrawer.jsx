import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Loader2, ShoppingBag, ArrowRight, LogIn } from 'lucide-react';
import { useCart } from '../core/CartContext';
import { useAuth } from '../core/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

const CartDrawer = () => {
    const { items, isOpen, closeCart, removeItem, clearCart, getTotal, getItemCount } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        if (items.length === 0) return;
        
        setIsCheckingOut(true);
        setError(null);
        
        try {
            const createServiceCheckout = httpsCallable(functions, 'createServiceCheckout');
            const result = await createServiceCheckout({
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            });
            
            // Redirect to Stripe Checkout
            if (result.data.url) {
                window.location.href = result.data.url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.message || 'Failed to start checkout. Please try again.');
            setIsCheckingOut(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-in fade-in duration-200"
                onClick={closeCart}
            />
            
            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-white/10 z-[100] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="text-gold" size={24} />
                        <h2 className="text-xl font-display font-bold">Your Cart</h2>
                        {getItemCount() > 0 && (
                            <span className="bg-gold text-black text-xs font-bold px-2 py-1 rounded-full">
                                {getItemCount()}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={closeCart}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingBag className="text-zinc-700 mb-4" size={64} />
                            <h3 className="text-lg font-bold text-white mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 text-sm mb-6">Add services to get started</p>
                            <Link 
                                to="/services"
                                onClick={closeCart}
                                className="text-gold hover:text-white transition-colors text-sm font-bold uppercase tracking-wide"
                            >
                                Browse Services
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div 
                                    key={item.id}
                                    className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-start gap-4"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1">{item.name}</h4>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            {item.type === 'website' ? 'Website Design' : 'Press Release'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gold font-bold">${item.price}</div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-400 transition-colors mt-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with Total and Checkout */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-white/10 space-y-4">
                        {/* Total */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="text-2xl font-display font-bold text-gold">${getTotal()}</span>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Checkout Button */}
                        {isAuthenticated ? (
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full bg-gold text-black py-4 rounded-xl font-bold text-lg uppercase tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Checkout
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    closeCart();
                                    navigate('/login?redirect=/services');
                                }}
                                className="w-full bg-gold text-black py-4 rounded-xl font-bold text-lg uppercase tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <LogIn size={18} />
                                Sign In to Checkout
                            </button>
                        )}

                        {/* Clear Cart */}
                        <button
                            onClick={clearCart}
                            disabled={isCheckingOut}
                            className="w-full text-gray-500 hover:text-white py-2 text-sm font-bold uppercase tracking-wide transition-colors"
                        >
                            Clear Cart
                        </button>

                        {/* Secure Badge */}
                        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs pt-2">
                            <svg width="40" height="16" viewBox="0 0 60 25" fill="currentColor" className="opacity-50">
                                <path d="M59.64 14.28c0-4.59-2.24-7.87-6.03-7.87-3.6 0-5.88 3.05-5.88 7.63 0 5.17 2.6 7.98 6.59 7.98 1.83 0 3.27-.4 4.34-1.07v-3.37c-1.03.63-2.12.92-3.26.92-1.28 0-2.03-.44-2.19-1.57h9.43c.01-.19.01-.43.01-.64zm-8.48-2.11c0-1.22.69-2.17 1.84-2.17 1.13 0 1.75.95 1.75 2.17h-3.59z" />
                            </svg>
                            <span>Secure checkout powered by Stripe</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
