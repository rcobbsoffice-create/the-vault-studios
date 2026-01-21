const functions = require("firebase-functions");
const express = require('express');
const cors = require('cors')({ origin: true });
const app = express();

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log(`EXPRESS_REQ: ${req.method} ${req.originalUrl}`);
    console.log(`EXPRESS_BODY:`, JSON.stringify(req.body));
    next();
});

console.log("!!! INDEX.JS LOADED -------------------------------- !!!");

// Health Check
app.get('/health', (req, res) => res.send("Voice API is Healthy. Ready for Twilio!"));

// Import and re-export voice functions via Express
const { incomingCall, processSpeech, handleSilence } = require('./voice');
app.all('/incomingCall', (req, res) => incomingCall(req, res));
app.all('/processSpeech', (req, res) => processSpeech(req, res));
app.all('/handleSilence', (req, res) => handleSilence(req, res));

// Catch-all for debugging paths
app.use((req, res) => {
    console.log(`EXPRESS_NOT_FOUND: ${req.method} ${req.originalUrl}`);
    res.status(404).send("Path not handled by AI Receptionist");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("EXPRESS ERROR:", err);
    res.status(500).send("Internal Server Error");
});

// Unified Voice Agent Endpoint
exports.voiceApi = functions.https.onRequest(app);

// Simple test endpoint
exports.test = functions.https.onRequest((req, res) => {
    res.send("Hello from Firebase!");
});

// Import and re-export email functions
const { sendEmail, sendEmailDev } = require('./email');
exports.sendEmail = sendEmail;
exports.sendEmailDev = sendEmailDev;

// Import and re-export Stripe functions
const { createPaymentIntent, stripeWebhook } = require('./stripe');
exports.createPaymentIntent = createPaymentIntent;
exports.stripeWebhook = stripeWebhook;
