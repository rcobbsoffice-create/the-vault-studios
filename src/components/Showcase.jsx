import React, { useEffect, useRef } from 'react';

const Showcase = () => {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const scrollPercent = Math.max(0, Math.min(1, 1 - (rect.bottom / (window.innerHeight + rect.height))));

            // Subtle parallax for background
            if (contentRef.current) {
                contentRef.current.style.transform = `scale(${1 + scrollPercent * 0.1}) translateY(${scrollPercent * 50}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section
            id="showcase"
            ref={sectionRef}
            className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black"
        >
            {/* Visual Background (Cinematic Image used as "Video" fallback) */}
            <div
                ref={contentRef}
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out"
                style={{
                    backgroundImage: 'url("/assets/showcase.png")',
                    willChange: 'transform'
                }}
            >
                {/* Deep Moody Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80"></div>
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Noise Texture */}
                <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none"></div>
            </div>

            {/* Showcase Content */}
            <div className="relative z-10 container mx-auto px-6 text-center">
                <div className="inline-block mb-6 animate-slow-pulse">
                    <span className="px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-[10px] font-black uppercase tracking-[0.3em]">
                        The Experience
                    </span>
                </div>

                <h2 className="font-display text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase leading-none">
                    BEYOND THE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-gold to-yellow-600">SOUND BARRIER</span>
                </h2>

                <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium tracking-wide mb-12 drop-shadow-lg">
                    Norfolk's premier destination for high-fidelity production, custom engineering, and and unparalleled creative privacy.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-12 text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                        <span>Analog Warmth</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                        <span>Digital Precision</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                        <span>Ultimate Privacy</span>
                    </div>
                </div>
            </div>

            {/* Decorative Edge Glow */}
            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent"></div>
            <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent"></div>
        </section>
    );
};

export default Showcase;
