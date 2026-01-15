import React, { useState } from 'react';
import { useBooking } from '../core/BookingContext';
import { useAuth } from '../core/AuthContext';
import { Calendar, Clock, CreditCard, Check, Wallet, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Book = () => {
    const { addToCart } = useBooking();
    const { user, addPaymentMethod } = useAuth();
    const navigate = useNavigate();

    const [selectedStudio, setSelectedStudio] = useState('Studio A (The Main Room)');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [duration, setDuration] = useState(2);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState(user?.wallet?.[0]?.id || 'new');
    const [newCardForm, setNewCardForm] = useState({ brand: 'visa', last4: '', expiry: '' });

    const studios = [
        { id: 'A', name: 'Studio A (The Main Room)', price: 75, tag: 'Premium' },
        { id: 'B', name: 'Studio B (The Lab)', price: 65, tag: 'Pro' },
    ];

    const getPrice = () => {
        const s = studios.find(s => s.name === selectedStudio);
        return s ? s.price * duration : 0;
    };

    const handleInitiateBooking = () => {
        if (selectedDate && selectedTime) {
            setIsPaymentModalOpen(true);
        } else {
            alert('⚠️ Please select both date and time');
        }
    };

    const handleConfirmPayment = (e) => {
        e.preventDefault();

        let paymentDetails = { method: 'Stripe', status: 'Paid' };

        // If using new card, save it to wallet if logged in
        if (selectedCardId === 'new') {
            if (newCardForm.last4.length === 4 && newCardForm.expiry) {
                if (user) {
                    addPaymentMethod(newCardForm);
                }
                paymentDetails.card = newCardForm;
            } else {
                alert('Please enter valid card details');
                return;
            }
        } else {
            const card = user.wallet.find(c => c.id === selectedCardId);
            paymentDetails.card = card;
        }

        addToCart(selectedStudio, selectedDate, selectedTime, duration);
        setIsPaymentModalOpen(false);
        alert('✅ Booking confirmed! Payment processed successfully.');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-b from-zinc-900 to-black border-b border-white/5 pt-32 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                        BOOK YOUR SESSION
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Select your studio, pick your time, and get ready to create. Premium booking starts at $65/hr.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Studio Selection */}
                        <div className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-2xl p-8 transition-all hover:border-gold/30">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold text-black font-bold text-lg">
                                    1
                                </div>
                                <h2 className="text-2xl font-display font-bold text-white">Select Room</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {studios.map(studio => (
                                    <button
                                        key={studio.id}
                                        onClick={() => setSelectedStudio(studio.name)}
                                        className={`group relative p-6 rounded-xl transition-all duration-300 border-2 ${selectedStudio === studio.name
                                            ? 'bg-gradient-to-br from-gold via-gold to-yellow-600 border-gold shadow-2xl shadow-gold/20 scale-[1.02]'
                                            : 'bg-black/50 border-white/10 hover:border-gold/50 hover:bg-zinc-900/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="text-left">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`font-display text-xl font-bold ${selectedStudio === studio.name ? 'text-black' : 'text-white'}`}>
                                                        {studio.name}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${selectedStudio === studio.name
                                                        ? 'bg-black/20 text-black'
                                                        : 'bg-gold/10 text-gold'
                                                        }`}>
                                                        {studio.tag}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-3xl font-bold ${selectedStudio === studio.name ? 'text-black' : 'text-gold'}`}>
                                                    ${studio.price}
                                                    <span className="text-sm font-normal opacity-70">/hr</span>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedStudio === studio.name && (
                                            <div className="absolute top-4 right-4">
                                                <Check className="w-6 h-6 text-black" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-2xl p-8 transition-all hover:border-gold/30">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold text-black font-bold text-lg">
                                    2
                                </div>
                                <h2 className="text-2xl font-display font-bold text-white">Date & Time</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gold" />
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full bg-black/70 border-2 border-white/20 rounded-xl px-4 py-3.5 text-white focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        value={selectedDate}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gold" />
                                        Start Time
                                    </label>
                                    <select
                                        className="w-full bg-black/70 border-2 border-white/20 rounded-xl px-4 py-3.5 text-white focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all appearance-none cursor-pointer"
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        value={selectedTime}
                                    >
                                        <option value="">Select Time</option>
                                        {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(t => (
                                            <option key={t} value={`${t}:00`}>
                                                {t > 12 ? t - 12 : t}:00 {t >= 12 ? 'PM' : 'AM'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3">
                                    Duration: <span className="text-gold">{duration} Hours</span>
                                </label>
                                <input
                                    type="range"
                                    min="2"
                                    max="8"
                                    step="1"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold"
                                    style={{
                                        background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${((duration - 2) / 6) * 100}%, #27272a ${((duration - 2) / 6) * 100}%, #27272a 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                                    <span>2 hrs (Min)</span>
                                    <span>8 hrs (Max)</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border-2 border-gold/30 rounded-2xl p-8 shadow-2xl shadow-gold/10">
                            <h3 className="text-2xl font-display font-bold mb-6 text-white flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-gold" />
                                SUMMARY
                            </h3>

                            <div className="space-y-5 mb-8 pb-6 border-b border-white/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400 font-medium">Studio</span>
                                    <span className="text-white font-semibold text-right max-w-[60%]">{selectedStudio}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400 font-medium">Date</span>
                                    <span className="text-white font-semibold">{selectedDate || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400 font-medium">Time</span>
                                    <span className="text-white font-semibold">{selectedTime || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400 font-medium">Duration</span>
                                    <span className="text-white font-semibold">{duration} hrs</span>
                                </div>
                            </div>

                            <div className="bg-black/50 rounded-xl p-5 mb-6">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-400 font-medium">Total</span>
                                    <div>
                                        <span className="text-4xl font-bold text-gold">${getPrice()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleInitiateBooking}
                                disabled={!selectedDate || !selectedTime}
                                className="w-full bg-gradient-to-r from-gold via-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wider text-sm"
                            >
                                Proceed to Pay
                            </button>

                            <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Secure Stripe Payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-gold/30 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-display font-bold text-white uppercase flex items-center gap-2">
                                    <Wallet className="text-gold" /> Checkout
                                </h3>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleConfirmPayment} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Select Payment Method</label>
                                    <div className="space-y-3">
                                        {(user?.wallet || []).map(card => (
                                            <label key={card.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedCardId === card.id ? 'bg-gold/10 border-gold' : 'bg-black border-white/10 hover:border-white/30'}`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={card.id}
                                                    checked={selectedCardId === card.id}
                                                    onChange={() => setSelectedCardId(card.id)}
                                                    className="accent-gold w-5 h-5"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-white uppercase tracking-wider">{card.brand} ending in {card.last4}</span>
                                                        <span className="text-xs text-zinc-500 font-mono">{card.expiry}</span>
                                                    </div>
                                                </div>
                                                <CreditCard className="text-zinc-400" size={20} />
                                            </label>
                                        ))}

                                        <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedCardId === 'new' ? 'bg-gold/10 border-gold' : 'bg-black border-white/10 hover:border-white/30'}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="new"
                                                checked={selectedCardId === 'new'}
                                                onChange={() => setSelectedCardId('new')}
                                                className="accent-gold w-5 h-5"
                                            />
                                            <span className="font-bold text-white uppercase tracking-wider flex-1">Use New Card</span>
                                            <Plus className="text-zinc-400" size={20} />
                                        </label>
                                    </div>
                                </div>

                                {selectedCardId === 'new' && (
                                    <div className="bg-black/50 rounded-xl p-4 border border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Card Number (Last 4 digits for demo)"
                                            maxLength={4}
                                            value={newCardForm.last4}
                                            onChange={e => setNewCardForm({ ...newCardForm, last4: e.target.value })}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold outline-none"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                required
                                                type="text"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={newCardForm.expiry}
                                                onChange={e => setNewCardForm({ ...newCardForm, expiry: e.target.value })}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold outline-none"
                                            />
                                            <input
                                                required
                                                type="text"
                                                placeholder="CVC"
                                                maxLength={3}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-white/10 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Total to Pay</span>
                                        <span className="text-3xl font-bold text-gold">${getPrice()}</span>
                                    </div>
                                    <button type="submit" className="w-full bg-gold text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-white transition-colors shadow-lg shadow-gold/10 active:scale-95">
                                        Confirm Payment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Book;
