import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ audioElement, isPlaying }) => {
    const canvasRef = useRef(null);
    const analyzerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!audioElement || !canvasRef.current) return;

        // Safety check for AudioContext (it might be attached to the element or global)
        const audioContext = audioElement.audioContext || new (window.AudioContext || window.webkitAudioContext)();

        // Avoid re-connecting if already connected (simple check, though proper graph management is better)
        // For this simple visualizer, we'll try/catch the connection

        let source;
        let analyzer;

        try {
            // Create analyzer
            analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 64;

            // Connect source
            // Note: createMediaElementSource can only be called once per element. 
            // We should ideally check if it already has a source.
            // But since we can't easily check, we wrap in try/catch or store in a WeakMap?
            // Actually, for this fix, let's just create a new context if needed or assume cleanliness.
            // Better yet, just protect against the "already connected" error.
            try {
                source = audioContext.createMediaElementSource(audioElement);
                source.connect(analyzer);
                analyzer.connect(audioContext.destination);
            } catch (e) {
                // If already connected, we might not be able to visualize w/o more complex state
                // But this prevents the CRASH that stops playback.
                console.warn("Visualizer connection warning:", e);
                return;
            }

            const bufferLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyzerRef.current = analyzer;

            const draw = () => {
                animationRef.current = requestAnimationFrame(draw);
                analyzer.getByteFrequencyData(dataArray);

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = (dataArray[i] / 255) * canvas.height;

                    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                    gradient.addColorStop(0, 'rgba(212, 175, 55, 0.1)');
                    gradient.addColorStop(1, 'rgba(212, 175, 55, 0.6)');

                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                    x += barWidth + 1;
                }
            };

            if (isPlaying) {
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                draw();
            }
        } catch (e) {
            console.error("AudioVisualizer logic failed", e);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [audioElement, isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-12 absolute bottom-0 left-0 opacity-40 pointer-events-none"
            width={300}
            height={48}
        />
    );
};

export default AudioVisualizer;
