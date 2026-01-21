import React, { useState } from 'react';
import { Play, Pause, ShoppingCart, Music, Download, CheckCircle } from 'lucide-react';

const BeatCard = ({ beat, onPlay, isPlaying, onLicense, isLicensed }) => {
    return (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 hover:border-gold/30 transition-all group overflow-hidden relative">
            {/* Visual background decoration */}
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Music size={120} />
            </div>

            <div className="flex items-center gap-4 relative z-10">
                {/* Play Button / Thumbnail Overlay */}
                <div className="relative w-16 h-16 shrink-0">
                    <div className="absolute inset-0 bg-black/40 rounded-xl group-hover:bg-black/20 transition-colors"></div>
                    <button
                        onClick={() => onPlay(beat)}
                        className="absolute inset-0 flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                        {isPlaying ? <Pause fill="white" size={24} /> : <Play fill="white" size={24} />}
                    </button>
                    <div className="w-full h-full bg-zinc-800 rounded-xl border border-white/5 flex items-center justify-center">
                        <Music size={24} className="text-zinc-600" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate group-hover:text-gold transition-colors">{beat.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">
                        <span>{beat.genre}</span>
                        <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                        <span>{beat.bpm} BPM</span>
                    </div>
                </div>

                {/* Action */}
                <div className="text-right">
                    <div className="text-lg font-black text-white mb-2">${beat.price}</div>
                    {isLicensed ? (
                        <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                            <CheckCircle size={10} /> Licensed
                        </div>
                    ) : (
                        <button
                            onClick={() => onLicense(beat)}
                            className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-colors flex items-center gap-2"
                        >
                            <ShoppingCart size={12} /> License
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Actions (Only for licensed beats) */}
            {isLicensed && (
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                    <a
                        href={beat.previewUrl}
                        download
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                        <Download size={12} /> Download 2-Track
                    </a>
                    {beat.stemsUrl && (
                        <a
                            href={beat.stemsUrl}
                            download
                            className="flex-1 bg-gold hover:bg-yellow-500 text-black py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download size={12} /> Download Stems
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default BeatCard;
