import React, { useState } from 'react';
import { Youtube, Download, Loader2, AlertCircle, Music, Link as LinkIcon } from 'lucide-react';

const YouTubeConverter = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // Extract YouTube video ID from URL
    const extractVideoId = (url) => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/shorts\/([^&\n?#]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    const handleConvert = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        const videoId = extractVideoId(url);
        if (!videoId) {
            setError('Invalid YouTube URL. Please enter a valid YouTube link.');
            return;
        }

        setLoading(true);

        try {
            // Using a free API service for conversion
            // Note: This uses an external API - for production, consider self-hosting
            const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'demo-key', // User should replace with actual key
                    'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
                }
            });

            const data = await response.json();

            if (data.status === 'ok' && data.link) {
                setResult({
                    title: data.title,
                    downloadUrl: data.link,
                    duration: data.duration,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                });
            } else {
                throw new Error(data.msg || 'Conversion failed. Try a different video.');
            }
        } catch (err) {
            console.error('Conversion error:', err);
            // Fallback: provide manual instructions
            setError(
                'API unavailable. For now, use one of these alternatives:\n' +
                '• y2mate.com\n' +
                '• ytmp3.cc\n' +
                '• 320ytmp3.com'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-2xl mb-4">
                    <Youtube className="text-red-500" size={32} />
                </div>
                <h2 className="text-3xl font-display font-bold text-white mb-2">YouTube to MP3</h2>
                <p className="text-gray-500 text-sm">
                    Internal tool for downloading reference tracks and stems
                </p>
            </div>

            {/* Warning Banner */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-yellow-200/80">
                        <strong className="text-yellow-400">For internal use only.</strong> Only download content you have rights to use. 
                        Reference tracks should be properly licensed for commercial projects.
                    </div>
                </div>
            </div>

            {/* Converter Form */}
            <form onSubmit={handleConvert} className="space-y-4">
                <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste YouTube URL here..."
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-medium focus:border-red-500 outline-none transition-all placeholder:text-zinc-600"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !url.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg uppercase tracking-wide transition-all disabled:opacity-50 disabled:hover:bg-red-600 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Converting...
                        </>
                    ) : (
                        <>
                            <Music size={20} />
                            Convert to MP3
                        </>
                    )}
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-red-200/80 whitespace-pre-line">{error}</div>
                    </div>
                </div>
            )}

            {/* Result Card */}
            {result && (
                <div className="mt-6 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                    {/* Thumbnail */}
                    <div className="relative aspect-video">
                        <img 
                            src={result.thumbnail} 
                            alt={result.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-lg line-clamp-2">{result.title}</h3>
                            {result.duration && (
                                <p className="text-gray-400 text-sm mt-1">Duration: {result.duration}</p>
                            )}
                        </div>
                    </div>

                    {/* Download Button */}
                    <div className="p-4">
                        <a
                            href={result.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg uppercase tracking-wide transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Download MP3
                        </a>
                    </div>
                </div>
            )}

            {/* Quick Links */}
            <div className="mt-8 pt-8 border-t border-white/5">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                    Alternative Tools
                </h4>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { name: 'Y2Mate', url: 'https://y2mate.com' },
                        { name: 'YTMP3', url: 'https://ytmp3.cc' },
                        { name: '320YTMP3', url: 'https://320ytmp3.com' }
                    ].map(tool => (
                        <a
                            key={tool.name}
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg px-4 py-3 text-center text-sm font-bold text-gray-400 hover:text-white transition-all"
                        >
                            {tool.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default YouTubeConverter;
