import React, { useState, useRef } from 'react';
import { Phone, PhoneOff, Mic, Send, Play, Square } from 'lucide-react';

const VoiceDebugger = () => {
    const [status, setStatus] = useState('idle'); // idle, calling, speaking, processing
    const [transcript, setTranscript] = useState([]);
    const [inputText, setInputText] = useState('');
    const [debugLog, setDebugLog] = useState([]);
    const audioRef = useRef(null);

    const PROJECT_ID = 'print-lab-studios';  // Ensure this matches .firebaserc or emulator default
    // Use emulator URL. Note: 'us-central1' is default region.
    // If project is demo-no-project, use that. We'll try dynamic or hardcode based on standard emulation.
    // Update: user's emulator output showed "demo-no-project" earlier, but now we have firebase.json
    // Let's try "print-lab-studios" first, else fallback.
    // const FUNCTION_URL = `http://localhost:5001/${PROJECT_ID}/us-central1/processSpeech`;
    const FUNCTION_URL = `http://localhost:5001`; // functions-framework serves target at root

    const addToLog = (msg) => setDebugLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleCall = () => {
        setStatus('calling');
        addToLog(`CONNECTING to ${FUNCTION_URL}...`);

        // Simulate initial greeting fetch or just hardcode client greeting
        // Real implementation: Twilio hits incomingCall -> returns TwiML -> Player plays it.
        // For Debugger: We just assume connection and wait for user to "speak".
        setTimeout(() => {
            setStatus('connected');
            setTranscript(prev => [...prev, { from: 'AI', text: "Hello, thanks for calling Print Audio Lab. I'm Aria, the AI receptionist." }]);
        }, 1000);
    };

    const handleSend = async (text) => {
        if (!text) return;

        // 1. User turn
        const userMsg = { from: 'User', text };
        setTranscript(prev => [...prev, userMsg]);
        setInputText('');
        setStatus('processing');
        addToLog(`SENDING: "${text}"`);

        try {
            // 2. Hit the local function
            // Note: Twilio sends 'SpeechResult' in the body.
            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    SpeechResult: text,
                    CallSid: 'test-call-id-123',
                    From: '+15550000000' // Test phone number
                })
            });

            const xmlText = await response.text();
            addToLog(`RECEIVED TwiML: ${xmlText.substring(0, 100)}...`);

            // 3. Parse TwiML (Simple Regex for <Say> content)
            const sayMatch = xmlText.match(/<Say[^>]*>(.*?)<\/Say>/);
            const hangup = xmlText.includes('<Hangup/>');

            if (sayMatch) {
                const aiText = sayMatch[1];
                setTranscript(prev => [...prev, { from: 'AI', text: aiText }]);
                addToLog(`AI SAID: "${aiText}"`);
                setStatus('connected');
            }

            if (hangup) {
                setStatus('ended');
                addToLog("Call Ended by AI.");
            }

        } catch (err) {
            console.error(err);
            addToLog(`ERROR: ${err.message}`);
            setStatus('error');
        }
    };

    return (
        <div className="bg-black border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[600px] w-full max-w-md mx-auto shadow-2xl">
            {/* Header */}
            <div className="bg-zinc-900 p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        Voice Debugger
                    </h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Local Emulator Bridge</p>
                </div>
                <div className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-400">
                    localhost:5001
                </div>
            </div>

            {/* Logs/Transcript */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm bg-black/50">
                {transcript.map((t, i) => (
                    <div key={i} className={`p-3 rounded-lg ${t.from === 'AI' ? 'bg-zinc-800 text-gold ml-0 mr-8' : 'bg-indigo-900/30 text-indigo-300 ml-8 mr-0 text-right'}`}>
                        <div className="text-[8px] uppercase opacity-50 mb-1">{t.from}</div>
                        {t.text}
                    </div>
                ))}

                {status === 'processing' && (
                    <div className="text-zinc-500 italic text-xs animate-pulse">Processing...</div>
                )}
            </div>

            {/* Debug Console */}
            <div className="h-32 bg-zinc-950 border-t border-white/10 p-2 overflow-y-auto text-[10px] text-green-500 font-mono">
                {debugLog.map((l, i) => <div key={i}>{l}</div>)}
            </div>

            {/* Controls */}
            <div className="p-4 bg-zinc-900 border-t border-white/10">
                {status === 'idle' ? (
                    <button onClick={handleCall} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                        <Phone size={18} /> Start Test Call
                    </button>
                ) : status === 'ended' ? (
                    <button onClick={() => { setTranscript([]); setStatus('idle'); }} className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg">
                        Reset Debugger
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-black border border-white/10 rounded-lg px-3 text-white focus:border-gold outline-none"
                            placeholder="Type simulated speech..."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend(inputText)}
                        />
                        <button onClick={() => handleSend(inputText)} className="bg-gold text-black p-3 rounded-lg font-bold">
                            <Send size={18} />
                        </button>
                        <button onClick={() => setStatus('ended')} className="bg-red-500/20 text-red-500 p-3 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                            <PhoneOff size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceDebugger;
