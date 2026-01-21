import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../core/AuthContext';
import BeatCard from '../components/BeatCard';
import { Search, Filter, Music, Play, Pause } from 'lucide-react';

const Beats = () => {
    const { user, licenseBeat } = useAuth();
    const [beats, setBeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeGenre, setActiveGenre] = useState('All');
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const audioRef = React.useRef(new Audio());

    const genres = ['All', 'Hip Hop', 'Trap', 'R&B', 'Pop', 'Drill'];

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

    const handleLicense = async (beat) => {
        if (!user) {
            alert("Please login to license beats.");
            return;
        }
        const success = await licenseBeat(user.uid, beat);
        if (success) {
            alert(`Beat "${beat.title}" licensed successfully!`);
        }
    };

    const filteredBeats = beats.filter(beat => {
        const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGenre = activeGenre === 'All' || beat.genre === activeGenre;
        return matchesSearch && matchesGenre;
    });

    const isLicensed = (beatId) => {
        return user?.licensedBeats?.some(lb => lb.id === beatId);
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBeats.map(beat => (
                            <BeatCard
                                key={beat.id}
                                beat={beat}
                                isPlaying={currentPlaying?.id === beat.id}
                                onPlay={handlePlay}
                                onLicense={handleLicense}
                                isLicensed={isLicensed(beat.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Beats;
