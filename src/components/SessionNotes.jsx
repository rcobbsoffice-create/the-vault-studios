import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../core/AuthContext';
import { Save, FileText, Music, Mic, Clock, CheckCircle, Heart, Sparkles, Send, Copy, X, Plus, ChevronUp, ChevronDown, Trash2, Play, Pause } from 'lucide-react';

const SessionNotes = ({ bookings, user, licensedBeats, favoriteBeats }) => {
    const { allBeats } = useAuth();
    const [selectedId, setSelectedId] = useState(bookings?.[0]?.id || licensedBeats?.[0]?.id || favoriteBeats?.[0]?.id || null);
    const [selectedType, setSelectedType] = useState(bookings?.[0] ? 'booking' : (licensedBeats?.[0] ? 'beat' : (favoriteBeats?.[0] ? 'favorite' : null)));
    const [noteType, setNoteType] = useState('lyrics'); // 'lyrics' or 'technical'

    // Pages State
    const [pages, setPages] = useState([]);
    const [activePageId, setActivePageId] = useState(null);
    const [titleEditing, setTitleEditing] = useState(null); // id of page being renamed

    // Reference Beat for Bookings
    const [referenceBeatId, setReferenceBeatId] = useState(null);

    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [showAI, setShowAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiMode, setAiMode] = useState('verse'); // 'verse', 'hook', 'rhymes', 'continue'
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState('');

    // Audio Player State
    const audioRef = React.useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Sort bookings by date (newest first)
    const sortedBookings = [...(bookings || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

    useEffect(() => {
        if (selectedId) {
            fetchNotes(selectedId);
        }
    }, [selectedId, selectedType]);

    const fetchNotes = async (bookingId) => {
        try {
            const noteRef = doc(db, 'notes', bookingId);
            const docSnap = await getDoc(noteRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const fetched = data[noteType];

                // Load Reference Beat if exists for this note
                if (data.referenceBeatId) setReferenceBeatId(data.referenceBeatId);
                else setReferenceBeatId(null);

                if (Array.isArray(fetched) && fetched.length > 0) {
                    setPages(fetched);
                    // Keep active page if it exists in new fetch, else default to first
                    setActivePageId(prev => fetched.find(p => p.id === prev) ? prev : fetched[0].id);
                } else if (typeof fetched === 'string' && fetched.trim().length > 0) {
                    // Migrate legacy string content to first page
                    const newPage = { id: Date.now().toString(), title: 'Master Note', content: fetched };
                    setPages([newPage]);
                    setActivePageId(newPage.id);
                } else {
                    // No content, init empty page
                    const newPage = { id: Date.now().toString(), title: 'New Note', content: '' };
                    setPages([newPage]);
                    setActivePageId(newPage.id);
                }
            } else {
                // Doc doesn't exist, init empty
                const newPage = { id: Date.now().toString(), title: 'New Note', content: '' };
                setPages([newPage]);
                setActivePageId(newPage.id);
                setReferenceBeatId(null);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
            setPages([{ id: Date.now().toString(), title: 'Error Note', content: 'Failed to load content.' }]);
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
                [noteType]: pages, // Save the entire array of pages
                referenceBeatId: referenceBeatId // Save reference beat link
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

    const handleCreatePage = () => {
        const newPage = { id: Date.now().toString(), title: `Note ${pages.length + 1}`, content: '' };
        setPages([...pages, newPage]);
        setActivePageId(newPage.id);
    };

    const handleDeletePage = (pageId) => {
        if (pages.length <= 1) {
            alert("You must have at least one note page.");
            return;
        }
        if (confirm("Are you sure you want to delete this note?")) {
            const newPages = pages.filter(p => p.id !== pageId);
            setPages(newPages);
            if (activePageId === pageId) {
                setActivePageId(newPages[0]?.id || null);
            }
            // Auto-save happens via manual save or interval usually, but let's trigger it for UX
            // handleSave(); // Optional
        }
    };

    const movePage = (index, direction) => {
        const newPages = [...pages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newPages.length) {
            const temp = newPages[index];
            newPages[index] = newPages[targetIndex];
            newPages[targetIndex] = temp;
            setPages(newPages);
        }
    };

    const updateActivePageContent = (newContent) => {
        setPages(pages.map(p => p.id === activePageId ? { ...p, content: newContent } : p));
    };

    const updatePageTitle = (pageId, newTitle) => {
        setPages(pages.map(p => p.id === pageId ? { ...p, title: newTitle } : p));
    };

    const activePage = pages.find(p => p.id === activePageId) || { content: '' };

    // Find the beat URL if allowed
    // 1. If viewing a Beat/Favorite directly -> Use that beat
    // 2. If viewing a Booking -> Use the Reference Beat if selected
    const activeBeat = (selectedType === 'beat' || selectedType === 'favorite')
        ? (selectedType === 'beat' ? licensedBeats.find(b => b.id === selectedId) : favoriteBeats.find(b => b.id === selectedId))
        : (referenceBeatId ? allBeats.find(b => b.id === referenceBeatId) : null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAIWriter = async () => {
        if (!aiPrompt && aiMode !== 'continue') return;
        setAiLoading(true);
        setAiResult('');

        const isLocal = window.location.hostname === 'localhost';
        const functionUrl = isLocal
            ? 'http://localhost:5001/print-lab-studios/us-central1/aiWriter'
            : 'https://us-central1-print-lab-studios.cloudfunctions.net/aiWriter';

        try {
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: aiPrompt,
                    mode: aiMode,
                    currentLyrics: activePage.content,
                    context: selectedType === 'beat' || selectedType === 'favorite' ? selectedId : ''
                })
            });
            const data = await response.json();
            if (data.success) {
                setAiResult(data.result);
            } else {
                alert("AI Generation failed: " + data.error);
            }
        } catch (error) {
            console.error("AI Writer Error:", error);
            alert("Failed to connect to AI Writer");
        }
        setAiLoading(false);
    };


    // Auto-save logic (Debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pages.length > 0 && selectedId) {
                // Optional: Auto-save could go here if user wants silent save
                // handleSave();
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [pages]);

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

                {favoriteBeats?.length > 0 && (
                    <>
                        <div className="p-4 border-b border-white/5 bg-zinc-950/20">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Favorite Beats</h3>
                        </div>
                        {favoriteBeats.map(beat => (
                            <button
                                key={beat.id}
                                onClick={() => { setSelectedId(beat.id); setSelectedType('favorite'); }}
                                className={`w-full text-left p-4 border-b border-white/5 transition-colors hover:bg-white/5 ${selectedId === beat.id ? 'bg-gold/10 border-l-4 border-l-gold' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="font-bold text-white text-sm mb-1 truncate">{beat.title}</div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Heart size={12} className="text-gold" />
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
                            onClick={() => setShowAI(!showAI)}
                            className={`p-2 rounded-lg transition-all ${showAI ? 'bg-gold text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                        >
                            <Sparkles size={18} />
                        </button>
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

                <div className="flex-1 flex flex-row relative overflow-hidden">

                    {/* Pages Sidebar (Internal) */}
                    <div className="w-48 border-r border-white/5 bg-black/20 flex flex-col">
                        <div className="p-2 border-b border-white/5 flex justify-between items-center bg-black/40">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pages</span>
                            <button onClick={handleCreatePage} className="text-zinc-400 hover:text-gold transition-colors">
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {pages.map((page, index) => (
                                <div key={page.id} className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer ${activePageId === page.id ? 'bg-white/10 text-white font-bold' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                                    onClick={() => setActivePageId(page.id)}
                                >
                                    {titleEditing === page.id ? (
                                        <input
                                            autoFocus
                                            className="bg-transparent border-none outline-none w-full"
                                            value={page.title}
                                            onChange={(e) => updatePageTitle(page.id, e.target.value)}
                                            onBlur={() => setTitleEditing(null)}
                                            onKeyDown={(e) => e.key === 'Enter' && setTitleEditing(null)}
                                        />
                                    ) : (
                                        <span onDoubleClick={() => setTitleEditing(page.id)} className="truncate w-full">{page.title}</span>
                                    )}
                                    {activePageId === page.id && (
                                        <div className="flex items-center gap-1">
                                            <div className="flex flex-col gap-0.5">
                                                {index > 0 && <button onClick={(e) => { e.stopPropagation(); movePage(index, 'up'); }} className="text-zinc-600 hover:text-white"><ChevronUp size={8} /></button>}
                                                {index < pages.length - 1 && <button onClick={(e) => { e.stopPropagation(); movePage(index, 'down'); }} className="text-zinc-600 hover:text-white"><ChevronDown size={8} /></button>}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id); }}
                                                className="sticky right-0 text-zinc-600 hover:text-red-500 transition-all p-1"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Internal Audio Player / Selector */}
                        <div className="p-3 border-t border-white/5 bg-zinc-950/50">
                            {selectedType === 'booking' && (
                                <div className="mb-2">
                                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Session Reference Beat</label>
                                    <select
                                        value={referenceBeatId || ''}
                                        onChange={(e) => setReferenceBeatId(e.target.value || null)}
                                        className="w-full bg-black/50 border border-white/10 text-white text-[10px] rounded p-1 outline-none focus:border-gold"
                                    >
                                        <option value="">-- No Beat Linked --</option>
                                        {(allBeats || []).map(beat => (
                                            <option key={beat.id} value={beat.id}>{beat.title} ({beat.bpm}BPM)</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {activeBeat ? (
                                <>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                                            <Music size={14} className="text-gold" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-bold text-white truncate">{activeBeat.title}</div>
                                            <div className="text-[9px] text-zinc-500 truncate">{activeBeat.bpm} BPM • {activeBeat.songKey}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={togglePlay}
                                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-gold py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                                        >
                                            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                                            {isPlaying ? 'Pause' : 'Play Beat'}
                                        </button>
                                    </div>
                                    <audio ref={audioRef} src={activeBeat.previewUrl} onEnded={() => setIsPlaying(false)} />
                                </>
                            ) : (
                                selectedType === 'booking' && !referenceBeatId && (
                                    <div className="text-[9px] text-zinc-600 font-mono text-center">Select a beat above to ply</div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Text Area */}
                    <textarea
                        value={activePage.content}
                        onChange={(e) => updateActivePageContent(e.target.value)}
                        placeholder={noteType === 'lyrics' ? "Write your lyrics here..." : "Microphone positions, preamp settings, outboard gear used..."}
                        className="flex-1 bg-transparent p-6 text-white font-mono text-sm resize-none focus:outline-none leading-relaxed placeholder:text-zinc-700"
                    />

                    {/* AI Writer Panel */}
                    {showAI && (
                        <div className="w-80 bg-zinc-950 border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                                <h4 className="text-xs font-black uppercase tracking-widest text-gold flex items-center gap-2">
                                    <Sparkles size={14} /> AI Writer
                                </h4>
                                <button onClick={() => setShowAI(false)} className="text-zinc-500 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Generate Mode</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['verse', 'hook', 'rhymes', 'continue'].map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => setAiMode(mode)}
                                                className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${aiMode === mode ? 'bg-gold text-black' : 'bg-zinc-900 text-zinc-500 border border-white/5 hover:border-white/10'}`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {aiMode !== 'continue' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                            {aiMode === 'rhymes' ? 'Rhyme words' : 'What is it about?'}
                                        </label>
                                        <textarea
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder={aiMode === 'rhymes' ? "e.g. Norfolk, night, cold" : "e.g. Growing up in the city, finding success..."}
                                            className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 text-xs text-white focus:border-gold outline-none h-24 resize-none"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleAIWriter}
                                    disabled={aiLoading}
                                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {aiLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send size={14} />}
                                    {aiMode === 'continue' ? 'Continue Lyrics' : 'Generate Idea'}
                                </button>

                                {aiResult && (
                                    <div className="space-y-2 mt-6 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-gold uppercase tracking-widest">AI Result</label>
                                            <button
                                                onClick={() => {
                                                    updateActivePageContent(activePage.content + (activePage.content ? '\n\n' : '') + aiResult);
                                                    setAiResult('');
                                                }}
                                                className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1"
                                            >
                                                <Copy size={12} /> Add to Editor
                                            </button>
                                        </div>
                                        <div className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                                            {aiResult}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionNotes;
