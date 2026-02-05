import React, { useState, useEffect, useRef } from 'react';
import { Mic, Phone, PhoneOff, X, Volume2, Send } from 'lucide-react';
import { useAuth } from '../core/AuthContext';

const AIReceptionist = () => {
    const { addNewBooking, allUsers } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [callStatus, setCallStatus] = useState('idle');
    const [transcript, setTranscript] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);

    // Use ref for conversation context
    const contextRef = useRef({
        studio: null,
        date: null,
        time: null,
        duration: 2,
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
        contextRef.current = { studio: null, date: null, time: null, duration: 2, stage: 'GREETING' };

        setTimeout(() => {
            setCallStatus('connected');
            speakWithElevenLabs("Hello! Thanks for calling Print Audio Lab. My name is Aria. How can I help you book a session today?");
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

            // Voice: 'Bella' (Realistic Female) | Model: 'Turbo v2' (Low Latency)
            const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_turbo_v2',
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

    const parseBookingDetails = (text) => {
        const input = text.toLowerCase();
        let date = new Date(); // Default to today
        let time = "12:00";
        let duration = 2;

        // 1. Parse Date
        if (input.includes('tomorrow')) {
            date.setDate(date.getDate() + 1);
        } else if (input.includes('next week')) {
            date.setDate(date.getDate() + 7);
        } else {
            // Check for day names
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const todayDay = date.getDay();

            for (let i = 0; i < 7; i++) {
                if (input.includes(days[i])) {
                    let diff = i - todayDay;
                    if (diff <= 0) diff += 7; // Next occurrence
                    date.setDate(date.getDate() + diff);
                    break;
                }
            }
        }

        // 2. Parse Time
        const timeMatch = input.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)?/);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[3] || '00';
            const meridiem = timeMatch[4];

            if (meridiem === 'pm' && hours < 12) hours += 12;
            if (meridiem === 'am' && hours === 12) hours = 0;

            time = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }

        // 3. Parse Duration
        const durationMatch = input.match(/(\d+)\s*(hour|hr)/);
        if (durationMatch) {
            duration = parseInt(durationMatch[1]);
        }

        return {
            date: date.toISOString().split('T')[0],
            time,
            duration
        };
    };

    // KNOWLEDGE BASE (FAQs)
    const checkKnowledgeBase = (input) => {
        const i = input.toLowerCase();

        // Equipment
        if (i.includes('equip') || i.includes('gear') || i.includes('mic') || i.includes('interface'))
            return "Both studios are equipped with industry-standard gear. Studio A features the Neumann U87 and Avalon 737. Studio B runs a slate of top digital interfaces. We use extensive acoustic treatment in both.";

        // Rules
        if (i.includes('smoke') || i.includes('smoking') || i.includes('party') || i.includes('guest'))
            return "We have a strict policy: Max 5 guests per session to keep the vibe focused. No smoking inside the vocal booths, but we have a lounge area. We want you to be comfortable but productive.";

        // Location
        if (i.includes('address') || i.includes('location') || i.includes('where'))
            return "We are located in the heart of the downtown arts district, right off Main Street. There's plenty of street parking available.";

        // Pricing (General)
        if (i.includes('much') || i.includes('cost') || i.includes('price'))
            return "Studio A is $75 an hour, and Studio B is $65 an hour. Both include an engineer if you need one, or you can bring your own.";

        return null;
    };

    // AVAILABILITY CHECKER
    const isSlotAvailable = (date, time, studio) => {
        // Simple collision detection
        const targetStudio = studio === 'Studio A' ? 'Studio A (The Main Room)' : 'Studio B (The Lab)';

        // 1. Flatten all bookings from all artists
        const allBookings = allUsers.flatMap(u => u.bookings || []);

        // 2. Check for collision
        const collision = allBookings.find(b =>
            b.studio === targetStudio &&
            b.date === date &&
            b.time === time &&
            b.status !== 'Denied' && b.status !== 'Cancelled'
        );

        return !collision;
    };

    const handleUserMessage = (userText) => {
        const input = userText.toLowerCase();
        const ctx = contextRef.current;
        console.log('Current stage:', ctx.stage, 'Input:', input);

        // 0. CHECK KNOWLEDGE BASE FIRST (Global Interruption)
        const faqAnswer = checkKnowledgeBase(input);
        if (faqAnswer && ctx.stage !== 'CONFIRMING') {
            speakWithElevenLabs(faqAnswer);
            return;
        }

        // 1. GREETING stage
        if (ctx.stage === 'GREETING') {
            if (input.includes('book') || input.includes('session') || input.includes('studio') || input.includes('slot')) {
                contextRef.current.stage = 'CHOOSING_STUDIO';
                speakWithElevenLabs("Perfect! We have two studios available: Studio A is our flagship at $75/hr, and Studio B is $65/hr. Which one sounds like the right fit for you?");
                return;
            }
        }

        // 2. Handle Studio selection
        if (input.includes('studio a') || input.includes('main room')) {
            contextRef.current.studio = 'Studio A';
            contextRef.current.stage = 'CHOOSING_TIME';
            speakWithElevenLabs("Excellent choice! Studio A is our flagship space. When were you looking to come in?");
            return;
        }

        if (input.includes('studio b') || input.includes('the lab')) {
            contextRef.current.studio = 'Studio B';
            contextRef.current.stage = 'CHOOSING_TIME';
            speakWithElevenLabs("Studio B is an amazing choice. What date and time works best for you?");
            return;
        }

        // 3. Handle Time/Date
        if (ctx.stage === 'CHOOSING_TIME') {
            const hasDateTime = input.match(/\d+/) ||
                input.includes('tomorrow') ||
                input.includes('today') ||
                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].some(d => input.includes(d));

            if (hasDateTime) {
                const details = parseBookingDetails(input);

                // CHECK AVAILABILITY
                if (!isSlotAvailable(details.date, details.time, ctx.studio)) {
                    speakWithElevenLabs(`I'm sorry, but ${ctx.studio} is already booked on ${details.date} at ${details.time}. Do you have another time in mind?`);
                    return;
                }

                contextRef.current.date = details.date;
                contextRef.current.time = details.time;
                contextRef.current.duration = details.duration;

                contextRef.current.stage = 'CONFIRMING';
                const totalPrice = (ctx.studio === 'Studio A' ? 75 : 65) * details.duration;
                const deposit = totalPrice * 0.5;
                speakWithElevenLabs(`Okay, I have ${details.date} at ${details.time} in ${ctx.studio}. The total is $${totalPrice}. to lock this in, I need to collect a 50% deposit of $${deposit}. Should I charge the card on file?`);
                return;
            } else {
                speakWithElevenLabs("Just let me know what day and time works for you, and I'll check our live calendar.");
                return;
            }
        }

        // 4. Handle confirmation -> Payment
        if (ctx.stage === 'CONFIRMING') {
            if (input.includes('yes') || input.includes('charge') || input.includes('do it') || input.includes('sure') || input.includes('ok')) {
                contextRef.current.stage = 'PAYMENT';
                speakWithElevenLabs("Processing that now... One moment.");

                // Simulate processing delay
                setTimeout(() => {
                    const totalPrice = (ctx.studio === 'Studio A' ? 75 : 65) * (ctx.duration || 2);
                    const bookingData = {
                        studio: ctx.studio === 'Studio A' ? 'Studio A (The Main Room)' : 'Studio B (The Lab)',
                        date: ctx.date || new Date().toISOString().split('T')[0],
                        time: ctx.time || "12:00",
                        duration: ctx.duration || 2,
                        price: totalPrice,
                        status: 'Confirmed', // Instant confirmation with deposit
                        source: 'AI Receptionist',
                        paymentStatus: 'Deposit Paid' // New status
                    };

                    addNewBooking(bookingData);
                    speakWithElevenLabs("Success! Your deposit is paid and your session is officially confirmed. Receipts are in your portal. taking care of business!");

                    // Reset
                    contextRef.current = { studio: null, date: null, time: null, duration: 2, stage: 'GREETING' };
                }, 1500);
                return;
            } else if (input.includes('no') || input.includes('later')) {
                speakWithElevenLabs("Understood. I can place a temporary hold, but it won't be confirmed until the deposit is settled online. Should I do that?");
                // Could add a 'TENTATIVE' stage here, but keeping it simple for now
                const totalPrice = (ctx.studio === 'Studio A' ? 75 : 65) * (ctx.duration || 2);
                const bookingData = {
                    studio: ctx.studio === 'Studio A' ? 'Studio A (The Main Room)' : 'Studio B (The Lab)',
                    date: ctx.date || new Date().toISOString().split('T')[0],
                    time: ctx.time || "12:00",
                    duration: ctx.duration || 2,
                    price: totalPrice,
                    status: 'Pending',
                    source: 'AI Receptionist',
                    paymentStatus: 'Unpaid'
                };
                addNewBooking(bookingData);
                contextRef.current = { studio: null, date: null, time: null, duration: 2, stage: 'GREETING' };
                return;
            }
        }

        // PAYMENT Stage (Handling any follow-up if needed, though the timeout handles success)
        if (ctx.stage === 'PAYMENT') {
            // Usually we wouldn't be here listening unless silence/interruption? 
            // The timeout above resets state. 
            return;
        }

        // Default Fallback
        speakWithElevenLabs("I'm sorry, I didn't quite catch that. You can ask me about our gear, rules, or to book a session.");
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
