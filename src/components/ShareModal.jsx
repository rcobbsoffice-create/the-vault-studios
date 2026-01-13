import React, { useState } from 'react';
import { X, Copy, Check, Twitter, Instagram, Facebook as FbIcon, Share2 } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, trackTitle, shareUrl }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const socialPlatforms = [
        { name: 'X', icon: Twitter, color: 'bg-black border border-white/10' },
        { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' },
        { name: 'Facebook', icon: FbIcon, color: 'bg-[#1877F2]' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            ></div>

            <div className="relative bg-zinc-950 border border-gold/30 w-full max-w-sm rounded-[3rem] p-10 shadow-[0_0_80px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Background Noise Vibe */}
                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-all hover:rotate-90 duration-300"
                >
                    <X size={24} />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gold/5 flex items-center justify-center mb-8 border border-gold/20 shadow-inner">
                        <Share2 className="text-gold" size={32} />
                    </div>

                    <h3 className="font-display text-3xl font-black text-white uppercase tracking-tighter mb-2">
                        Share Track
                    </h3>
                    <p className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-10 opacity-60">
                        {trackTitle}
                    </p>

                    {/* Copy Link Section */}
                    <div className="w-full bg-black rounded-3xl p-3 flex items-center gap-3 mb-10 border border-white/10 shadow-2xl">
                        <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="bg-transparent text-[10px] text-zinc-500 font-mono px-4 flex-1 outline-none truncate font-bold"
                        />
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${copied ? 'bg-green-500 text-white translate-y-[-2px]' : 'bg-gold text-black hover:bg-yellow-500 hover:shadow-gold/20'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <Check size={14} />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy size={14} />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>

                    {/* Social Media Shortcuts */}
                    <div className="w-full grid grid-cols-3 gap-6">
                        {socialPlatforms.map((platform) => (
                            <button
                                key={platform.name}
                                className="flex flex-col items-center gap-3 group"
                            >
                                <div className={`w-14 h-14 rounded-[1.5rem] ${platform.color} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-active:scale-95 shadow-xl`}>
                                    <platform.icon size={24} className="text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-gold transition-colors">
                                    {platform.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
