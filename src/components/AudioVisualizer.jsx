import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ audioElement, isPlaying }) => {
    const canvasRef = useRef(null);
    const analyzerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!audioElement || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Connect the audio element to the analyzer
        const source = audioContext.createMediaElementSource(audioElement);
        const analyzer = audioContext.createAnalyser();

        source.connect(analyzer);
        analyzer.connect(audioContext.destination);

        analyzer.fftSize = 64; // Low FFT size for "harder" chunkier bars
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyzerRef.current = analyzer;

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                // Create a gradient for the bars
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, 'rgba(212, 175, 55, 0.1)'); // Gold transparent
                gradient.addColorStop(1, 'rgba(212, 175, 55, 0.6)'); // Gold visible

                ctx.fillStyle = gradient;

                // Draw mirrored bars or centered bars for a "vibe" look
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                x += barWidth + 1;
            }
        };

        if (isPlaying) {
            audioContext.resume();
            draw();
        }

        return () => {
            cancelAnimationFrame(animationRef.current);
            // We don't close the context here as it might be reused or handled by the parent
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
