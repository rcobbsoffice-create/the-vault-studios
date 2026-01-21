import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, FileText, Music, Mic, Clock, CheckCircle } from 'lucide-react';

const SessionNotes = ({ bookings, user, licensedBeats }) => {
    const [selectedId, setSelectedId] = useState(bookings?.[0]?.id || licensedBeats?.[0]?.id || null);
    const [selectedType, setSelectedType] = useState(bookings?.[0] ? 'booking' : 'beat');
    const [noteType, setNoteType] = useState('lyrics'); // 'lyrics' or 'technical'
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Sort bookings by date (newest first)
    const sortedBookings = [...(bookings || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

    useEffect(() => {
        if (selectedId) {
            fetchNotes(selectedId);
        }
    }, [selectedId]);

    const fetchNotes = async (bookingId) => {
        try {
            const noteRef = doc(db, 'notes', bookingId);
            const docSnap = await getDoc(noteRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setContent(data[noteType] || ''); // Fetch specific type content
            } else {
                setContent('');
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
            setContent('');
        }
    };

    // Handle switching types (save current first? or just switch memory?)
    // For simplicity, we fetch fresh when switching types to avoid overwriting logic complexity, 
    // but in a real app check for unsaved changes.
    useEffect(() => {
        if (selectedId) {
            fetchNotes(selectedId);
        }
    }, [noteType]);

    const handleSave = async () => {
        if (!selectedId) return;
        setSaving(true);

        try {
            const noteRef = doc(db, 'notes', selectedId);
            const dataToSave = {
                id: selectedId,
                type: selectedType,
                clientId: user.uid,
                updatedAt: Timestamp.now(),
                [noteType]: content // Save to 'lyrics' or 'technical' field
            };

            await setDoc(noteRef, dataToSave, { merge: true });

            setLastSaved(new Date());
            setTimeout(() => setLastSaved(null), 3000); // Hide "Saved" msg after 3s
        } catch (error) {
            console.error("Error saving note:", error);
            alert("Failed to save note");
        }
        setSaving(false);
    };

    const selectedBooking = sortedBookings.find(b => b.id === selectedBookingId);

    // Auto-save logic (Debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content && selectedId) {
                // Optional: Auto-save could go here, but manual for now to prevent spam writes
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [content]);

    if (!sortedBookings.length && !licensedBeats?.length) {
        return (
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-16 text-center">
                <FileText size={48} className="mx-auto mb-4 text-zinc-700" />
                <p className="text-gray-500 font-bold uppercase tracking-widest">No workspace available</p>
                <p className="text-zinc-600 text-sm mt-1">Book a session or license a beat to start writing.</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
            {/* Sidebar: Item Selector */}
            <div className="w-full md:w-64 bg-black/50 border-r border-white/5 overflow-y-auto">
                {sortedBookings.length > 0 && (
                    <>
                        <div className="p-4 border-b border-white/5">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sessions</h3>
                        </div>
                        {sortedBookings.map(booking => (
                            <button
                                key={booking.id}
                                onClick={() => { setSelectedId(booking.id); setSelectedType('booking'); }}
                                className={`w-full text-left p-4 border-b border-white/5 transition-colors hover:bg-white/5 ${selectedId === booking.id ? 'bg-gold/10 border-l-4 border-l-gold' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="font-bold text-white text-sm mb-1">{booking.studio}</div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Clock size={12} />
                                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                                </div>
                            </button>
                        ))}
                    </>
                )}

                {licensedBeats?.length > 0 && (
                    <>
                        <div className="p-4 border-b border-white/5 bg-zinc-950/20">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Licensed Beats</h3>
                        </div>
                        {licensedBeats.map(beat => (
                            <button
                                key={beat.id}
                                onClick={() => { setSelectedId(beat.id); setSelectedType('beat'); }}
                                className={`w-full text-left p-4 border-b border-white/5 transition-colors hover:bg-white/5 ${selectedId === beat.id ? 'bg-gold/10 border-l-4 border-l-gold' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="font-bold text-white text-sm mb-1 truncate">{beat.title}</div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Music size={12} />
                                    <span>{beat.genre}</span>
                                </div>
                            </button>
                        ))}
                    </>
                )}
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-zinc-900">
                {/* Editor Header */}
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-950/30">
                    <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setNoteType('lyrics')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${noteType === 'lyrics' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Music size={14} /> Lyrics
                        </button>
                        <button
                            onClick={() => setNoteType('technical')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${noteType === 'technical' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Mic size={14} /> Tech Notes
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {lastSaved && (
                            <span className="text-green-500 text-xs font-bold flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                                <CheckCircle size={12} /> Saved
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-gold text-black px-4 py-2 rounded-lg font-bold text-xs uppercase hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {saving ? <span className="animate-spin">⏳</span> : <Save size={14} />}
                            Save
                        </button>
                    </div>
                </div>

                {/* Text Area */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={noteType === 'lyrics' ? "Write your lyrics here..." : "Microphone positions, preamp settings, outboard gear used..."}
                    className="flex-1 bg-transparent p-6 text-white font-mono text-sm resize-none focus:outline-none leading-relaxed placeholder:text-zinc-700"
                />
            </div>
        </div>
    );
};

export default SessionNotes;
