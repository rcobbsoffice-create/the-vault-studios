import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../core/AuthContext';
import BeatCard from '../components/BeatCard';
import { Search, Filter, Music, Play, Pause, LayoutGrid, List } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Beats = () => {
    const { user, licenseBeat, toggleFavoriteBeat } = useAuth();
    const [searchParams] = useSearchParams();
    const [beats, setBeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeGenre, setActiveGenre] = useState('All');
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const audioRef = React.useRef(new Audio());

    const genres = ['All', 'Hip Hop', 'Trap', 'R&B', 'Pop', 'Drill'];

    useEffect(() => {
        // Deep link handling
        const beatIdParam = searchParams.get('id');
        if (beatIdParam && beats.length > 0) {
            const targetBeat = beats.find(b => b.id === beatIdParam);
            if (targetBeat) {
                setSearchQuery(targetBeat.title); // Pre-fill search to "isolate" or highlight
                handlePlay(targetBeat);
                // Clean URL without reload? Optional but nice.
                // window.history.replaceState(null, '', '/beats'); // Maybe keep it so refresh works? Keep it.
            }
        }
    }, [searchParams, beats]);

    useEffect(() => {
        const q = query(collection(db, "beats"), orderBy("uploadedAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const beatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBeats(beatsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching beats:", error);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            audioRef.current.pause();
        };
    }, []);

    const handlePlay = (beat) => {
        if (currentPlaying?.id === beat.id) {
            audioRef.current.pause();
            setCurrentPlaying(null);
        } else {
            audioRef.current.src = beat.previewUrl;
            audioRef.current.play();
            setCurrentPlaying(beat);
        }
    };

    const handleLicense = async (beat, tier, price) => {
        if (!user) {
            alert("Please login to license beats.");
            return;
        }
        const success = await licenseBeat(user.uid, beat, tier, price);
        if (success) {
            alert(`Beat "${beat.title}" licensed successfully as ${tier}!`);
        }
    };

    const handleFavorite = async (beat) => {
        if (!user) {
            alert("Please login to favorite beats.");
            return;
        }
        await toggleFavoriteBeat(user.uid, beat);
    };

    const filteredBeats = beats.filter(beat => {
        const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGenre = activeGenre === 'All' || beat.genre === activeGenre;
        return matchesSearch && matchesGenre;
    });

    const isLicensed = (beatId) => {
        return user?.licensedBeats?.some(lb => lb.id === beatId);
    };

    const isFavorited = (beatId) => {
        return user?.favoriteBeats?.some(f => f.id === beatId);
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-32 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 tracking-tighter uppercase">
                        BEAT <span className="text-gold">MARKETPLACE</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        High-quality production from Norfolk's finest producers. License tracks for your next session.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-gold outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {genres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setActiveGenre(genre)}
                                className={`px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border shrink-0 ${activeGenre === genre ? 'bg-gold text-black border-gold' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/10'}`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View Filters */}
                <div className="flex justify-end mb-6">
                    <div className="bg-zinc-900 border border-white/5 p-1 rounded-xl flex items-center">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Beats Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest">Scanning the Vault...</p>
                    </div>
                ) : filteredBeats.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-white/5 border-dashed rounded-3xl p-20 text-center">
                        <Music size={64} className="mx-auto mb-6 text-zinc-800" />
                        <h3 className="text-xl font-bold text-white mb-2 uppercase">No beats found</h3>
                        <p className="text-zinc-500">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                        {filteredBeats.map(beat => (
                            viewMode === 'grid' ? (
                                <BeatCard
                                    key={beat.id}
                                    beat={beat}
                                    isPlaying={currentPlaying?.id === beat.id}
                                    onPlay={handlePlay}
                                    onLicense={handleLicense}
                                    isLicensed={isLicensed(beat.id)}
                                    onToggleFavorite={handleFavorite}
                                    isFavorited={isFavorited(beat.id)}
                                />
                            ) : (
                                <div key={beat.id} className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-gold/30 transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <button
                                            onClick={() => handlePlay(beat)}
                                            className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white hover:text-gold transition-colors shrink-0"
                                        >
                                            {currentPlaying?.id === beat.id ? <Pause size={20} /> : <Play size={20} />}
                                        </button>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white truncate text-lg">{beat.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                                <span>{beat.genre}</span>
                                                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                                <span>{beat.bpm} BPM</span>
                                                {beat.songKey && (
                                                    <>
                                                        <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                                        <span className="text-gold">{beat.songKey}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 hidden md:flex">
                                        {beat.masteringLevel && (
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded text-zinc-400">
                                                {beat.masteringLevel}
                                            </span>
                                        )}
                                        <div className="text-right">
                                            <div className="text-gold font-bold">${beat.price}</div>
                                        </div>
                                        {isLicensed(beat.id) ? (
                                            <span className="text-green-500 text-xs font-bold uppercase tracking-widest border border-green-500/20 px-3 py-1 rounded-full">Licensed</span>
                                        ) : (
                                            <button
                                                onClick={() => handleLicense(beat, 'Basic', '29.99')} // Default to basic on list view for speed
                                                className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                                            >
                                                License
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Beats;
