import React, { useState } from 'react';
import { useAuth } from '../core/AuthContext';
import {
    Users,
    Plus,
    Music,
    Trash2,
    Edit2,
    ChevronRight,
    Upload,
    Calendar,
    Layers,
    Search,
    Clock,
    DollarSign,
    CheckCircle,
    AlertCircle,
    Eye
} from 'lucide-react';

const AdminDashboard = () => {
    const { allUsers, updateArtistBounces, updateArtistBooking, deleteArtistBooking, addArtist, deleteArtist } = useAuth();
    const [selectedArtistId, setSelectedArtistId] = useState(null);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('bounces'); // 'bounces' or 'bookings'
    const [editingBooking, setEditingBooking] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [processingBooking, setProcessingBooking] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        transactionId: '',
        amount: '',
        note: ''
    });

    const [newArtistForm, setNewArtistForm] = useState({
        name: '',
        email: '',
        password: 'vaultartist123' // Default initial password
    });

    // Derived state: Get the latest artist data from allUsers
    const selectedArtist = allUsers.find(u => u.id === selectedArtistId);

    // Form State for Bounces
    const [formData, setFormData] = useState({
        title: '',
        sessionName: '',
        date: new Date().toISOString().split('T')[0],
        file: null
    });

    const handleArtistSelect = (artist) => {
        setSelectedArtistId(artist.id);
        setIsAddingMode(false);
        setEditingBooking(null);
        setIsPaymentModalOpen(false);
    };

    const handleAddArtist = (e) => {
        e.preventDefault();
        addArtist(newArtistForm);
        setIsArtistModalOpen(false);
        setNewArtistForm({ name: '', email: '', password: 'vaultartist123' });
    };

    const handleDeleteArtist = (artistId) => {
        if (window.confirm('WARNING: This will permanently delete this artist and ALL their session data. Proceed?')) {
            deleteArtist(artistId);
            if (selectedArtistId === artistId) setSelectedArtistId(null);
        }
    };

    const handleDeleteBooking = (bookingId) => {
        if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
            deleteArtistBooking(selectedArtist.id, bookingId);
        }
    };

    const handleProcessPayment = (booking) => {
        setProcessingBooking(booking);
        setPaymentForm({
            transactionId: '',
            amount: booking.price.toString(),
            note: `Payment for ${booking.studio} session on ${booking.date}`
        });
        setIsPaymentModalOpen(true);
    };

    const confirmPayment = (e) => {
        e.preventDefault();
        if (!selectedArtist || !processingBooking) return;

        updateArtistBooking(selectedArtist.id, processingBooking.id, {
            status: 'Confirmed',
            paymentStatus: 'Paid',
            paymentMethod: 'Cash App',
            transactionId: paymentForm.transactionId,
            paidAmount: paymentForm.amount
        });

        setIsPaymentModalOpen(false);
        setProcessingBooking(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file });
        }
    };

    const handleAddBounce = (e) => {
        e.preventDefault();
        if (!selectedArtist || !formData.file) return;

        // Create a local blob URL for simulation
        const audioUrl = URL.createObjectURL(formData.file);

        const newBounce = {
            id: Date.now(),
            title: formData.title,
            sessionName: formData.sessionName,
            date: formData.date,
            url: audioUrl,
            fileName: formData.file.name
        };

        const updatedBounces = [...(selectedArtist.bounces || []), newBounce];
        updateArtistBounces(selectedArtist.id, updatedBounces);

        // Reset form
        setFormData({
            title: '',
            sessionName: '',
            date: new Date().toISOString().split('T')[0],
            file: null
        });
        setIsAddingMode(false);
    };

    const handleDeleteBounce = (bounceId) => {
        if (!selectedArtist) return;
        const updatedBounces = selectedArtist.bounces.filter(b => b.id !== bounceId);
        updateArtistBounces(selectedArtist.id, updatedBounces);
    };

    const filteredArtists = allUsers.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 font-sans relative">
            {/* Background Noise Vibe */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>

            {/* Add Artist Modal */}
            {isArtistModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="relative bg-zinc-950 border border-gold/30 w-full max-w-md rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
                        <h3 className="font-display text-3xl font-black text-white uppercase tracking-tighter mb-8">Add New <span className="text-gold">Artist</span></h3>
                        <form onSubmit={handleAddArtist} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Full Artist Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Young Prophet"
                                    value={newArtistForm.name}
                                    onChange={(e) => setNewArtistForm({ ...newArtistForm, name: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-gold outline-none transition-all placeholder:text-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="artist@thevault.com"
                                    value={newArtistForm.email}
                                    onChange={(e) => setNewArtistForm({ ...newArtistForm, email: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-gold outline-none transition-all placeholder:text-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Initial Password</label>
                                <input
                                    required
                                    type="text"
                                    value={newArtistForm.password}
                                    onChange={(e) => setNewArtistForm({ ...newArtistForm, password: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-sm focus:border-gold outline-none transition-all"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsArtistModalOpen(false)} className="flex-1 py-4 text-zinc-500 font-bold uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-gold text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 shadow-lg shadow-gold/10">Create Vault</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cash App Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#00D632] w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,214,50,0.3)] animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-white font-display text-3xl font-bold italic tracking-tighter">Cash App</h3>
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Payment Module</p>
                                </div>
                                <button
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl relative">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-48 h-48 bg-zinc-100 rounded-2xl mb-4 flex items-center justify-center border-2 border-dashed border-zinc-200 overflow-hidden relative">
                                        {/* Mock QR Code Pattern */}
                                        <div className="grid grid-cols-8 gap-0.5 p-4 opacity-10">
                                            {[...Array(64)].map((_, i) => (
                                                <div key={i} className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                                            ))}
                                        </div>
                                        <div className="absolute font-bold text-[#00D632] text-2xl tracking-tighter">$VAULT</div>
                                    </div>
                                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Send Payment To</p>
                                    <p className="text-black font-display text-2xl font-bold tracking-tight">$TheVaultStudios</p>
                                </div>
                            </div>

                            <form onSubmit={confirmPayment} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Confirm Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 font-bold">$</span>
                                            <input
                                                required
                                                type="number"
                                                value={paymentForm.amount}
                                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                                className="w-full bg-white border-0 rounded-xl pl-7 pr-4 py-3 text-black font-bold focus:ring-2 ring-white/50 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Transaction ID</label>
                                        <input
                                            placeholder="#ABC-123"
                                            value={paymentForm.transactionId}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                                            className="w-full bg-white border-0 rounded-xl px-4 py-3 text-black font-bold focus:ring-2 ring-white/50 outline-none placeholder:text-zinc-300"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all shadow-lg active:scale-95"
                                >
                                    Confirm Paid on Cash App
                                </button>
                                <p className="text-center text-white/50 text-[10px] italic">
                                    This will mark the session as Paid and Confirmed instantly.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="font-display text-5xl md:text-7xl font-black mb-2 tracking-tighter uppercase leading-none">
                        ADMIN <span className="text-gold">CONTROL</span>
                    </h1>
                    <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] opacity-80">Management Layer // The Vault Sessions</p>
                </div>

                {/* Analytics Section */}
                {(() => {
                    const artists = allUsers.filter(u => u.role === 'ARTIST');
                    const totalArtists = artists.length;
                    const totalRevenue = artists.reduce((acc, artist) => {
                        return acc + (artist.bookings || []).reduce((sum, b) => {
                            if (b.status === 'Confirmed') return sum + (b.price || 0);
                            return sum;
                        }, 0);
                    }, 0);

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 hover:border-gold/30 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Users size={80} className="text-gold" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Registered Artists</p>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-5xl font-display font-bold text-white tracking-tighter">{totalArtists}</p>
                                        <span className="text-gold text-xs font-bold uppercase tracking-widest">Active Members</span>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-green-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Growth Tracking Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 hover:border-[#00D632]/30 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <DollarSign size={80} className="text-[#00D632]" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Confirmed Studio Revenue</p>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-5xl font-display font-bold text-white tracking-tighter">${totalRevenue.toLocaleString()}</p>
                                        <span className="text-[#00D632] text-xs font-bold uppercase tracking-widest">Gross Revenue</span>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-[#00D632]">
                                        <CheckCircle size={10} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Verified Transitions Only</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Artist List Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-display text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <Users size={24} className="text-gold" />
                                    ARTISTS
                                </h2>
                                <button
                                    onClick={() => setIsArtistModalOpen(true)}
                                    className="p-3 rounded-2xl bg-gold/5 border border-gold/20 text-gold hover:bg-gold hover:text-black transition-all group/add"
                                >
                                    <Plus size={20} className="group-hover/add:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                                <input
                                    type="text"
                                    placeholder="Search by name/email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-white focus:border-gold/50 outline-none transition-all placeholder:text-zinc-800"
                                />
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                                {filteredArtists.map(artist => (
                                    <div key={artist.id} className="relative group/item">
                                        <button
                                            onClick={() => handleArtistSelect(artist)}
                                            className={`w-full text-left p-6 rounded-2xl transition-all border flex items-center justify-between overflow-hidden relative ${selectedArtistId === artist.id
                                                ? 'bg-gold/5 border-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                                                : 'bg-black border-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="relative z-10">
                                                <p className={`font-black text-sm uppercase tracking-wider transition-colors ${selectedArtistId === artist.id ? 'text-gold' : 'text-zinc-400 group-hover/item:text-white'}`}>{artist.name}</p>
                                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{artist.email}</p>
                                            </div>
                                            <ChevronRight size={18} className={`transition-all duration-500 ${selectedArtistId === artist.id ? 'text-gold translate-x-0' : 'text-zinc-800 translate-x-4 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0'}`} />

                                            {/* Selection Glow */}
                                            {selectedArtistId === artist.id && (
                                                <div className="absolute left-0 top-0 h-full w-1 bg-gold shadow-[2px_0_10px_rgba(212,175,55,0.5)]"></div>
                                            )}
                                        </button>

                                        {/* Action Menu (Delete Artist) */}
                                        <button
                                            onClick={() => handleDeleteArtist(artist.id)}
                                            className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Management Area */}
                    <div className="lg:col-span-8">
                        {!selectedArtist ? (
                            <div className="h-full bg-zinc-900/30 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
                                    <Upload size={32} className="text-gray-600" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-gray-500 mb-2 uppercase">No Artist Selected</h3>
                                <p className="text-gray-600 max-w-xs">Select an artist from the sidebar to manage their session bounces.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Individual Insights Row */}
                                {(() => {
                                    const totalInvested = (selectedArtist.bookings || []).reduce((sum, b) => {
                                        if (b.status === 'Confirmed') return sum + (b.price || 0);
                                        return sum;
                                    }, 0);

                                    const audioEngagement = (selectedArtist.bounces || []).reduce((sum, b) => sum + (b.viewCount || 0), 0);
                                    const confirmedSessions = (selectedArtist.bookings || []).filter(b => b.status === 'Confirmed').length;

                                    return (
                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-gold/30 transition-all">
                                                <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Artist Spend</p>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign size={16} className="text-gold" />
                                                    <span className="text-2xl font-display font-black text-white">${totalInvested.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-gold/30 transition-all">
                                                <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Audio Engagement</p>
                                                <div className="flex items-center gap-2">
                                                    <Eye size={16} className="text-gold" />
                                                    <span className="text-2xl font-display font-black text-white">{audioEngagement.toLocaleString()} Views</span>
                                                </div>
                                            </div>
                                            <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-gold/30 transition-all">
                                                <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Confirmed Sessions</p>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-gold" />
                                                    <span className="text-2xl font-display font-black text-white">{confirmedSessions} Visits</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Tabs */}
                                <div className="flex gap-4 mb-6 border-b border-white/5">
                                    <button
                                        onClick={() => setActiveTab('bounces')}
                                        className={`pb-4 px-2 font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'bounces' ? 'text-gold border-gold border-b-2' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Session Bounces
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('bookings')}
                                        className={`pb-4 px-2 font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'bookings' ? 'text-gold border-gold border-b-2' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Bookings & Payments
                                    </button>
                                </div>

                                {activeTab === 'bounces' ? (
                                    <div className="space-y-8 animate-in fade-in duration-500">
                                        {/* Artist Header */}
                                        <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none text-zinc-700"></div>
                                            <div className="relative z-10">
                                                <h2 className="font-display text-4xl font-black text-white mb-1 uppercase tracking-tighter">
                                                    {selectedArtist.name}
                                                </h2>
                                                <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 opacity-80">
                                                    <Layers size={14} />
                                                    {selectedArtist.bounces?.length || 0} Assets Uploaded
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setIsAddingMode(!isAddingMode)}
                                                className={`relative z-10 flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${isAddingMode
                                                    ? 'bg-zinc-900 text-white'
                                                    : 'bg-gold text-black hover:scale-105 active:scale-95 shadow-lg shadow-gold/20'
                                                    }`}
                                            >
                                                {isAddingMode ? <><ChevronRight size={20} className="rotate-180" /> Back</> : <><Plus size={20} /> New Bounce</>}
                                            </button>
                                        </div>

                                        {/* Upload Form */}
                                        {isAddingMode && (
                                            <div className="bg-zinc-900 border border-gold/30 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-top-10 duration-500">
                                                <h3 className="font-display text-2xl font-bold mb-6 text-gold uppercase flex items-center gap-3">
                                                    <Music size={24} />
                                                    New Session Bounce
                                                </h3>
                                                <form onSubmit={handleAddBounce} className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Track Title</label>
                                                            <input
                                                                required
                                                                type="text"
                                                                placeholder="e.g. Lead Vocals - Raw"
                                                                value={formData.title}
                                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all placeholder:text-zinc-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Session Name</label>
                                                            <input
                                                                required
                                                                type="text"
                                                                placeholder="e.g. Midnight Project"
                                                                value={formData.sessionName}
                                                                onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all placeholder:text-zinc-700"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Session Date</label>
                                                            <input
                                                                required
                                                                type="date"
                                                                value={formData.date}
                                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Audio File (.wav, .mp3, .aiff, .mp4)</label>
                                                            <div className="relative">
                                                                <input
                                                                    required
                                                                    type="file"
                                                                    accept=".wav, .mp3, .aif, .aiff, .mp4, audio/*"
                                                                    onChange={handleFileChange}
                                                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-gold hover:file:bg-zinc-700"
                                                                />
                                                            </div>
                                                            {formData.file && (
                                                                <p className="text-[10px] text-gray-500 mt-2 italic truncate">
                                                                    Selected: {formData.file.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end pt-4">
                                                        <button
                                                            type="submit"
                                                            className="bg-gold text-black px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-gold/20"
                                                        >
                                                            Confirm & Add to Artist Vault
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Assets List */}
                                        <div className="space-y-4">
                                            <h3 className="font-display text-xl font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-1 h-6 bg-gold"></div>
                                                Current Assets
                                            </h3>

                                            {!selectedArtist.bounces || selectedArtist.bounces.length === 0 ? (
                                                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-12 text-center text-gray-600 italic">
                                                    No bounces uploaded for this artist yet.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {selectedArtist.bounces.map(bounce => (
                                                        <div
                                                            key={bounce.id}
                                                            className="bg-zinc-900 border border-white/5 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-gold/30 transition-all"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                                                                    <Music className="text-gray-500 group-hover:text-gold transition-colors" size={24} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-white uppercase text-sm md:text-base">{bounce.title}</h4>
                                                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                                        <span className="flex items-center gap-1"><Calendar size={12} className="text-gold" /> {bounce.date}</span>
                                                                        <span className="flex items-center gap-1 font-bold">{bounce.sessionName}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button className="p-3 bg-zinc-800 text-gray-400 hover:text-white rounded-xl transition-all">
                                                                    <Edit2 size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteBounce(bounce.id)}
                                                                    className="p-3 bg-zinc-800 text-gray-400 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Bookings Management Tab */
                                    <div className="space-y-8 animate-in fade-in duration-500">
                                        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                                            <h3 className="font-display text-2xl font-bold mb-6 text-white uppercase flex items-center gap-3">
                                                <Calendar size={24} className="text-gold" />
                                                Session Management
                                            </h3>

                                            {!selectedArtist.bookings || selectedArtist.bookings.length === 0 ? (
                                                <div className="p-12 text-center text-gray-600 italic">
                                                    No bookings found for this artist.
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {selectedArtist.bookings.map(booking => (
                                                        <div
                                                            key={booking.id}
                                                            className="bg-black border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-gold/30 transition-all font-sans"
                                                        >
                                                            {editingBooking && editingBooking.id === booking.id ? (
                                                                <div className="w-full space-y-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                        <div>
                                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Studio</label>
                                                                            <select
                                                                                value={editingBooking.studio}
                                                                                onChange={(e) => setEditingBooking({ ...editingBooking, studio: e.target.value })}
                                                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
                                                                            >
                                                                                <option>Studio A (The Vault)</option>
                                                                                <option>Studio B (The Gallery)</option>
                                                                                <option>Studio C (The Den)</option>
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Date</label>
                                                                            <input
                                                                                type="date"
                                                                                value={editingBooking.date}
                                                                                onChange={(e) => setEditingBooking({ ...editingBooking, date: e.target.value })}
                                                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Time</label>
                                                                            <input
                                                                                type="time"
                                                                                value={editingBooking.time}
                                                                                onChange={(e) => setEditingBooking({ ...editingBooking, time: e.target.value })}
                                                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => setEditingBooking(null)}
                                                                            className="px-4 py-2 bg-zinc-800 text-[10px] font-bold text-white rounded-lg hover:bg-zinc-700 transition-colors uppercase tracking-widest"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                updateArtistBooking(selectedArtist.id, booking.id, editingBooking);
                                                                                setEditingBooking(null);
                                                                            }}
                                                                            className="px-4 py-2 bg-gold text-[10px] font-bold text-black rounded-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                                                                        >
                                                                            Save Changes
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <h4 className="font-bold text-white uppercase">{booking.studio}</h4>
                                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                                                                }`}>
                                                                                {booking.status}
                                                                            </span>
                                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${booking.paymentStatus === 'Paid' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                                                                                }`}>
                                                                                {booking.paymentStatus || 'Unpaid'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                                            <span className="flex items-center gap-1"><Calendar size={12} className="text-zinc-700" /> {booking.date}</span>
                                                                            <span className="flex items-center gap-1"><Clock size={12} className="text-zinc-700" /> {booking.time} ({booking.duration}h)</span>
                                                                            <span className="text-gold font-bold flex items-center gap-1"><DollarSign size={12} /> {booking.price}</span>
                                                                            {booking.paymentMethod && (
                                                                                <span className="flex items-center gap-1 text-[#00D632] font-bold">
                                                                                    <CheckCircle size={12} /> {booking.paymentMethod}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => setEditingBooking(booking)}
                                                                            className="p-2 text-gray-500 hover:text-white transition-colors"
                                                                            title="Edit Booking"
                                                                        >
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        {booking.paymentStatus !== 'Paid' ? (
                                                                            <button
                                                                                onClick={() => handleProcessPayment(booking)}
                                                                                className="flex items-center gap-2 px-4 py-2 bg-[#00D632] text-[10px] font-bold text-white rounded-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(0,214,50,0.2)]"
                                                                            >
                                                                                <DollarSign size={14} />
                                                                                Process Cash App
                                                                            </button>
                                                                        ) : (
                                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-3 py-2 rounded-lg uppercase tracking-widest border border-green-500/20">
                                                                                <CheckCircle size={14} />
                                                                                Verified Paid
                                                                            </div>
                                                                        )}

                                                                        {booking.status !== 'Confirmed' && booking.paymentStatus !== 'Paid' && (
                                                                            <button
                                                                                onClick={() => updateArtistBooking(selectedArtist.id, booking.id, { status: 'Confirmed' })}
                                                                                className="px-4 py-2 bg-zinc-800 text-[10px] font-bold text-white rounded-lg hover:bg-green-600 transition-colors uppercase tracking-widest"
                                                                            >
                                                                                Confirm
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => handleDeleteBooking(booking.id)}
                                                                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                                                            title="Delete Booking"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
