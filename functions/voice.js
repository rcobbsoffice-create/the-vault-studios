const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require('path');

// Lazy load dependencies
let OpenAI, Twilio, openai, twilio, stripe, cors;

function ensureFirebase() {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
}

function initClients() {
    if (!OpenAI) OpenAI = require("openai").OpenAI;
    if (!Twilio) Twilio = require("twilio");
    if (!cors) cors = require('cors')({ origin: true });

    if (!process.env.GROQ_API_KEY) {
        require('dotenv').config({ path: path.resolve(__dirname, '.env') });
    }

    ensureFirebase();

    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1"
        });
    }
    if (!twilio) twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    if (!stripe) stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Helper to get session from Firestore
async function getSession(callSid) {
    const doc = await admin.firestore().collection('voice_sessions').doc(callSid).get();
    if (doc.exists) return doc.data();
    return {
        booking: { studio: null, date: null, time: null, duration: null, artistName: null, phoneNumber: null },
        history: [],
        metadata: { phone: null, city: null, state: null }
    };
}

async function saveSession(callSid, session) {
    await admin.firestore().collection('voice_sessions').doc(callSid).set(session);
}

// 1. Incoming Call Handler
const incomingCallHandler = async (req, res) => {
    console.log("VOICE_API: INCOMING_CALL_START");
    const callSid = req.body.CallSid;
    const phone = req.body.From;
    const city = req.body.CallerCity || "";
    const state = req.body.CallerState || "";

    try {
        initClients();

        // Initialize session in Firestore with metadata (ONLY on first call)
        if (req.query.retry !== 'true') {
            await saveSession(callSid, {
                booking: { studio: null, date: null, time: null, duration: null, artistName: null, phoneNumber: null },
                history: [],
                metadata: { phone, city, state }
            });
            console.log(`Session Initialized for CallSid: ${callSid} from ${city}, ${state}`);
        } else {
            console.log(`Session Resumed (Retry) for CallSid: ${callSid}`);
        }

        if (!Twilio) throw new Error("Twilio library failed to load");

        const twiml = new Twilio.twiml.VoiceResponse();

        let greeting = "Hello, thanks for calling Print Lab Studios. I'm Aria, the AI receptionist.";

        twiml.say({ voice: 'Polly.Amy-Neural' }, greeting);

        const gather = twiml.gather({
            input: 'speech',
            action: 'processSpeech',
            speechTimeout: 'auto',
            enhanced: true
        });

        gather.say("How can I help you book a session today? Can I start with your name?");

        // If silence
        twiml.redirect('handleSilence');

        res.type('text/xml');
        res.send(twiml.toString());
        console.log("VOICE_API: INCOMING_CALL_SUCCESS");
    } catch (error) {
        console.error("VOICE_API_CRASH:", error);
        res.status(500).send("Aria is currently offline. Please call back later.");
    }
};

// 2. Process Speech Handler
const processSpeechHandler = (req, res) => {
    console.log("ProcessSpeech: Hit");
    try {
        initClients();
    } catch (e) {
        console.error("Init Error", e);
        res.status(500).send("Init Error");
        return;
    }

    (async () => {
        console.log("ProcessSpeech: Starting...");
        const twiml = new Twilio.twiml.VoiceResponse();
        const userSpeech = req.body.SpeechResult;
        const callSid = req.body.CallSid;

        console.log("User Speech:", userSpeech);

        if (!userSpeech) {
            console.log("ProcessSpeech: No Speech Result. Redirecting to handleSilence.");
            twiml.redirect('handleSilence');
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        // Get Persistent Session from Firestore
        const session = await getSession(callSid);
        console.log("DEBUG: SESSION_LOADED:", JSON.stringify(session.booking));

        try {
            console.log("ProcessSpeech: Generating AI response...");

            const systemPrompt = `
                You are Aria, the friendly and sophisticated receptionist for Print Lab Studios.
                - Your tone is smooth, alluring, and professional. You are helpful but have a hint of sophisticated charm.
                - Studio A is $75/hr. Studio B is $65/hr.
                - We need: Artist Name, Phone Number, Studio choice (A or B), Date, Time, and Duration (total hours).
                
                METADATA:
                - Caller Phone: ${session.metadata.phone || 'Unknown'}

                RULES:
                1. EXTRACT DATA: If the Artist gives any booking info (name, phone, studio, etc.), YOU MUST put it in the "booking" JSON.
                2. Use "BOOKING STATE" to see what you ALREADY KNOW. 
                3. NEVER return null for a field in the "booking" JSON if that value is already present in "BOOKING STATE" or if the Artist just provided it.
                4. Keep Date and Time SEPARATE.
                5. IMPORTANT: DO NOT say goodbye or end the conversation until ALL details are collected. 
                6. If you have ALL details, then and only then, tell the artist you've sent the link and say goodbye.
                
                BOOKING STATE (Current Knowledge):
                ${JSON.stringify(session.booking)}
                
                HISTORY:
                ${session.history.slice(-6).map(h => `${h.role === 'user' ? 'Artist' : 'Aria'}: ${h.content}`).join('\n')}
                Artist: ${userSpeech}

                JSON FORMAT (STRICT):
                {
                    "response": "Acknowledge what they said (including any corrections), then ask for the NEXT missing thing. Be warm!",
                    "booking": {
                        "artistName": "Updated name or null",
                        "phoneNumber": "Updated phone or null",
                        "studio": "Studio A", "Studio B", or null,
                        "date": "e.g. Tomorrow or null",
                        "time": "e.g. 4 PM or null",
                        "duration": "Integer number of hours or null"
                    }
                }
            `;

            const modelName = "llama-3.1-70b-versatile";
            console.log(`AI_MODEL_USE: ${modelName} `);
            const completion = await openai.chat.completions.create({
                model: modelName,
                response_format: { type: "json_object" },
                messages: [{ role: "system", content: systemPrompt }]
            });

            const rawContent = completion.choices[0].message.content;
            console.log("DEBUG AI RAW:", rawContent);

            let aiResponseText = "";
            let bookingUpdate = null;

            try {
                const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                aiResponseText = parsed.response;
                bookingUpdate = parsed.booking;

                // Update Session State (ROBUST MERGE)
                if (bookingUpdate) {
                    ['artistName', 'phoneNumber', 'studio', 'date', 'time', 'duration'].forEach(key => {
                        const val = bookingUpdate[key];
                        // Only update if AI provided a non-null, non-empty value
                        // AND we don't already have it (to prevent AI halluncination overwrites)
                        if (val !== null && val !== undefined && val !== "" && val !== "null") {
                            session.booking[key] = val;
                        }
                    });
                }

                // Track History
                session.history.push({ role: "user", content: userSpeech });
                session.history.push({ role: "assistant", content: aiResponseText });

                // Save to Firestore
                await saveSession(callSid, session);
                console.log("DEBUG: SESSION_SAVED:", JSON.stringify(session.booking));

            } catch (e) {
                console.error("JSON Parse Error", e);
                aiResponseText = rawContent;
            }

            // We will decide how to speak the response based on whether we are complete

            // 3. Check if booking is complete
            const fullBooking = session.booking;
            console.log("CHECK_BOOKING_STATE:", JSON.stringify(fullBooking));

            if (fullBooking.studio && fullBooking.date && fullBooking.time && fullBooking.duration && fullBooking.artistName && fullBooking.phoneNumber) {
                const studio = fullBooking.studio;
                const date = fullBooking.date;
                const time = fullBooking.time;
                const duration = parseInt(fullBooking.duration) || 2;
                const artistName = fullBooking.artistName;
                const phoneNumber = fullBooking.phoneNumber;

                let rate = 75;
                if (studio.toLowerCase().includes('b')) rate = 65;

                const totalCost = rate * duration;
                const depositAmount = totalCost / 2;

                console.log(`BOOKING_COMPLETE: Finalizing for ${artistName} (${phoneNumber}). Studio: ${studio}, Details: ${date} @ ${time} for ${duration} hrs. Total: $${totalCost}, Deposit: $${depositAmount}`);

                try {
                    const firestore = admin.firestore();
                    const newBookingRef = await firestore.collection('bookings').add({
                        artistName,
                        studio,
                        date,
                        time,
                        duration,
                        totalCost,
                        depositAmount,
                        status: 'pending_payment',
                        createdAt: new Date(), // Safe alternative to Timestamp constructors
                        userPhone: phoneNumber || session.metadata.phone || req.body.From
                    });

                    const link = await createStripeLink(depositAmount * 100, `Half Deposit for ${studio}`, newBookingRef.id);

                    if (link) {
                        await sendSmsLink(req.body.From, link);
                        console.log(`Deposit link sent for Booking ${newBookingRef.id}`);
                    }

                    // Final confirmation has already been spoken if the AI was smart, 
                    // but we add a system backup or just let the AI response speak.
                    if (!aiResponseText.toLowerCase().includes("sent the link")) {
                        twiml.say({ voice: 'Polly.Amy-Neural' }, "Fantastic. I've sent that reservation link to your phone. See you then!");
                    } else {
                        twiml.say({ voice: 'Polly.Amy-Neural' }, aiResponseText);
                    }
                    twiml.hangup();
                } catch (dbError) {
                    console.error("Database Save Error:", dbError);
                    twiml.say({ voice: 'Polly.Amy-Neural' }, "I'm having a little trouble saving your booking right now. Please call back later.");
                    twiml.hangup();
                }
            } else {
                // Guardrail before speaking
                if (aiResponseText.toLowerCase().includes("goodbye") || aiResponseText.toLowerCase().includes("see you then")) {
                    const missing = [];
                    if (!session.booking.artistName) missing.push("name");
                    if (!session.booking.phoneNumber) missing.push("phone number");
                    if (!session.booking.studio) missing.push("studio");
                    if (!session.booking.date) missing.push("date");
                    if (!session.booking.time) missing.push("time");
                    if (!session.booking.duration) missing.push("session duration");

                    if (missing.length > 0) {
                        console.log("GUARDRAIL: AI tried to say goodbye but fields are missing:", missing);
                        aiResponseText += `. I apologize, I still need your ${missing.join(' and ')} to finalize this.`;
                    }
                }

                const gather = twiml.gather({
                    input: 'speech',
                    action: 'processSpeech',
                    speechTimeout: 'auto',
                    enhanced: true
                });
                gather.say({ voice: 'Polly.Amy-Neural' }, aiResponseText);
                twiml.redirect('handleSilence');
            }

        } catch (error) {
            console.error("AI Error:", error);
            const gather = twiml.gather({
                input: 'speech',
                action: 'processSpeech',
                speechTimeout: 'auto',
                enhanced: true
            });
            gather.say({ voice: 'Polly.Amy-Neural' }, "I'm so sorry, dear, I hit a little snag. Could you please repeat that for me?");
            twiml.redirect('handleSilence');
        }

        res.type('text/xml');
        res.send(twiml.toString());
    })();
};

async function handleSilenceHandler(req, res) {
    console.log("VOICE_API: HANDLE_SILENCE");
    initClients();
    const twiml = new Twilio.twiml.VoiceResponse();

    twiml.say({ voice: 'Polly.Amy-Neural' }, "I'm sorry, I didn't hear anything. Are you still there?");

    // Redirect back to incoming call but with retry flag to avoid session reset
    twiml.redirect('incomingCall?retry=true');

    res.type('text/xml');
    res.send(twiml.toString());
}

exports.incomingCall = incomingCallHandler;
exports.processSpeech = processSpeechHandler;
exports.handleSilence = handleSilenceHandler;

async function sendSmsLink(to, link) {
    console.log(`SMS_SEND_ATTEMPT: To: ${to}, Link: ${link}`);
    try {
        const message = await twilio.messages.create({
            body: `Print Lab Studios: Complete your booking deposit here: ${link}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        console.log(`SMS_SEND_SUCCESS: SID: ${message.sid}, Status: ${message.status}`);
    } catch (e) {
        console.error("SMS_SEND_FAILURE:", e);
    }
}

async function createStripeLink(amountInCents = 5000, description = "Booking Deposit", bookingId = null) {
    initClients();

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: description,
                    },
                    unit_amount: amountInCents,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://thevaultstudios.com/success',
            cancel_url: 'https://thevaultstudios.com/cancel',
            metadata: {
                bookingId: bookingId
            }
        });
        console.log("STRIPE_LINK_GENERATED:", session.url);
        return session.url;
    } catch (error) {
        console.error("Stripe Session Creation Failed:", error);
        return null;
    }
}
