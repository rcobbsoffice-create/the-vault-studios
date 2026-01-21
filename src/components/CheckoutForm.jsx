import React, { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const CheckoutForm = ({ amount, bookingId, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL for fallback (mobile/redirects)
                return_url: `${window.location.origin}/dashboard?payment_success=true&bookingId=${bookingId}`,
            },
            // We'll handle the redirect/success in the component if possible
            redirect: 'if_required',
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else {
            // Payment succeeded!
            onSuccess();
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-xl">
                <PaymentElement id="payment-element" />
            </div>

            {message && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold uppercase">
                    <AlertCircle size={14} />
                    <span>{message}</span>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <button
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    className="w-full bg-gold text-black font-black py-4 rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        `PAY $${amount} DEPOSIT`
                    )}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-full text-zinc-500 font-bold py-2 uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                >
                    Cancel Payment
                </button>
            </div>
        </form>
    );
};

export default CheckoutForm;
