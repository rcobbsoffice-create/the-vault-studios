const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Lazy load these to avoid startup timeout
let OpenAI;
let Twilio;
let openai;
let twilio;
let cors;

require('dotenv').config();

function initClients() {
    if (!OpenAI) OpenAI = require("openai").OpenAI;
    if (!Twilio) Twilio = require("twilio");
    if (!cors) cors = require('cors')({ origin: true });

    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1"
        });
    }
    if (!twilio) twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

/**
 * 1. Incoming Call Webhook
 */
exports.incomingCall = functions.https.onRequest((req, res) => {
    initClients();
    const twiml = new Twilio.twiml.VoiceResponse();

    twiml.say({ voice: 'alice' }, "Hello, thanks for calling Print Lab Studios. I'm Aria, the AI receptionist.");

    const gather = twiml.gather({
        input: 'speech',
        action: '/processSpeech',
        speechTimeout: 'auto',
        enhanced: true
    });

    gather.say("How can I help you today?");
    twiml.say("I didn't hear anything. Please try calling back.");

    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * 2. Process Speech Webhook
 */
exports.processSpeech = functions.https.onRequest((req, res) => {
    console.log("ProcessSpeech: Hit");
    try {
        initClients();
        console.log("ProcessSpeech: Clients Initialized");
    } catch (e) {
        console.error("Init Error", e);
        res.status(500).send("Init Error");
        return;
    }

    cors(req, res, async () => {
        console.log("ProcessSpeech: CORS Passed");
        const twiml = new Twilio.twiml.VoiceResponse();
        const userSpeech = req.body.SpeechResult;
        console.log("User Speech:", userSpeech);

        if (!userSpeech) {
            console.log("No Speech");
            twiml.say("Sorry, I didn't catch that.");
            twiml.redirect('/incomingCall');
            res.type('text/xml');
            return res.send(twiml.toString());
        }

        try {
            console.log("ProcessSpeech: Generating AI response...");

            const systemPrompt = `
                You are Aria, the helpful and professional receptionist at Print Lab Studios.
                Your goal is to help clients book music recording sessions or answer questions.
                - Studio A is $75 / hr.Studio B is $65 / hr.
                - We require a 50 % deposit to confirm.
                - If they want to book, ask for Date, Time, and Duration.
                - If confirmed, tell them: "I'll send a payment link to your phone."
                Keep responses short(under 2 sentences) as they are spoken.
            `;

            const completion = await openai.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userSpeech }
                ]
            });

            const aiResponse = completion.choices[0].message.content;

            twiml.say({ voice: 'alice' }, aiResponse);

            if (aiResponse.toLowerCase().includes("payment link")) {
                const callerPhone = req.body.From;
                await sendSmsLink(callerPhone, "https://buy.stripe.com/demo-link");
                twiml.say("I've sent that link. Please check your messages.");
                twiml.hangup();
            } else {
                twiml.gather({
                    input: 'speech',
                    action: '/processSpeech',
                    speechTimeout: 'auto'
                });
            }

        } catch (error) {
            console.error("AI Error:", error);
            twiml.say("I'm having trouble connecting to the schedule. Please call back later.");
        }

        res.type('text/xml');
        res.send(twiml.toString());
    });
});

async function sendSmsLink(to, link) {
    // initClients() is called by caller
    try {
        await twilio.messages.create({
            body: `Print Lab Studios: Complete your booking deposit here: ${link} `,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
    } catch (e) {
        console.error("SMS Failed", e);
    }
}
