import React, { useState, useEffect, useRef } from 'react';
import { Mic, Phone, PhoneOff, X, Volume2, Send } from 'lucide-react';

const AIReceptionist = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [callStatus, setCallStatus] = useState('idle');
    const [transcript, setTranscript] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);

    // Use ref for conversation context to avoid stale closures
    const contextRef = useRef({
        studio: null,
        date: null,
        time: null,
        stage: 'GREETING'
    });

    const recognitionRef = useRef(null);
    const audioRef = useRef(null);
    const transcriptEndRef = useRef(null);

    useEffect(() => {
        if (transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [transcript]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const userText = event.results[0][0].transcript;
                setTranscript(prev => [...prev, { from: 'User', text: userText }]);
                setIsListening(false);
                handleUserMessage(userText);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        } else {
            setIsSpeechSupported(false);
        }
    }, []);

    const startCall = async () => {
        setIsOpen(true);
        setCallStatus('calling');
        contextRef.current = { studio: null, date: null, time: null, stage: 'GREETING' };

        setTimeout(() => {
            setCallStatus('connected');
            speakWithElevenLabs("Hello! Thanks for calling The Vault Studios. My name is Aria. How can I help you book a session today?");
        }, 2000);
    };

    const endCall = () => {
        setCallStatus('ended');
        if (recognitionRef.current) recognitionRef.current.stop();
        if (audioRef.current) audioRef.current.pause();
        setTimeout(() => {
            setIsOpen(false);
            setCallStatus('idle');
            setTranscript([]);
        }, 1000);
    };

    const speakWithElevenLabs = async (text) => {
        try {
            setIsSpeaking(true);
            setTranscript(prev => [...prev, { from: 'AI', text }]);
            const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

            if (!apiKey) {
                fallbackToSpeech(text);
                return;
            }

            const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: { stability: 0.5, similarity_boost: 0.75 }
                })
            });

            if (!response.ok) throw new Error('ElevenLabs API error');
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };
            await audioRef.current.play();
        } catch (error) {
            console.error('ElevenLabs error:', error);
            fallbackToSpeech(text);
        }
    };

    const fallbackToSpeech = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const startListening = async () => {
        if (!isSpeechSupported) return;
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsListening(true);
            recognitionRef.current.start();
        } catch (error) {
            setIsListening(false);
            alert('Could not access microphone.');
        }
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!userInput.trim()) return;
        const text = userInput.trim();
        setTranscript(prev => [...prev, { from: 'User', text }]);
        setUserInput('');
        handleUserMessage(text);
    };

    const handleUserMessage = (userText) => {
        const input = userText.toLowerCase();
        const ctx = contextRef.current;

        console.log('Current stage:', ctx.stage, 'Input:', input);

        // 1. GREETING stage - initial conversation
        if (ctx.stage === 'GREETING') {
            if (input.includes('book') || input.includes('session') || input.includes('studio') || input.includes('price') || input.includes('rate')) {
                contextRef.current.stage = 'CHOOSING_STUDIO';
                speakWithElevenLabs("Perfect! We have three studios available: Studio A is our flagship at $85/hr, Studio B is $75/hr, and Studio C is $65/hr. Which one sounds like the right fit for you?");
                return;
            }
        }

        // 2. Handle Studio selection - works from any stage
        if (input.includes('studio a') || input.includes('the vault')) {
            contextRef.current.studio = 'Studio A';
            contextRef.current.stage = 'CHOOSING_TIME';
            speakWithElevenLabs("Excellent choice! Studio A is our flagship space with premium equipment. When were you looking to come in for your session?");
            return;
        }

        if (input.includes('studio b') || input.includes('the lab')) {
            contextRef.current.studio = 'Studio B';
            contextRef.current.stage = 'CHOOSING_TIME';
            speakWithElevenLabs("Studio B is an amazing choice for production and mixing. What date and time works best for you?");
            return;
        }

        if (input.includes('studio c') || input.includes('the booth') || input.includes('65')) {
            contextRef.current.studio = 'Studio C';
            contextRef.current.stage = 'CHOOSING_TIME';
            speakWithElevenLabs("Studio C is our most popular for vocal tracking. When would you like to book it?");
            return;
        }

        // 3. Handle Time/Date when in CHOOSING_TIME stage
        if (ctx.stage === 'CHOOSING_TIME') {
            const hasDateTime = input.match(/\d+/) ||
                input.includes('tomorrow') ||
                input.includes('today') ||
                input.includes('monday') ||
                input.includes('tuesday') ||
                input.includes('wednesday') ||
                input.includes('thursday') ||
                input.includes('friday') ||
                input.includes('saturday') ||
                input.includes('sunday') ||
                input.includes('pm') ||
                input.includes('am');

            if (hasDateTime) {
                contextRef.current.stage = 'CONFIRMING';
                speakWithElevenLabs(`Perfect! Let me check... Yes, we have that time available in ${ctx.studio}. Should I lock that in for you?`);
                return;
            } else {
                speakWithElevenLabs("Just let me know what day and time works for you, and I'll check our calendar.");
                return;
            }
        }

        // 4. Handle confirmation
        if (ctx.stage === 'CONFIRMING') {
            if (input.includes('yes') || input.includes('yeah') || input.includes('sure') || input.includes('ok') || input.includes('please')) {
                speakWithElevenLabs("Awesome! I've reserved that slot for you. You can complete your booking at thevaultstudios.com/book. Is there anything else I can help you with?");
                contextRef.current.stage = 'GREETING';
                return;
            }
        }

        // Default Fallback
        if (ctx.stage === 'CHOOSING_STUDIO') {
            speakWithElevenLabs("I didn't catch which studio you'd like. Would you prefer Studio A at $85/hr, Studio B at $75/hr, or Studio C at $65/hr?");
        } else {
            speakWithElevenLabs("I'm sorry, I didn't quite catch that. Are you looking to book a session with us?");
        }
    };

    if (!isOpen && callStatus === 'idle') {
        return (
            <button
                onClick={startCall}
                className="fixed bottom-8 right-8 bg-gold text-black p-4 rounded-full shadow-lg hover:shadow-gold/50 transition-all hover:scale-105 z-50 flex items-center gap-2 font-bold"
            >
                <Phone size={24} />
                <span className="hidden md:inline">Call AI Receptionist</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="bg-zinc-900 border border-gold/30 rounded-2xl w-80 md:w-96 shadow-2xl overflow-hidden flex flex-col h-[550px]">
                {/* Header */}
                <div className="bg-zinc-950 p-4 flex justify-between items-center border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${callStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                        <div>
                            <h3 className="font-display font-bold text-lg text-white">Aria (AI)</h3>
                            <p className="text-xs text-gray-400 capitalize">{callStatus}...</p>
                        </div>
                    </div>
                    <button onClick={endCall} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Transcript area */}
                <div className="flex-1 bg-black/50 p-4 overflow-y-auto backdrop-blur-sm scroll-smooth">
                    {callStatus === 'calling' && (
                        <div className="text-center h-full flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-2 border-gold/30 flex items-center justify-center mb-4 animate-ping">
                                <Phone size={32} className="text-gold" />
                            </div>
                            <p className="text-sm text-gold animate-pulse font-bold tracking-widest">CONNECTING...</p>
                        </div>
                    )}

                    {callStatus === 'connected' && (
                        <div className="space-y-4">
                            {transcript.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-xl max-w-[85%] ${msg.from === 'AI'
                                        ? 'bg-zinc-800 text-gray-200 self-start'
                                        : 'bg-gold/20 text-gold ml-auto border border-gold/20'
                                        }`}
                                >
                                    <div className="text-[10px] font-bold mb-1 uppercase opacity-50">{msg.from}</div>
                                    <div className="text-sm leading-relaxed">{msg.text}</div>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                            {isSpeaking && (
                                <div className="flex items-center gap-2 text-gold text-xs animate-pulse font-medium">
                                    <Volume2 size={14} />
                                    <span>Aria is speaking...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-4 bg-zinc-950 border-t border-white/10 space-y-4">
                    <div className="flex justify-center gap-4">
                        {isSpeechSupported && (
                            <button
                                onClick={startListening}
                                disabled={isSpeaking || isListening || callStatus !== 'connected'}
                                className={`p-4 rounded-full transition-all transform active:scale-95 ${isListening
                                    ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white disabled:opacity-30'
                                    }`}
                            >
                                <Mic size={24} />
                            </button>
                        )}
                        <button
                            onClick={endCall}
                            className="p-4 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 active:scale-95"
                        >
                            <PhoneOff size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            disabled={callStatus !== 'connected' || isSpeaking}
                            placeholder={isSpeechSupported ? "Type here or use mic..." : "Type your message..."}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-all pr-12 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!userInput.trim() || isSpeaking}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gold hover:text-white transition-colors disabled:opacity-30"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
                <div className="px-4 py-2 bg-zinc-950 border-t border-white/10 text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    Powered by ElevenLabs Voice AI
                </div>
            </div>
        </div>
    );
};

export default AIReceptionist;
