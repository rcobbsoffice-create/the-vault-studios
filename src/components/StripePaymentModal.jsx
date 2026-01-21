import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import CheckoutForm from './CheckoutForm';
import { X, ShieldCheck, Loader2 } from 'lucide-react';

// Initialize Stripe outside of component to avoid recreation
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const StripePaymentModal = ({ booking, isOpen, onClose, onSuccess }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && booking?.id) {
            getPaymentIntent();
        }
    }, [isOpen, booking]);

    const getPaymentIntent = async () => {
        setLoading(true);
        setError(null);
        try {
            const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
            const result = await createPaymentIntent({ bookingId: booking.id });
            setClientSecret(result.data.clientSecret);
        } catch (err) {
            console.error("Payment Intent Error:", err);
            setError(err.message || "Failed to initialize payment.");
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    const appearance = {
        theme: 'night',
        variables: {
            colorPrimary: '#D4AF37',
            colorBackground: '#18181b', // zinc-900
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '12px',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-gold mb-1">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Checkout</span>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Session Deposit</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-500">
                            <Loader2 className="animate-spin text-gold" size={40} />
                            <p className="font-bold uppercase text-[10px] tracking-widest">Initializing Secure Connection...</p>
                        </div>
                    ) : error ? (
                        <div className="py-10 text-center space-y-4">
                            <p className="text-red-500 font-bold">{error}</p>
                            <button
                                onClick={getPaymentIntent}
                                className="text-gold underline font-bold uppercase text-xs"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : clientSecret && (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm
                                amount={booking.depositAmount || (booking.totalCost / 2)}
                                bookingId={booking.id}
                                onSuccess={onSuccess}
                                onCancel={onClose}
                            />
                        </Elements>
                    )}

                    {/* Powered by Stripe */}
                    <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
                        <div className="flex items-center gap-2 opacity-30 group grayscale hover:grayscale-0 transition-all">
                            <span className="text-[10px] font-bold text-white uppercase">Powered by</span>
                            <svg width="60" height="25" viewBox="0 0 60 25" fill="white"><path d="M59.64 14.28c0-4.59-2.24-7.87-6.03-7.87-3.6 0-5.88 3.05-5.88 7.63 0 5.17 2.6 7.98 6.59 7.98 1.83 0 3.27-.4 4.34-1.07v-3.37c-1.03.63-2.12.92-3.26.92-1.28 0-2.03-.44-2.19-1.57h9.43c.01-.19.01-.43.01-.64zm-8.48-2.11c0-1.22.69-2.17 1.84-2.17 1.13 0 1.75.95 1.75 2.17h-3.59zM42.22 8.49c-.29-.11-.53-.14-.83-.14-1.56 0-2.61.98-2.61 3.12v8.27h4.48v-8.23c0-1.15.54-1.57 1.29-1.57.17 0 .34.02.5.06V6.15c-.48-.06-.97-.08-1.52.06v2.28zM31.25 2.9l-4.48 1.14v15.7h4.48V2.9zM22.35 11.5c-.95-.49-1.67-.64-1.67-1.25 0-.52.45-.93 1.2-.93.92 0 1.93.34 2.85.87V6.43c-1.21-.55-2.52-.84-3.79-.84-3.04 0-4.74 1.58-4.74 4.24 0 4.01 2.82 5.09 4.71 6.07 1.11.58 1.5 1.02 1.5 1.63 0 .76-.63 1.21-1.53 1.21-1.04 0-2.24-.45-3.31-1.1v3.83c1.27.64 2.72.93 4.15.93 3.12 0 5.05-1.52 5.05-4.28 0-4.32-3.15-5.33-4.42-5.99zM7.12 11.1c-1.23-.44-2.06-.62-2.06-1.5 0-.5.44-.83 1.17-.83.93 0 1.89.37 2.7.89V6.1c-1.3-.59-2.75-.88-4.14-.88-3.16 0-4.84 1.69-4.84 4.36 0 4.06 2.84 5.2 4.79 6.27 1.05.6 1.41.96 1.41 1.6 0 .8-.75 1.3-1.63 1.3-1.17 0-2.42-.45-3.32-1.16v3.85c1.48.65 3.07.97 4.7.97 3.5 0 5.29-1.55 5.29-4.23.01-4.08-2.65-5.46-4.07-5.95zM56.41 1.17c-1.3-.39-2.6-.58-3.9-.58-4.3 0-7.1 2.5-7.1 7.2v1.2h-2.5v3.8h2.5v12.2h4.5V12.8h3.3v-3.8h-3.3V7.9c0-1.2.4-1.8 1.4-1.8.6 0 1.2.1 1.8.3L56.41 1.17z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StripePaymentModal;
