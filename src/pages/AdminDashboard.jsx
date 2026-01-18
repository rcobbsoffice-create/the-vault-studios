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
    Mail,
    Send,
    Eye,
    LayoutDashboard,
    Play,
    Pause,
    Mic
} from 'lucide-react';
import CalendarView from '../components/admin/CalendarView';
import EmailEditor from '../components/admin/EmailEditor';
import VoiceDebugger from '../components/admin/VoiceDebugger';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

const AdminDashboard = () => {
    const { allUsers, updateArtistBounces, updateArtistBooking, deleteArtistBooking, addArtist, deleteArtist, uploadBounce } = useAuth();

    // View State
    const [currentView, setCurrentView] = useState('calendar'); // 'dashboard', 'calendar', 'clients'

    // Selection State
    const [selectedArtistId, setSelectedArtistId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'bounces'

    // Modal & Form State
    const [isAddingMode, setIsAddingMode] = useState(false); // For Bounces
    const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // NEW: Manage Booking Modal
    const [editingBooking, setEditingBooking] = useState(null);
    const [processingBooking, setProcessingBooking] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Stripe');

    // Marketing State
    const [newsletterForm, setNewsletterForm] = useState({ subject: '', body: '' });

    // Audio Preview State
    const [previewPlayingId, setPreviewPlayingId] = useState(null);
    const audioPreviewRef = React.useRef(new Audio());

    // Forms
    const [paymentForm, setPaymentForm] = useState({
        transactionId: '',
        amount: '',
        note: ''
    });

    const [newArtistForm, setNewArtistForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: 'vaultartist123'
    });

    const [formData, setFormData] = useState({
        title: '',
        sessionName: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Demo',
        file: null
    });

    // Derived Data
    const selectedArtist = allUsers.find(u => u.id === selectedArtistId);
    const filteredArtists = allUsers.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleArtistSelect = (artist) => {
        setSelectedArtistId(artist.id);
        setIsAddingMode(false);
        setEditingBooking(null);
        setIsPaymentModalOpen(false);
        setIsBookingModalOpen(false);
    };

    const handleAddArtist = (e) => {
        e.preventDefault();
        addArtist(newArtistForm);
        setIsArtistModalOpen(false);
        setNewArtistForm({ name: '', email: '', phone: '', password: 'vaultartist123' });
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

    const handleProcessPayment = (booking, artistId = null) => {
        const artist = artistId ? allUsers.find(u => u.id === artistId) : selectedArtist;
        if (!artist) return;
        if (artistId && artistId !== selectedArtistId) setSelectedArtistId(artistId);

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
        // If processingBooking and selectedArtist/artistId is set
        const artist = selectedArtist || allUsers.find(u => u.id === processingBooking.clientId); // Fallback for calendar view

        if (!artist || !processingBooking) return;

        let method = 'Stripe';
        if (paymentMethod === 'CashApp') method = 'Cash App';
        if (paymentMethod === 'Manual') method = `Manual (${paymentForm.note || 'No Note'})`;

        updateArtistBooking(artist.id, processingBooking.id, {
            status: 'Confirmed',
            paymentStatus: 'Paid',
            paymentMethod: method,
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

    // State for Editing Client Profile
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', phone: '' });

    const openEditProfile = () => {
        if (selectedArtist) {
            setProfileForm({ name: selectedArtist.name, phone: selectedArtist.phone || '' });
            setIsEditingProfile(true);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const result = await updateUserProfile(selectedArtist.id, profileForm);
        if (result.success) {
            alert("✅ Client profile updated.");
            setIsEditingProfile(false);
        } else {
            alert("Error: " + result.error);
        }
    };

    const handleAddBounce = async (e) => {
        e.preventDefault();
        if (!selectedArtist || !formData.file) return;

        // Show simplified loading indication (could be improved with a real UI state)
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "UPLOADING...";
        submitBtn.disabled = true;

        const result = await uploadBounce(selectedArtist.id, formData.file, {
            title: formData.title,
            sessionName: formData.sessionName,
            date: formData.date,
            type: formData.type // 'Demo', 'Mixed', 'Master'
        });

        if (result.success) {
            // CONDITIONAL SMS NOTIFICATION
            if (formData.type === 'Mix' || formData.type === 'Master') {
                if (selectedArtist.phone && selectedArtist.preferences?.smsEnabled !== false) {
                    const action = formData.type === 'Master' ? 'MASTERED' : 'MIXED';
                    const msg = `THE VAULT: Your track '${formData.title}' has been ${action} and is ready for review in your dashboard.`;
                    sendSMS(selectedArtist.phone, msg);
                    alert(`✅ Track uploaded & SMS (${action}) Sent!`);
                } else {
                    alert("✅ Track uploaded (No SMS sent - Check phone/preferences)");
                }
            } else {
                alert("✅ Track uploaded successfully!");
            }

            setFormData({
                title: '',
                sessionName: '',
                date: new Date().toISOString().split('T')[0],
                type: 'Demo',
                file: null
            });
            setIsAddingMode(false);
        } else {
            alert("❌ Upload failed: " + result.error);
        }
        setIsAddingMode(false);

        // Reset button (if component didn't unmount/change view)
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    };

    const handleDeleteBounce = (bounceId) => {
        if (!selectedArtist) return;
        const updatedBounces = selectedArtist.bounces.filter(b => b.id !== bounceId);
        updateArtistBounces(selectedArtist.id, updatedBounces);
    };

    const [editingBounceId, setEditingBounceId] = useState(null);
    const [editBounceForm, setEditBounceForm] = useState(null);

    const handleEditBounce = (bounce) => {
        setEditingBounceId(bounce.id);
        setEditBounceForm({ ...bounce });
    };

    const handleCancelEditBounce = () => {
        setEditingBounceId(null);
        setEditBounceForm(null);
    };

    const handleSaveBounce = async () => {
        if (!selectedArtist || !editBounceForm) return;

        const updatedBounces = selectedArtist.bounces.map(b =>
            b.id === editingBounceId ? editBounceForm : b
        );

        await updateArtistBounces(selectedArtist.id, updatedBounces);
        setEditingBounceId(null);
        setEditBounceForm(null);
        alert("✅ Bounce details updated!");
    };

    const togglePreview = (bounce) => {
        const audio = audioPreviewRef.current;

        if (previewPlayingId === bounce.id) {
            // Pause
            audio.pause();
            setPreviewPlayingId(null);
        } else {
            // Play New
            audio.src = bounce.url;
            audio.play().catch(e => alert("Playback failed: " + e.message));
            setPreviewPlayingId(bounce.id);

            // Reset when done
            audio.onended = () => setPreviewPlayingId(null);
        }
    };

    // NEW: Handle Quick Actions from Booking Modal
    const handleUpdateStatus = (status) => {
        if (!editingBooking || !selectedArtistId) return;

        // If denying, verify
        if (status === 'Denied' && !window.confirm('Are you sure you want to DENY this booking?')) return;

        updateArtistBooking(selectedArtistId, editingBooking.id, {
            status,
            // If confirming, set payment status to Unpaid if not set, or leave as is?
            // Usually confirmation is independent of payment, but let's assume Unpaid if generic.
        });
        setIsBookingModalOpen(false);
        setEditingBooking(null);
    };

    const handleSaveChanges = () => {
        if (!editingBooking || !selectedArtistId) return;
        updateArtistBooking(selectedArtistId, editingBooking.id, editingBooking);
        setIsBookingModalOpen(false);
        setEditingBooking(null);
    };

    const handleSendNewsletter = async ({ subject, html }) => {
        // e.preventDefault() is not needed as this is called component-internally with payload
        const recipients = allUsers.filter(u => u.role === 'ARTIST').map(u => u.email).join(',');

        // VISUAL FEEDBACK
        alert(`Requesting Cloud Function...`);

        try {
            // Updated to use local dev function directly to bypass auth/emulator issues
            const DEV_EMAIL_URL = 'http://localhost:5002';

            const response = await fetch(DEV_EMAIL_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'demo-list@thevaultstudios.com',
                    subject: subject,
                    html: html
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(`✅ Email sent successfully! (ID: ${result.messageId || 'Simulated'})`);
                setNewsletterForm({ subject: '', body: '' });
            } else {
                throw new Error(result.error || result.message || 'Unknown error');
            }
        } catch (error) {
            console.error("Email send failed:", error);
            alert(`❌ Email Failed: ${error.message}`);
        }
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            let count = 0;
            lines.forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    const name = parts[0]?.trim();
                    const email = parts[1]?.trim();
                    const phone = parts[2]?.trim();
                    if (email && email.includes('@')) {
                        addArtist({ name: name || 'Imported User', email, phone: phone || '', password: 'vaultuser123' });
                        count++;
                    }
                }
            });
            if (count > 0) alert(`Successfully imported ${count} contacts!`);
            else alert('No valid contacts found. CSV format: Name,Email,Phone');
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 font-sans relative">
            {/* ... (Background) */}

            {/* NEW: Booking Management Modal */}
            {isBookingModalOpen && editingBooking && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="relative bg-zinc-950 border border-gold/30 w-full max-w-lg rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="font-display text-3xl font-black text-white uppercase tracking-tighter">Manage <span className="text-gold">Session</span></h3>
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Booking ID: #{editingBooking.id.toString().slice(-6)}</p>
                            </div>
                            <button onClick={() => setIsBookingModalOpen(false)} className="bg-zinc-900 hover:bg-zinc-800 text-white p-3 rounded-full transition-colors"><Plus className="rotate-45" size={20} /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Quick Status Actions */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleUpdateStatus('Confirmed')}
                                    className="bg-[#00D632]/10 border border-[#00D632]/50 text-[#00D632] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#00D632] hover:text-black transition-all flex items-center justify-center gap-2 group"
                                >
                                    <CheckCircle size={18} className="group-hover:scale-110 transition-transform" /> Confirm
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus('Denied')}
                                    className="bg-red-500/10 border border-red-500/50 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                                >
                                    <AlertCircle size={18} className="group-hover:scale-110 transition-transform" /> Deny
                                </button>
                            </div>

                            {/* Edit Form */}
                            <div className="space-y-4 bg-black/50 p-6 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Session Details</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Date</label>
                                        <div className="relative">
                                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input type="date" value={editingBooking.date} onChange={e => setEditingBooking({ ...editingBooking, date: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm font-bold outline-none focus:border-gold/50 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Time</label>
                                        <div className="relative">
                                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input type="time" value={editingBooking.time} onChange={e => setEditingBooking({ ...editingBooking, time: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm font-bold outline-none focus:border-gold/50 transition-all" />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Studio Room</label>
                                        <select value={editingBooking.studio} onChange={e => setEditingBooking({ ...editingBooking, studio: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer">
                                            <option>Studio A (The Main Room)</option>
                                            <option>Studio B (The Lab)</option>
                                            {/* Studio C removed */}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSaveChanges} className="w-full bg-gold text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] active:scale-95">
                                Save Changes
                            </button>

                            <div className="text-center">
                                <button onClick={() => {
                                    if (window.confirm('Delete this booking permanently?')) {
                                        deleteArtistBooking(selectedArtistId, editingBooking.id);
                                        setIsBookingModalOpen(false);
                                    }
                                }} className="text-red-500/50 text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
                                    Delete Booking Permanently
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Artist Modal */}
            {isArtistModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="relative bg-zinc-950 border border-gold/30 w-full max-w-md rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
                        <h3 className="font-display text-3xl font-black text-white uppercase tracking-tighter mb-8">Add New <span className="text-gold">Client</span></h3>
                        <form onSubmit={handleAddArtist} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Full Name</label>
                                <input required type="text" placeholder="e.g. Young Prophet" value={newArtistForm.name} onChange={(e) => setNewArtistForm({ ...newArtistForm, name: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-gold outline-none transition-all placeholder:text-zinc-800" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Phone Number</label>
                                <input type="tel" placeholder="(555) 000-0000" value={newArtistForm.phone} onChange={(e) => setNewArtistForm({ ...newArtistForm, phone: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-gold outline-none transition-all placeholder:text-zinc-800" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Email</label>
                                <input required type="email" placeholder="client@printlab.com" value={newArtistForm.email} onChange={(e) => setNewArtistForm({ ...newArtistForm, email: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-gold outline-none transition-all placeholder:text-zinc-800" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Password</label>
                                <input required type="text" value={newArtistForm.password} onChange={(e) => setNewArtistForm({ ...newArtistForm, password: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-sm focus:border-gold outline-none transition-all" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsArtistModalOpen(false)} className="flex-1 py-4 text-zinc-500 font-bold uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-gold text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 shadow-lg shadow-gold/10">Create Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Terminal Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-white font-display text-3xl font-bold tracking-tighter uppercase">Payment Terminal</h3>
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Secure Transaction</p>
                                </div>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><Plus className="rotate-45" size={24} /></button>
                            </div>

                            <div className="flex gap-2 mb-6 bg-black p-1 rounded-xl">
                                <button onClick={() => setPaymentMethod('Stripe')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${paymentMethod === 'Stripe' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Credit Card</button>
                                <button onClick={() => setPaymentMethod('CashApp')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${paymentMethod === 'CashApp' ? 'bg-[#00D632] text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Cash App</button>
                                <button onClick={() => setPaymentMethod('Manual')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${paymentMethod === 'Manual' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Manual</button>
                            </div>

                            {paymentMethod === 'Stripe' && (
                                <form onSubmit={(e) => { e.preventDefault(); setPaymentForm(prev => ({ ...prev, transactionId: 'STRIPE_' + Date.now().toString().slice(-6) })); confirmPayment(e); }} className="space-y-4 animate-in slide-in-from-right duration-300">
                                    <div className="bg-white rounded-xl p-4 space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Card Details</span>
                                            <div className="flex gap-1"><div className="w-8 h-5 bg-gray-200 rounded"></div><div className="w-8 h-5 bg-gray-200 rounded"></div></div>
                                        </div>
                                        <input placeholder="0000 0000 0000 0000" className="w-full text-lg font-mono placeholder:text-gray-300 border-b border-gray-200 focus:border-indigo-500 outline-none py-2" maxLength={19} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input placeholder="MM / YY" className="w-full text-base font-mono placeholder:text-gray-300 border-b border-gray-200 focus:border-indigo-500 outline-none py-2" maxLength={5} />
                                            <input placeholder="CVC" type="password" className="w-full text-base font-mono placeholder:text-gray-300 border-b border-gray-200 focus:border-indigo-500 outline-none py-2" maxLength={3} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Amount to Charge</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">$</span>
                                            <input required type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full bg-black border border-white/10 rounded-xl pl-8 pr-4 py-4 text-white font-bold focus:border-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">Process Payment</button>
                                </form>
                            )}

                            {paymentMethod === 'CashApp' && (
                                <form onSubmit={confirmPayment} className="space-y-4 animate-in slide-in-from-left duration-300">
                                    <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl relative">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-48 h-48 bg-zinc-100 rounded-2xl mb-4 flex items-center justify-center border-2 border-dashed border-zinc-200 overflow-hidden relative">
                                                <div className="absolute font-bold text-[#00D632] text-2xl tracking-tighter">$PRINTLAB</div>
                                            </div>
                                            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Send Payment To</p>
                                            <p className="text-black font-display text-2xl font-bold tracking-tight">$PrintLabStudios</p>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-[#00D632] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg active:scale-95">Confirm Cash App</button>
                                </form>
                            )}

                            {paymentMethod === 'Manual' && (
                                <form onSubmit={(e) => { e.preventDefault(); setPaymentForm(prev => ({ ...prev, transactionId: 'MANUAL_' + Date.now().toString().slice(-6) })); confirmPayment(e); }} className="space-y-4 animate-in slide-in-from-left duration-300">
                                    <div className="bg-zinc-800 rounded-2xl p-6 mb-6 border border-white/5">
                                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">Payment Details / Reference</label>
                                        <textarea
                                            placeholder="e.g. Paid in Cash, Zelle Transfer #1234, Barter..."
                                            value={paymentForm.note}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-sm font-medium h-32 outline-none focus:border-gold/50 resize-none"
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-zinc-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-600 transition-all shadow-lg active:scale-95">Confirm Manual Payment</button>
                                </form>
                            )}
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
                    <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] opacity-80">Management Layer // Print Lab Sessions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-2 space-y-4">
                        <button onClick={() => setCurrentView('dashboard')} className={`w-full p-4 rounded-xl flex items-center gap-3 font-bold uppercase tracking-widest text-xs transition-all ${currentView === 'dashboard' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                            <LayoutDashboard size={18} /> Dashboard
                        </button>
                        <button onClick={() => setCurrentView('calendar')} className={`w-full p-4 rounded-xl flex items-center gap-3 font-bold uppercase tracking-widest text-xs transition-all ${currentView === 'calendar' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                            <Calendar size={18} /> Schedule
                        </button>
                        <button onClick={() => setCurrentView('clients')} className={`w-full p-4 rounded-xl flex items-center gap-3 font-bold uppercase tracking-widest text-xs transition-all ${currentView === 'clients' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                            <Users size={18} /> Clients
                        </button>
                        <button onClick={() => setCurrentView('marketing')} className={`w-full p-4 rounded-xl flex items-center gap-3 font-bold uppercase tracking-widest text-xs transition-all ${currentView === 'marketing' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                            <Mail size={18} /> Marketing
                        </button>

                        <div className="h-px bg-white/5 my-4"></div>

                        <button onClick={() => setCurrentView('voice')} className={`w-full p-4 rounded-xl flex items-center gap-3 font-bold uppercase tracking-widest text-xs transition-all ${currentView === 'voice' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                            <Mic size={18} /> Test Voice AI
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-10">

                        {/* 1. DASHBOARD VIEW */}
                        {currentView === 'dashboard' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {(() => {
                                    const artists = allUsers.filter(u => u.role === 'ARTIST');
                                    const totalRevenue = artists.reduce((acc, artist) => acc + (artist.bookings || []).reduce((sum, b) => b.status === 'Confirmed' ? sum + (b.price || 0) : sum, 0), 0);

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 card-hover group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={80} className="text-gold" /></div>
                                                <div className="relative z-10">
                                                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Registered Clients</p>
                                                    <div className="flex items-baseline gap-3"><p className="text-5xl font-display font-bold text-white tracking-tighter">{artists.length}</p><span className="text-gold text-xs font-bold uppercase tracking-widest">Active Members</span></div>
                                                    <div className="mt-6 flex items-center gap-2 text-green-500"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div><span className="text-[10px] font-bold uppercase tracking-widest">Growth Tracking Active</span></div>
                                                </div>
                                            </div>
                                            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 card-hover group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={80} className="text-[#00D632]" /></div>
                                                <div className="relative z-10">
                                                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Confirmed Studio Revenue</p>
                                                    <div className="flex items-baseline gap-3"><p className="text-5xl font-display font-bold text-white tracking-tighter">${totalRevenue.toLocaleString()}</p><span className="text-[#00D632] text-xs font-bold uppercase tracking-widest">Gross Revenue</span></div>
                                                    <div className="mt-6 flex items-center gap-2 text-[#00D632]"><CheckCircle size={10} /><span className="text-[10px] font-bold uppercase tracking-widest">Verified Transitions Only</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-12 text-center">
                                    <h3 className="font-display text-2xl text-zinc-500 uppercase tracking-widest">System Overview</h3>
                                    <p className="text-zinc-600 mt-2 font-bold text-xs uppercase tracking-wider">Select 'Schedule' to manage appointments or 'Clients' to manage records.</p>
                                </div>
                            </div>
                        )}

                        {/* 2. CALENDAR VIEW */}
                        {currentView === 'calendar' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <CalendarView
                                    allUsers={allUsers}
                                    onEditBooking={(booking, clientId) => {
                                        setSelectedArtistId(clientId);
                                        setEditingBooking(booking);
                                        setIsBookingModalOpen(true); // NEW: Open modal instead of switching views
                                    }}
                                    onProcessPayment={handleProcessPayment}
                                />
                            </div>
                        )}

                        {/* 3. CLIENTS VIEW */}
                        {currentView === 'clients' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                {/* LIST SIMPLIFIED */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="font-display text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3"><Users size={24} className="text-gold" /> CLIENTS</h2>
                                            <button onClick={() => setIsArtistModalOpen(true)} className="p-3 rounded-2xl bg-gold/5 border border-gold/20 text-gold hover:bg-gold hover:text-black transition-all group/add"><Plus size={20} className="group-hover/add:rotate-90 transition-transform duration-500" /></button>
                                        </div>
                                        <div className="relative mb-6">
                                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                                            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-white focus:border-gold/50 outline-none transition-all placeholder:text-zinc-800" />
                                        </div>
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                                            {filteredArtists.map(artist => (
                                                <div key={artist.id} className="relative group/item">
                                                    <button onClick={() => handleArtistSelect(artist)} className={`w-full text-left p-6 rounded-2xl transition-all border flex items-center justify-between overflow-hidden relative ${selectedArtistId === artist.id ? 'bg-gold/5 border-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.05)]' : 'bg-black border-white/5 hover:border-white/20'}`}>
                                                        <div className="relative z-10">
                                                            <p className={`font-black text-sm uppercase tracking-wider transition-colors ${selectedArtistId === artist.id ? 'text-gold' : 'text-zinc-400 group-hover/item:text-white'}`}>{artist.name}</p>
                                                            <div className="flex flex-col mt-1"><p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{artist.email}</p><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{artist.phone || 'No Phone'}</p></div>
                                                        </div>
                                                        <ChevronRight size={18} className={`transition-all duration-500 ${selectedArtistId === artist.id ? 'text-gold translate-x-0' : 'text-zinc-800 translate-x-4 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0'}`} />
                                                        {selectedArtistId === artist.id && <div className="absolute left-0 top-0 h-full w-1 bg-gold shadow-[2px_0_10px_rgba(212,175,55,0.5)]"></div>}
                                                    </button>
                                                    <button onClick={() => handleDeleteArtist(artist.id)} className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* DETAILS */}
                                <div className="lg:col-span-8">
                                    {!selectedArtist ? (
                                        <div className="h-full bg-zinc-900/30 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                                            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6"><Upload size={32} className="text-gray-600" /></div>
                                            <h3 className="text-2xl font-display font-bold text-gray-500 mb-2 uppercase">No Client Selected</h3>
                                            <p className="text-gray-600 max-w-xs">Select a client from the sidebar to manage their session bounces.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Insights */}
                                            {(() => {
                                                const totalInvested = (selectedArtist.bookings || []).reduce((sum, b) => b.status === 'Confirmed' ? sum + (b.price || 0) : sum, 0);
                                                return (
                                                    <div className="grid grid-cols-3 gap-6 mb-8">
                                                        <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden"><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Artist Spend</p><div className="flex items-center gap-2"><DollarSign size={16} className="text-gold" /><span className="text-2xl font-display font-black text-white">${totalInvested.toLocaleString()}</span></div></div>
                                                        <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden"><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Audio Engagement</p><div className="flex items-center gap-2"><Eye size={16} className="text-gold" /><span className="text-2xl font-display font-black text-white">{(selectedArtist.bounces || []).length} Tracks</span></div></div>
                                                        <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden"><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Confirmed Sessions</p><div className="flex items-center gap-2"><CheckCircle size={16} className="text-gold" /><span className="text-2xl font-display font-black text-white">{(selectedArtist.bookings || []).filter(b => b.status === 'Confirmed').length} Visits</span></div></div>
                                                    </div>
                                                );
                                            })()}

                                            <div className="flex gap-4 mb-6 border-b border-white/5">
                                                <button onClick={() => setActiveTab('bookings')} className={`pb-4 px-2 font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'bookings' ? 'text-gold border-gold border-b-2' : 'text-gray-500 hover:text-white'}`}>Bookings & Payments</button>
                                                <button onClick={() => setActiveTab('bounces')} className={`pb-4 px-2 font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'bounces' ? 'text-gold border-gold border-b-2' : 'text-gray-500 hover:text-white'}`}>Session Bounces</button>
                                            </div>

                                            {activeTab === 'bookings' && (
                                                <div className="space-y-4">
                                                    {(selectedArtist.bookings || []).map(booking => (
                                                        <div key={booking.id} className="bg-black border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-gold/30 transition-all">
                                                            {editingBooking && editingBooking.id === booking.id ? (
                                                                <div className="w-full space-y-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label><input type="date" value={editingBooking.date} onChange={e => setEditingBooking({ ...editingBooking, date: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white" /></div>
                                                                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label><input type="time" value={editingBooking.time} onChange={e => setEditingBooking({ ...editingBooking, time: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white" /></div>
                                                                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Studio</label><select value={editingBooking.studio} onChange={e => setEditingBooking({ ...editingBooking, studio: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"><option>Studio A (The Main Room)</option><option>Studio B (The Lab)</option></select></div>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2">
                                                                        <button onClick={() => setEditingBooking(null)} className="px-4 py-2 bg-zinc-800 text-xs font-bold text-white rounded-lg">Cancel</button>
                                                                        <button onClick={() => { updateArtistBooking(selectedArtist.id, booking.id, editingBooking); setEditingBooking(null); }} className="px-4 py-2 bg-gold text-xs font-bold text-black rounded-lg">Save</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div>
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <h4 className="font-bold text-white uppercase">{booking.studio}</h4>
                                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{booking.status}</span>
                                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${booking.paymentStatus === 'Paid' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>{booking.paymentStatus || 'Unpaid'}</span>
                                                                        </div>
                                                                        <div className="flex gap-4 text-xs text-gray-500 font-mono">
                                                                            <span>{booking.date} @ {booking.time}</span>
                                                                            <span className="text-gold">${booking.price}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => setEditingBooking(booking)} className="p-2 text-zinc-500 hover:text-white"><Edit2 size={16} /></button>
                                                                        {booking.paymentStatus !== 'Paid' && <button onClick={() => handleProcessPayment(booking)} className="p-2 text-green-500 hover:text-white"><DollarSign size={16} /></button>}
                                                                        <button onClick={() => handleDeleteBooking(booking.id)} className="p-2 text-zinc-500 hover:text-red-500"><Trash2 size={16} /></button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'bounces' && (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center rounded-2xl bg-zinc-950 p-6 border border-white/5">
                                                        <h3 className="font-display font-bold text-white">Bounce Assets</h3>
                                                        <button onClick={() => setIsAddingMode(!isAddingMode)} className="bg-gold text-black px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">{isAddingMode ? 'Cancel' : 'Upload New'}</button>
                                                    </div>

                                                    {isAddingMode && (
                                                        <form onSubmit={handleAddBounce} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="bg-black border border-white/10 rounded-lg p-3 text-white text-sm" />
                                                                <input placeholder="Session Name" value={formData.sessionName} onChange={e => setFormData({ ...formData, sessionName: e.target.value })} className="bg-black border border-white/10 rounded-lg p-3 text-white text-sm" />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <select
                                                                    value={formData.type}
                                                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                                    className="bg-black border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-gold/50"
                                                                >
                                                                    <option value="Demo">Demo</option>
                                                                    <option value="Mix">Mix</option>
                                                                    <option value="Master">Master</option>
                                                                </select>
                                                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="bg-black border border-white/10 rounded-lg p-3 text-white text-sm" />
                                                            </div>
                                                            <div className="border border-dashed border-white/10 rounded-lg p-6 text-center hover:border-gold/30 transition-colors cursor-pointer relative">
                                                                <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                                {formData.file ? (
                                                                    <p className="text-gold font-bold text-xs uppercase">{formData.file.name}</p>
                                                                ) : (
                                                                    <p className="text-zinc-500 font-bold text-xs uppercase">Click to Select Audio File</p>
                                                                )}
                                                            </div>
                                                            <button type="submit" className="w-full bg-gold text-black py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors">Upload</button>
                                                        </form>
                                                    )}

                                                    <div className="grid gap-3">
                                                        {(selectedArtist.bounces || []).map(bounce => (
                                                            <div key={bounce.id} className={`bg-zinc-900 border rounded-xl p-4 transition-all ${previewPlayingId === bounce.id ? 'border-gold/50 shadow-gold/10' : 'border-white/5'}`}>
                                                                {editingBounceId === bounce.id ? (
                                                                    <div className="space-y-3 w-full">
                                                                        <input
                                                                            value={editBounceForm.title}
                                                                            onChange={e => setEditBounceForm({ ...editBounceForm, title: e.target.value })}
                                                                            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm outline-none focus:border-gold/50"
                                                                            placeholder="Track Title"
                                                                        />
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <input
                                                                                value={editBounceForm.sessionName}
                                                                                onChange={e => setEditBounceForm({ ...editBounceForm, sessionName: e.target.value })}
                                                                                className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-gold/50"
                                                                                placeholder="Session Name"
                                                                            />
                                                                            <select
                                                                                value={editBounceForm.type}
                                                                                onChange={e => setEditBounceForm({ ...editBounceForm, type: e.target.value })}
                                                                                className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-gold/50"
                                                                            >
                                                                                <option value="Demo">Demo</option>
                                                                                <option value="Mix">Mix</option>
                                                                                <option value="Master">Master</option>
                                                                            </select>
                                                                        </div>
                                                                        <input
                                                                            type="date"
                                                                            value={editBounceForm.date}
                                                                            onChange={e => setEditBounceForm({ ...editBounceForm, date: e.target.value })}
                                                                            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-gold/50"
                                                                        />
                                                                        <div className="flex gap-2 pt-2">
                                                                            <button onClick={handleSaveBounce} className="flex-1 bg-gold text-black py-2 rounded-lg font-bold text-xs uppercase hover:bg-white transition-colors">Save</button>
                                                                            <button onClick={handleCancelEditBounce} className="flex-1 bg-zinc-800 text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-zinc-700 transition-colors">Cancel</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex justify-between items-center w-full">
                                                                        <div className="flex items-center gap-3">
                                                                            <button
                                                                                onClick={() => togglePreview(bounce)}
                                                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${previewPlayingId === bounce.id ? 'bg-gold text-black' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}
                                                                            >
                                                                                {previewPlayingId === bounce.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                                                            </button>
                                                                            <div>
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <p className="font-bold text-white text-sm">{bounce.title}</p>
                                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${bounce.type === 'Master' ? 'bg-gold text-black' :
                                                                                        bounce.type === 'Mix' ? 'bg-[#00D632]/10 text-[#00D632]' :
                                                                                            'bg-yellow-500/10 text-yellow-500'
                                                                                        }`}>
                                                                                        {bounce.type || 'Demo'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                                                                    <span>{bounce.sessionName}</span>
                                                                                    <span>•</span>
                                                                                    <span>{bounce.date || new Date().toLocaleDateString()}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => handleEditBounce(bounce)} className="p-2 text-zinc-600 hover:text-white transition-colors"><Edit2 size={16} /></button>
                                                                            <button onClick={() => handleDeleteBounce(bounce.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* 4. MARKETING VIEW */}
                        {currentView === 'marketing' && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8">
                                {/* CSV Import - Compact */}
                                <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10">
                                            <Upload size={24} className="text-gold" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-2xl font-black text-white uppercase tracking-tighter">Import Clients</h3>
                                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Bulk add via CSV (Name, Email, Phone)</p>
                                        </div>
                                    </div>

                                    <div className="border border-dashed border-zinc-800 rounded-2xl px-8 py-4 text-center hover:border-gold/30 transition-colors group cursor-pointer relative flex items-center gap-4 bg-black/50">
                                        <input type="file" accept=".csv" onChange={handleCSVUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <Upload size={20} className="text-zinc-700 group-hover:text-gold transition-colors" />
                                        <p className="font-bold text-white uppercase tracking-wider text-xs group-hover:text-gold transition-colors">Select CSV File</p>
                                    </div>
                                </div>

                                {/* AI Editor - Full Width */}
                                <div className="animate-in fade-in duration-700 delay-100">
                                    <EmailEditor onSend={handleSendNewsletter} />
                                </div>
                            </div>
                        )}

                        {/* 5. VOICE AI DEBUGGER (Temporary) */}
                        {currentView === 'voice' && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 flex justify-center">
                                <VoiceDebugger />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
