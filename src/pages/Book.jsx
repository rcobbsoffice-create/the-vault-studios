import React, { useState } from 'react';
import { useBooking } from '../core/BookingContext';
import { useAuth } from '../core/AuthContext';
import { Calendar, Clock, CreditCard, Check, Wallet, Plus, X, User, Mail, Phone, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Book = () => {
    const { addToCart } = useBooking();
    const { user, addPaymentMethod, addNewBooking } = useAuth();
    const navigate = useNavigate();

    // Wizard Steps: 1 = Session, 2 = Details, 3 = Payment
    const [step, setStep] = useState(1);

    const [selectedStudio, setSelectedStudio] = useState('Studio A (The Main Room)');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [duration, setDuration] = useState(2);

    // Guest Details
    const [guestDetails, setGuestDetails] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // Payment State
    const [selectedCardId, setSelectedCardId] = useState(user?.wallet?.[0]?.id || 'new');
    const [newCardForm, setNewCardForm] = useState({ brand: 'visa', last4: '', expiry: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const studios = [
        { id: 'A', name: 'Studio A (The Main Room)', price: 75, tag: 'Premium', desc: 'Industry standard recording' },
        { id: 'B', name: 'Studio B (The Lab)', price: 65, tag: 'Pro', desc: 'Perfect for mixing & vocal tracking' },
    ];

    const getPrice = () => {
        const s = studios.find(s => s.name === selectedStudio);
        return s ? s.price * duration : 0;
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!selectedDate || !selectedTime) {
                alert('Please select both date and time.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!user) {
                if (!guestDetails.name || !guestDetails.email || !guestDetails.phone) {
                    alert('Please fill in all details.');
                    return;
                }
            }
            setStep(3);
        }
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Prepare Payment Details
        let paymentDetails = { method: 'Stripe', status: 'Paid' };

        // Handle Card
        if (selectedCardId === 'new') {
            if (newCardForm.last4.length === 4 && newCardForm.expiry) {
                if (user) {
                    addPaymentMethod(newCardForm);
                }
                paymentDetails.card = newCardForm;
            } else {
                alert('Please enter valid card details');
                setIsProcessing(false);
                return;
            }
        } else {
            const card = user?.wallet?.find(c => c.id === selectedCardId);
            paymentDetails.card = card || { brand: 'Unknown', last4: '0000' };
        }

        // Create Booking Data
        const bookingData = {
            studio: selectedStudio,
            date: selectedDate,
            time: selectedTime,
            duration: duration,
            price: getPrice(),
            status: 'Confirmed',
            paymentStatus: 'Paid',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN-' + Date.now().toString().slice(-6),
            guestDetails: user ? {
                name: user.name,
                email: user.email,
                phone: user.phone || ''
            } : guestDetails,
            ...paymentDetails
        };

        try {
            const result = await addNewBooking(bookingData);

            if (result.success) {
                addToCart(selectedStudio, selectedDate, selectedTime, duration);
                setStep(4); // Success State (Optional, or redirect)
                alert('✅ Booking confirmed! Check your email for details.');
                navigate('/dashboard');
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err) {
            console.error(err);
            alert('An unexpected error occurred.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -z-10 rounded-full"></div>
                    <div className={`absolute top-1/2 left-0 h-1 bg-gold -z-10 rounded-full transition-all duration-500`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                    
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`flex flex-col items-center gap-2 bg-black px-2`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${step >= s ? 'bg-gold border-gold text-black' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}>
                                {step > s ? <Check size={20} /> : s}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-widest ${step >= s ? 'text-white' : 'text-zinc-600'}`}>
                                {s === 1 ? 'Session' : s === 2 ? 'Details' : 'Payment'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                    
                    {/* STEP 1: SESSION */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div>
                                <h2 className="text-3xl font-display font-bold mb-2">Select Your Session</h2>
                                <p className="text-zinc-400">Choose the perfect room and time for your creativity.</p>
                            </div>

                            {/* Studios */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {studios.map(studio => (
                                    <button
                                        key={studio.id}
                                        onClick={() => setSelectedStudio(studio.name)}
                                        className={`text-left p-6 rounded-2xl border-2 transition-all group ${selectedStudio === studio.name ? 'border-gold bg-gold/5' : 'border-white/5 bg-black/40 hover:border-white/20'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${selectedStudio === studio.name ? 'bg-gold text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {studio.tag}
                                            </span>
                                            <span className="text-gold font-bold">${studio.price}<span className="text-xs text-zinc-500">/hr</span></span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1">{studio.name}</h3>
                                        <p className="text-sm text-zinc-500">{studio.desc}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="h-px bg-white/5"></div>

                            {/* Date & Time */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 focus:border-gold outline-none"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Time</label>
                                    <select
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 focus:border-gold outline-none appearance-none"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                    >
                                        <option value="">Select Start Time</option>
                                        {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(t => (
                                            <option key={t} value={`${t}:00`}>
                                                {t > 12 ? t - 12 : t}:00 {t >= 12 ? 'PM' : 'AM'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                                    <span>Duration</span>
                                    <span className="text-gold">{duration} Hours</span>
                                </label>
                                <input
                                    type="range"
                                    min="2"
                                    max="8"
                                    step="1"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold"
                                />
                            </div>

                            <button
                                onClick={handleNextStep}
                                className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gold transition-colors flex items-center justify-center gap-2"
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div>
                                <h2 className="text-3xl font-display font-bold mb-2">Artist Details</h2>
                                <p className="text-zinc-400">Who are we recording today?</p>
                            </div>

                            {user ? (
                                <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center text-black font-bold text-xl">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-gold font-bold uppercase tracking-widest text-xs mb-1">Authenticated As</p>
                                        <h3 className="text-xl font-bold">{user.name}</h3>
                                        <p className="text-zinc-400 text-sm">{user.email}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <Check className="text-gold" size={24} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-gold outline-none"
                                            value={guestDetails.name}
                                            onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-gold outline-none"
                                            value={guestDetails.email}
                                            onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-gold outline-none"
                                            value={guestDetails.phone}
                                            onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500 ml-1">* We'll send your booking confirmation here.</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
                                >
                                    <ChevronLeft />
                                </button>
                                <button
                                    onClick={handleNextStep}
                                    className="flex-1 bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gold transition-colors flex items-center justify-center gap-2"
                                >
                                    Review & Pay <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PAYMENT */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div>
                                <h2 className="text-3xl font-display font-bold mb-2">Finalize Booking</h2>
                                <p className="text-zinc-400">Review your session and complete payment.</p>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Session</span>
                                    <span className="font-bold">{selectedStudio}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">When</span>
                                    <span className="font-bold">{selectedDate} @ {selectedTime}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Duration</span>
                                    <span className="font-bold">{duration} Hours</span>
                                </div>
                                <div className="h-px bg-white/10 my-2"></div>
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span className="text-white">Total</span>
                                    <span className="text-gold">${getPrice()}</span>
                                </div>
                            </div>

                            {/* Payment Form (Simplified Repeater) */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Payment Method</label>
                                {(user?.wallet || []).map(card => (
                                    <label key={card.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedCardId === card.id ? 'bg-gold/10 border-gold' : 'bg-black border-white/10'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={card.id}
                                            checked={selectedCardId === card.id}
                                            onChange={() => setSelectedCardId(card.id)}
                                            className="accent-gold w-5 h-5"
                                        />
                                        <div className="font-bold">{card.brand} ending in {card.last4}</div>
                                    </label>
                                ))}
                                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedCardId === 'new' ? 'bg-gold/10 border-gold' : 'bg-black border-white/10'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="new"
                                        checked={selectedCardId === 'new'}
                                        onChange={() => setSelectedCardId('new')}
                                        className="accent-gold w-5 h-5"
                                    />
                                    <div className="font-bold">New Card</div>
                                </label>

                                {selectedCardId === 'new' && (
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <input
                                            type="text"
                                            placeholder="Card Number"
                                            maxLength={4}
                                            className="col-span-2 bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none"
                                            value={newCardForm.last4}
                                            onChange={e => setNewCardForm({ ...newCardForm, last4: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none"
                                            value={newCardForm.expiry}
                                            onChange={e => setNewCardForm({ ...newCardForm, expiry: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="CVC"
                                            className="bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
                                >
                                    <ChevronLeft />
                                </button>
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={isProcessing}
                                    className="flex-1 bg-gold text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? 'Processing...' : `Pay $${getPrice()}`} <Check size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Book;
