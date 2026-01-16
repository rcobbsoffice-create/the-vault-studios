import React, { useState, useRef, useEffect } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Download,
    Maximize2,
    Share2,
    Eye
} from 'lucide-react';
import ShareModal from './ShareModal';
import AudioVisualizer from './AudioVisualizer';
import { useAuth } from '../core/AuthContext';

const AudioPlayer = ({ track }) => {
    const { user, incrementTrackViews } = useAuth();
    const audioRef = useRef(null);
    const hasIncrementedView = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (!isPlaying) {
            audioRef.current.play();
            // Increment view count on first play
            if (!hasIncrementedView.current && user) {
                incrementTrackViews(user.id, track.id);
                hasIncrementedView.current = true;
            }
        } else {
            audioRef.current.pause();
        }
        setIsPlaying(!isPlaying);
    };

    const onLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const onTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Construct a mock share URL
    const shareUrl = `https://thevault.studio/share/${track.id}`;

    return (
        <div className={`relative bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl group transition-all duration-500 overflow-hidden ${isPlaying ? 'border-gold/50 shadow-gold/10' : 'hover:border-gold/30'}`}>

            {/* Vibe Background Elements */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent opacity-0 transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : ''}`}></div>
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>

            {/* Audio Visualizer Integration */}
            <AudioVisualizer
                audioElement={audioRef.current}
                isPlaying={isPlaying}
            />

            <audio
                ref={audioRef}
                src={track.url}
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">

                {/* Play Button - Pulse Effect */}
                <div className="relative group/play">
                    {isPlaying && (
                        <div className="absolute inset-0 bg-gold rounded-full animate-ping opacity-20"></div>
                    )}
                    <button
                        onClick={togglePlay}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative z-10 ${isPlaying
                            ? 'bg-black text-gold border-2 border-gold/50 scale-110 shadow-gold/20'
                            : 'bg-gold text-black hover:scale-105 active:scale-95 shadow-gold/10'
                            }`}
                    >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                </div>

                {/* Track Info & Progress */}
                <div className="flex-1 w-full space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h4 className="font-display text-2xl font-black text-white uppercase tracking-tighter leading-none">{track.title}</h4>
                                <div className="flex items-center gap-3">
                                    <Eye size={12} className="text-gold" />
                                    <span className="text-[10px] font-black text-zinc-300 tabular-nums uppercase tracking-widest">{track.viewCount || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${track.type === 'Master' ? 'bg-gold text-black' :
                                        track.type === 'Mix' ? 'bg-[#00D632]/10 text-[#00D632]' :
                                            'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {track.type || 'Demo'}
                                </span>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                    {track.sessionName} • <span className="text-zinc-600">{track.date || 'Unknown Date'}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 font-bold tracking-widest tabular-nums bg-black/40 px-3 py-1 rounded-lg">
                            {formatTime(currentTime)} <span className="text-white/20">/</span> {formatTime(duration)}
                        </div>
                    </div>

                    <div className="relative group/seeker">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-gold group-hover/seeker:h-2.5 transition-all"
                        />
                        {/* Interactive fill bar could go here but standard range input is okay for now */}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 text-gray-400 border-l border-white/5 pl-8 ml-2">
                    <div className="flex items-center gap-3 group/volume">
                        <button onClick={() => setIsMuted(!isMuted)} className="hover:text-gold transition-colors">
                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-24 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-gold opacity-0 group-hover/volume:opacity-100 transition-all"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="p-3 bg-white/5 hover:text-gold hover:bg-white/10 border border-white/5 rounded-2xl transition-all active:scale-90"
                            title="Share Wave"
                        >
                            <Share2 size={20} />
                        </button>

                        <a
                            href={track.url}
                            download
                            className="p-3 bg-white/5 hover:text-white hover:bg-white/10 border border-white/5 rounded-2xl transition-all active:scale-90"
                            title="Download Wave"
                        >
                            <Download size={20} />
                        </a>
                    </div>
                </div>
            </div>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                trackTitle={track.title}
                shareUrl={shareUrl}
            />
        </div>
    );
};

export default AudioPlayer;
