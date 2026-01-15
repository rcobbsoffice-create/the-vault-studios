import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { Calendar, Clock, DollarSign, LogOut, Plus, CheckCircle, AlertCircle, Music, Headphones, CreditCard, Trash2 } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';

const Dashboard = () => {
    const { user, logout, addPaymentMethod, removePaymentMethod } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'bounces'
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardForm, setNewCardForm] = useState({ brand: 'visa', last4: '', expiry: '' });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusColor = (status) => {
        return status === 'Confirmed' ? 'text-green-500' : 'text-yellow-500';
    };

    const getStatusIcon = (status) => {
        return status === 'Confirmed' ? CheckCircle : AlertCircle;
    };

    const handleAddCard = (e) => {
        e.preventDefault();
        if (newCardForm.last4.length === 4 && newCardForm.expiry) {
            addPaymentMethod(newCardForm);
            setIsAddingCard(false);
            setNewCardForm({ brand: 'visa', last4: '', expiry: '' });
        }
    };

    const upcomingBookings = user?.bookings?.filter(b => new Date(b.date) >= new Date()) || [];
    const pastBookings = user?.bookings?.filter(b => new Date(b.date) < new Date()) || [];

    // Group bounces by session or date
    const bounces = user?.bounces || [];

    return (
        <div className="min-h-screen bg-black pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
                    <div>
                        <h1 className="font-display text-4xl md:text-6xl font-bold mb-2">
                            WELCOME BACK, <span className="text-gold">{user?.name?.split(' ')[0]?.toUpperCase()}</span>
                        </h1>
                        <p className="text-gray-400 text-lg">Manage your studio sessions and assets</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/book"
                            className="bg-gold text-black font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Book Session
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-white/10 rounded-full hover:border-gold/50 transition-all text-gray-300 hover:text-white text-sm"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold transition-colors">
                                <Calendar className="text-gold group-hover:text-black transition-colors" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Upcoming Sessions</p>
                                <p className="text-3xl font-bold text-white">{upcomingBookings.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold transition-colors">
                                <Music className="text-gold group-hover:text-black transition-colors" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Session Bounces</p>
                                <p className="text-3xl font-bold text-white">{bounces.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold transition-colors">
                                <DollarSign className="text-gold group-hover:text-black transition-colors" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Spent</p>
                                <p className="text-3xl font-bold text-white">
                                    ${user?.bookings?.reduce((sum, b) => sum + b.price, 0) || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-white/10 mb-8">
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'bookings'
                                ? 'text-gold border-b-2 border-gold'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            Bookings & Payments
                        </button>
                        <button
                            onClick={() => setActiveTab('bounces')}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'bounces'
                                ? 'text-gold border-b-2 border-gold'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            Session Bounces
                        </button>
                    </div>

                    {activeTab === 'bookings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-500">
                            <div className="lg:col-span-2 space-y-12">
                                {/* Wallet Section */}
                                <div>
                                    <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
                                        <div className="w-1 h-8 bg-gold"></div>
                                        MY WALLET
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Existing Cards */}
                                        {(user?.wallet || []).map(card => (
                                            <div key={card.id} className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 rounded-xl p-6 group overflow-hidden">
                                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => removePaymentMethod(card.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-start mb-8">
                                                    <CreditCard className="text-gold" size={32} />
                                                    <span className="font-mono text-zinc-500 text-xs">{card.expiry}</span>
                                                </div>
                                                <div className="font-mono text-xl text-white tracking-widest mb-2">
                                                    •••• •••• •••• {card.last4}
                                                </div>
                                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                    {card.brand}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add New Card */}
                                        {isAddingCard ? (
                                            <form onSubmit={handleAddCard} className="bg-zinc-900 border border-gold/30 rounded-xl p-6 space-y-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="text-xs font-bold text-white uppercase">Add Card</h3>
                                                    <button type="button" onClick={() => setIsAddingCard(false)} className="text-zinc-500 hover:text-white text-xs">Cancel</button>
                                                </div>
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Last 4 Digits"
                                                        maxLength={4}
                                                        value={newCardForm.last4}
                                                        onChange={e => setNewCardForm({ ...newCardForm, last4: e.target.value })}
                                                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        value={newCardForm.expiry}
                                                        onChange={e => setNewCardForm({ ...newCardForm, expiry: e.target.value })}
                                                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={newCardForm.last4.length !== 4 || !newCardForm.expiry}
                                                        className="w-full bg-gold text-black font-bold py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                                                    >
                                                        Save Card
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => setIsAddingCard(true)}
                                                className="border-2 border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all text-sm font-bold uppercase tracking-widest min-h-[160px]"
                                            >
                                                <Plus size={32} />
                                                Add Payment Method
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Upcoming Sessions */}
                                <div>
                                    <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
                                        <div className="w-1 h-8 bg-gold"></div>
                                        UPCOMING SESSIONS
                                    </h2>

                                    {upcomingBookings.length === 0 ? (
                                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 text-center">
                                            <p className="text-gray-500 text-sm mb-4">No sessions scheduled</p>
                                            <Link to="/book" className="text-gold hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                                                Book Now →
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {upcomingBookings.map((booking) => {
                                                const StatusIcon = getStatusIcon(booking.status);
                                                return (
                                                    <div
                                                        key={booking.id}
                                                        className="bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition-all group"
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                                    <StatusIcon size={12} />
                                                                    {booking.status}
                                                                </span>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${booking.paymentStatus === 'Paid' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                                                                    }`}>
                                                                    {booking.paymentStatus || 'Unpaid'}
                                                                    {booking.paymentMethod === 'Cash App' && ' (CASH APP)'}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-gold font-bold block">${booking.price}</span>
                                                                {booking.transactionId && (
                                                                    <span className="text-[8px] text-gray-600 block uppercase tracking-tighter">#{booking.transactionId}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <h3 className="font-display text-lg font-bold text-white mb-2 uppercase group-hover:text-gold transition-colors">
                                                            {booking.studio}
                                                        </h3>
                                                        <div className="space-y-1 text-xs text-gray-500">
                                                            <p className="flex items-center gap-2"><Calendar size={14} className="text-zinc-700" /> {new Date(booking.date).toLocaleDateString()}</p>
                                                            <p className="flex items-center gap-2"><Clock size={14} className="text-zinc-700" /> {booking.time} ({booking.duration}h)</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-12">
                                {/* Past Sessions */}
                                {pastBookings.length > 0 && (
                                    <div>
                                        <h2 className="font-display text-2xl font-bold mb-6 text-zinc-600">HISTORY</h2>
                                        <div className="space-y-3">
                                            {pastBookings.slice(0, 3).map((booking) => (
                                                <div key={booking.id} className="p-4 rounded-xl bg-zinc-900/30 border border-white/5 flex justify-between items-center group overflow-hidden relative">
                                                    <div className="absolute left-0 top-0 w-1 h-full bg-zinc-800"></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">{booking.studio}</p>
                                                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{new Date(booking.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <p className="text-zinc-600 font-bold">${booking.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bounces' && (
                        <div className="animate-in fade-in duration-500">
                            <h2 className="font-display text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="w-1 h-8 bg-gold"></div>
                                MY WAVE BOUNCES
                            </h2>

                            {bounces.length === 0 ? (
                                <div className="bg-zinc-900/50 border border-white/5 border-dashed rounded-3xl p-16 text-center">
                                    <Headphones size={48} className="mx-auto mb-4 text-zinc-700" />
                                    <p className="text-gray-500 font-bold uppercase tracking-widest">No tracks ready yet</p>
                                    <p className="text-zinc-600 text-sm mt-1">Tracks will appear here after your engineer uploads them.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bounces.map((track) => (
                                        <AudioPlayer key={track.id} track={track} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
