import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import {
    Calendar,
    Clock,
    DollarSign,
    LogOut,
    Plus,
    CheckCircle,
    AlertCircle,
    Music,
    Headphones,
    CreditCard,
    Trash2,
    User,
    MessageSquare,
    PanelLeft,
    FileText
} from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';
import SessionNotes from '../components/SessionNotes';
import MobileBottomNav from '../components/MobileBottomNav';
import StripePaymentModal from '../components/StripePaymentModal';

const Dashboard = () => {
    const {
        user,
        logout,
        addPaymentMethod,
        removePaymentMethod,
        updateUserProfile,
        updateUserPreferences,
        uploadBeat,
        isProducer
    } = useAuth();

const navigate = useNavigate();
const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'bounces', 'profile'
const [newCardForm, setNewCardForm] = useState({ brand: 'visa', last4: '', expiry: '' });
const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Still keep for Desktop/Tablet if needed, but mainly Mobile Nav now
const [paymentBooking, setPaymentBooking] = useState(null);
const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
const [isUploadingBeat, setIsUploadingBeat] = useState(false);
const [beatForm, setBeatForm] = useState({ title: '', genre: 'Hip Hop', bpm: '', price: '29.99' });
const [beatFile, setBeatFile] = useState(null);
const [stemsFile, setStemsFile] = useState(null);

const handleAddCard = (e) => {
    e.preventDefault();
    if (newCardForm.last4.length === 4 && newCardForm.expiry) {
        addPaymentMethod(newCardForm);
        setNewCardForm({ brand: 'visa', last4: '', expiry: '' });
    }
};

return (
    <div className="min-h-screen bg-black text-white p-4 pt-24 pb-32 lg:p-8 lg:pt-28 lg:pl-64">

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Mobile Header - Just Title, No Toggle Needed (Nav is bottom) */}
        <div className="lg:hidden flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-4">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center font-black text-black shadow-gold/20 shadow-lg">V</div>
            <h1 className="font-display font-black text-xl tracking-tighter">THE VAULT</h1>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
            ></div>
        )}

        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 bg-zinc-950/95 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col justify-between z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div>
                <div className="flex items-center justify-between mb-10 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center font-black text-black">V</div>
                        <h1 className="font-display font-black text-xl tracking-tighter">THE VAULT</h1>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* User Profile Summary */}
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                        <h3 className="font-bold text-white text-sm">{user?.name || 'Guest User'}</h3>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                    </div>

                    <nav className="space-y-2">
                        <button
                            onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Calendar size={20} />
                            <span className="font-bold tracking-wide">MY BOOKINGS</span>
                        </button>

                        <button
                            onClick={() => { setActiveTab('bounces'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'bounces' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Headphones size={20} />
                            <span className="font-bold tracking-wide">MY BOUNCES</span>
                        </button>

                        <button
                            onClick={() => { setActiveTab('notes'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'notes' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <FileText size={20} />
                            <span className="font-bold tracking-wide">LYRICS & NOTES</span>
                        </button>

                        {isProducer ? (
                            <button
                                onClick={() => { setActiveTab('myBeats'); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'myBeats' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Music size={20} />
                                <span className="font-bold tracking-wide">MY BEATS</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => { setActiveTab('licensedBeats'); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'licensedBeats' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Music size={20} />
                                <span className="font-bold tracking-wide">LICENSED BEATS</span>
                            </button>
                        )}

                        <button
                            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <User size={20} />
                            <span className="font-bold tracking-wide">PROFILE</span>
                        </button>
                    </nav>
                </div>
            </div>

            <button onClick={logout} className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors p-4">
                <LogOut size={18} />
                <span className="font-bold text-sm tracking-widest uppercase">Logout</span>
            </button>
        </div>

        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto pt-0 lg:pt-4">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Clock size={64} /></div>
                    <Calendar className="text-gold mb-4" size={24} />
                    <div>
                        <p className="text-gray-400 text-sm">Upcoming Sessions</p>
                        <p className="text-3xl font-bold text-white">{user?.bookings?.filter(b => new Date(b.date) >= new Date()).length || 0}</p>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Music size={64} /></div>
                    <Headphones className="text-gold mb-4" size={24} />
                    <div>
                        <p className="text-gray-400 text-sm">Tracks in Vault</p>
                        <p className="text-3xl font-bold text-white">{user?.bounces?.length || 0}</p>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={64} /></div>
                    <CreditCard className="text-gold mb-4" size={24} />
                    <div>
                        <p className="text-gray-400 text-sm">Total Spent</p>
                        <p className="text-3xl font-bold text-white">
                            ${user?.bookings?.reduce((sum, b) => sum + (Number(b.price) || 0), 0) || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Logic */}
            <div className="space-y-8">

                {/* BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h2 className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-3">
                                <div className="w-1 h-8 bg-gold"></div>
                                MY SESSIONS
                            </h2>
                            <Link to="/book" className="w-full md:w-auto bg-white text-black px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-white/10">
                                <Plus size={16} /> New Booking
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {(!user?.bookings || user.bookings.length === 0) ? (
                                <div className="bg-zinc-900/50 border border-white/5 border-dashed rounded-3xl p-16 text-center">
                                    <Calendar size={48} className="mx-auto mb-4 text-zinc-700" />
                                    <p className="text-gray-500 font-bold uppercase tracking-widest">No sessions booked yet</p>
                                    <Link to="/book" className="text-gold hover:underline mt-2 inline-block font-bold">Book your first session</Link>
                                </div>
                            ) : (
                                user.bookings.map((booking) => (
                                    <div key={booking.id} className="bg-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-gold/30 transition-colors group">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex items-center gap-4 lg:gap-6">
                                                <div className="w-16 h-16 bg-black rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shrink-0">
                                                    <span className="text-xs text-zinc-500 font-bold uppercase">{new Date(booking.date).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-xl font-bold text-white">{new Date(booking.date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg lg:text-xl text-white mb-1 group-hover:text-gold transition-colors">{booking.studio} Tracking</h3>
                                                    <div className="flex flex-wrap gap-2 lg:gap-4 text-sm text-zinc-400">
                                                        <div className="flex items-center gap-1"><Clock size={14} /> {booking.time} ({booking.duration}hrs)</div>
                                                        <div className={`flex items-center gap-1 ${booking.status === 'Confirmed' ? 'text-green-500' : 'text-yellow-500'}`}><CheckCircle size={14} /> {booking.status}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end border-t border-white/5 pt-4 md:border-none md:pt-0">
                                                <div className="text-xl font-bold text-white mb-0 md:mb-1">${booking.price}</div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-xs font-bold uppercase tracking-widest bg-white/5 text-zinc-400 py-1 px-3 rounded-full">{booking.paymentStatus}</div>

                                                    {booking.paymentStatus === 'pending' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setPaymentBooking(booking);
                                                                setIsPaymentModalOpen(true);
                                                            }}
                                                            className="bg-gold text-black px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20"
                                                        >
                                                            Pay Deposit
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* BOUNCES TAB */}
                {activeTab === 'bounces' && (
                    <div className="animate-in fade-in duration-500">
                        <h2 className="font-display text-2xl lg:text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gold"></div>
                            MY WAVE BOUNCES
                        </h2>

                        {(!user?.bounces || user.bounces.length === 0) ? (
                            <div className="bg-zinc-900/50 border border-white/5 border-dashed rounded-3xl p-16 text-center">
                                <Headphones size={48} className="mx-auto mb-4 text-zinc-700" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest">No tracks ready yet</p>
                                <p className="text-zinc-600 text-sm mt-1">Tracks will appear here after your engineer uploads them.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {user.bounces.map((track) => (
                                    <AudioPlayer key={track.id} track={track} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* NOTES TAB */}
                {activeTab === 'notes' && (
                    <div className="animate-in fade-in duration-500">
                        <h2 className="font-display text-2xl lg:text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gold"></div>
                            LYRICS & SESSION NOTES
                        </h2>
                        <SessionNotes bookings={user?.bookings} user={user} licensedBeats={user?.licensedBeats} />
                    </div>
                )}

                {/* LICENSED BEATS TAB */}
                {activeTab === 'licensedBeats' && !isProducer && (
                    <div className="animate-in fade-in duration-500">
                        <h2 className="font-display text-2xl lg:text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gold"></div>
                            MY LICENSED BEATS
                        </h2>

                        {(!user?.licensedBeats || user.licensedBeats.length === 0) ? (
                            <div className="bg-zinc-900/50 border border-white/5 border-dashed rounded-3xl p-16 text-center">
                                <Music size={48} className="mx-auto mb-4 text-zinc-700" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest">No beats licensed yet</p>
                                <Link to="/beats" className="text-gold hover:underline mt-2 inline-block font-bold">Browse the Marketplace</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.licensedBeats.map((beat) => (
                                    <div key={beat.id} className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{beat.title}</h3>
                                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{beat.genre} • {beat.bpm} BPM</p>
                                            </div>
                                            <div className="bg-gold/10 text-gold text-[10px] font-black px-2 py-1 rounded uppercase">Licensed</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={beat.previewUrl} download className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-xs font-bold uppercase text-center transition-colors">2-Track</a>
                                            {beat.stemsUrl && <a href={beat.stemsUrl} download className="flex-1 bg-gold hover:bg-yellow-500 text-black py-2 rounded-lg text-xs font-bold uppercase text-center transition-colors">Stems</a>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* PRODUCER MY BEATS TAB */}
                {activeTab === 'myBeats' && isProducer && (
                    <div className="animate-in fade-in duration-500 space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-3">
                                <div className="w-1 h-8 bg-gold"></div>
                                MY PRODUCTION
                            </h2>
                            <button
                                onClick={() => setActiveTab('uploadBeat')}
                                className="w-full md:w-auto bg-white text-black px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                            >
                                <Plus size={16} /> Upload New Beat
                            </button>
                        </div>

                        {(!user?.beats || user.beats.length === 0) ? (
                            <div className="bg-zinc-900/50 border border-white/5 border-dashed rounded-3xl p-16 text-center">
                                <Music size={48} className="mx-auto mb-4 text-zinc-700" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest">No beats uploaded yet</p>
                                <button onClick={() => setActiveTab('uploadBeat')} className="text-gold hover:underline mt-2 inline-block font-bold">Upload your first beat</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Map through producer's beats - this would require a listener/fetch in a real app or derived from global beats */}
                                <div className="col-span-full text-zinc-500 text-sm font-bold uppercase tracking-widest">Showing {user.beats.length} tracks cataloged</div>
                            </div>
                        )}
                    </div>
                )}

                {/* UPLOAD BEAT TAB */}
                {activeTab === 'uploadBeat' && isProducer && (
                    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
                        <button onClick={() => setActiveTab('myBeats')} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                            ← Back to My Beats
                        </button>

                        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
                            <h3 className="font-display text-2xl font-bold text-white mb-8 uppercase tracking-tighter">Upload <span className="text-gold">New Beat</span></h3>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!beatFile) return alert("Please select a preview file");
                                setIsUploadingBeat(true);
                                const res = await uploadBeat(user.uid, beatFile, stemsFile, beatForm);
                                if (res.success) {
                                    alert("Beat uploaded successfully!");
                                    setActiveTab('myBeats');
                                } else {
                                    alert("Upload failed: " + res.error);
                                }
                                setIsUploadingBeat(false);
                            }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Beat Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={beatForm.title}
                                            onChange={e => setBeatForm({ ...beatForm, title: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                                            placeholder="Ether"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Genre</label>
                                        <select
                                            value={beatForm.genre}
                                            onChange={e => setBeatForm({ ...beatForm, genre: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors appearance-none"
                                        >
                                            <option>Hip Hop</option>
                                            <option>Trap</option>
                                            <option>R&B</option>
                                            <option>Pop</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">BPM</label>
                                        <input
                                            type="number"
                                            value={beatForm.bpm}
                                            onChange={e => setBeatForm({ ...beatForm, bpm: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                                            placeholder="140"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Price ($)</label>
                                        <input
                                            type="text"
                                            value={beatForm.price}
                                            onChange={e => setBeatForm({ ...beatForm, price: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                                            placeholder="29.99"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Preview Audio (MP3/WAV)</label>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        required
                                        onChange={e => setBeatFile(e.target.files[0])}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors file:bg-zinc-800 file:border-none file:text-white file:px-4 file:py-1 file:rounded file:mr-4 file:text-xs file:font-bold file:uppercase"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Stems (ZIP - Optional)</label>
                                    <input
                                        type="file"
                                        accept=".zip,.rar"
                                        onChange={e => setStemsFile(e.target.files[0])}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors file:bg-gold file:border-none file:text-black file:px-4 file:py-1 file:rounded file:mr-4 file:text-xs file:font-bold file:uppercase"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploadingBeat}
                                    className="w-full bg-gold hover:bg-yellow-500 text-black font-black pt-4 pb-4 rounded-xl transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-gold/20 disabled:opacity-50"
                                >
                                    {isUploadingBeat ? 'Uploading Assets...' : 'Publish to Marketplace'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="animate-in fade-in duration-500 space-y-8">
                        <h2 className="font-display text-2xl lg:text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gold"></div>
                            MY PROFILE
                        </h2>

                        {/* Personal Info */}
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                            <h3 className="font-display text-xl font-bold text-white mb-6 uppercase">Personal Details</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.name}
                                        onBlur={(e) => updateUserProfile(user.id, { name: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-gold outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Phone Number (For SMS)</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                        <input
                                            type="tel"
                                            defaultValue={user?.phone || ''}
                                            placeholder="+1 (555) 000-0000"
                                            onBlur={(e) => updateUserProfile(user.id, { phone: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-bold focus:border-gold outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                        className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-zinc-400 font-mono cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                            <h3 className="font-display text-xl font-bold text-white mb-6 uppercase">Notifications</h3>
                            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">SMS Alerts</p>
                                        <p className="text-xs text-zinc-500">Get text reminders for sessions and mixes</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={user?.preferences?.smsEnabled !== false} // Default to true
                                        onChange={(e) => updateUserPreferences(user.id, { ...user.preferences, smsEnabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                                </label>
                            </div>
                        </div>

                        {/* Wallet / Payment Methods */}
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                            <h3 className="font-display text-xl font-bold text-white mb-6 uppercase">Wallet & Billing</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {(user?.wallet || []).map((card) => (
                                    <div key={card.id} className="bg-gradient-to-br from-zinc-800 to-black p-6 rounded-xl border border-white/10 relative group">
                                        <div className="flex justify-between items-start mb-8">
                                            <CreditCard className="text-white/50" size={32} />
                                            <button onClick={() => removePaymentMethod(card.id)} className="text-zinc-500 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                        <div className="font-mono text-lg text-white tracking-widest mb-1">•••• •••• •••• {card.last4}</div>
                                        <div className="flex justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
                                            <span>{card.brand}</span>
                                            <span>{card.expiry}</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Card (Simplified - just basic fields to add to mock wallet) */}
                                <form onSubmit={handleAddCard} className="border-2 border-dashed border-zinc-800 rounded-xl p-6 flex flex-col justify-center gap-4 hover:border-gold/30 hover:bg-gold/5 transition-all">
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Card Number (Last 4)"
                                            maxLength={4}
                                            value={newCardForm.last4}
                                            onChange={e => setNewCardForm({ ...newCardForm, last4: e.target.value })}
                                            className="w-full bg-transparent border-b border-zinc-700 focus:border-gold text-white text-center py-2 outline-none font-mono"
                                        />
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            value={newCardForm.expiry}
                                            onChange={e => setNewCardForm({ ...newCardForm, expiry: e.target.value })}
                                            className="w-full bg-transparent border-b border-zinc-700 focus:border-gold text-white text-center py-2 outline-none font-mono"
                                        />
                                        <button
                                            type="submit"
                                            disabled={newCardForm.last4.length !== 4}
                                            className="w-full bg-white/10 text-white font-bold py-2 rounded-lg text-xs uppercase hover:bg-gold hover:text-black transition-colors"
                                        >
                                            Add Card
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Stripe Payment Modal */}
        <StripePaymentModal
            isOpen={isPaymentModalOpen}
            booking={paymentBooking}
            onClose={() => {
                setIsPaymentModalOpen(false);
                setPaymentBooking(null);
            }}
            onSuccess={() => {
                setIsPaymentModalOpen(false);
                setPaymentBooking(null);
                // Optionally show a success toast or refresh data
                window.location.reload(); // Simple refresh to see new status
            }}
        />
    </div>
);
};

export default Dashboard;
