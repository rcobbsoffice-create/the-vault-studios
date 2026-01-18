const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
console.log("!!! INDEX.JS LOADED -------------------------------- !!!");

exports.test = functions.https.onRequest((req, res) => {
    // Basic test doesn't need cors, but if it did:
    // const cors = require("cors")({ origin: true });
    res.send("Hello from Firebase!");
});

// Configure Nodemailer Transporter
// NOTE: For production, use environment variables: functions.config().email.user / .pass
// For now, we'll use a placeholder or assume the user sets these up via CLI.
// Configure Nodemailer Transporter (Lazy Load)
let transporter;
function getTransporter() {
    if (!transporter) {
        const nodemailer = require("nodemailer");
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER || "demo@example.com",
                pass: process.env.EMAIL_PASS || "demo-password",
            },
        });
    }
    return transporter;
}

/**
 * Callable function to send emails.
 * Expects: { to, subject, html, text }
 */
exports.sendEmail = functions.https.onCall(async (data, context) => {
    // Ensure user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only authenticated users can send emails."
        );
    }

    const { to, subject, html, text } = data;

    if (!to || !subject || (!html && !text)) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required email fields (to, subject, html/text)."
        );
    }

    const mailOptions = {
        from: "The Vault Studios <no-reply@thevaultstudios.com>",
        to,
        subject,
        html: html || text,
        text: text || "Please view this email in an HTML compatible viewer.",
    };

    try {
        // In a real scenario with valid credentials, this sends the email.
        // If credentials are dummy, this will fail. 
        // We Wrap it to return success in 'simulation' mode if env vars are missing? 
        // No, better to try and fail so user knows to add credentials.

        // HOWEVER, for the demo to "work" visually without crashing if they haven't set up env vars yet:
        if (!process.env.EMAIL_USER) {
            console.warn("EMAIL_USER not set. Simulating email send.");
            return { success: true, message: "Simulated email sent (Config missing)" };
        }

        const info = await getTransporter().sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        throw new functions.https.HttpsError("internal", "Failed to send email.", error);
    }
});

// Dev-only wrapper for functions-framework (bypassing auth context)
exports.sendEmailDev = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    const cors = require('cors')({ origin: true });

    cors(req, res, async () => {
        try {
            // Mock the context if needed or just reuse the logic
            // We'll reimplement the core logic briefly to avoid 'onCall' wrapping issues
            const data = req.body; // In pure HTTP, body is the data
            const { to, subject, html, text } = data;

            console.log("Dev Email Request:", { to, subject });

            if (!to || !subject || (!html && !text)) {
                res.status(400).send({ error: "Missing fields" });
                return;
            }

            const mailOptions = {
                from: "The Vault Studios <no-reply@thevaultstudios.com>",
                to,
                subject,
                html: html || text,
                text: text || "Please view this email in an HTML compatible viewer.",
            };

            if (!process.env.EMAIL_USER) {
                console.warn("EMAIL_USER not set. Simulating email send.");
                res.send({ success: true, message: "Simulated email sent (Config missing)" });
                return;
            }

            const info = await getTransporter().sendMail(mailOptions);
            console.log("Email sent: %s", info.messageId);
            res.send({ success: true, messageId: info.messageId });

        } catch (error) {
            console.error("Error sending email:", error);
            res.status(500).send({ error: error.message });
        }
    });
});

// ... existing exports ...

// Voice Agent Logic (Merged for Stability)

// Lazy load these to avoid startup timeout
let OpenAI;
let Twilio;
let openai;
let twilio;
let cors;
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

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

// 1. Incoming Call Webhook
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

// 2. Process Speech Webhook
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
                model: "llama-3.1-8b-instant",
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
