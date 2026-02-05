const functions = require("firebase-functions");

// Lazy load Resend
let resend;
function getResend() {
    if (!resend) {
        require('dotenv').config();
        const { Resend } = require('resend');
        const apiKey = process.env.RESEND_API_KEY;
        
        console.log("DEBUG: Initializing Resend");
        console.log(`DEBUG: API Key: ${apiKey ? 'Set (' + apiKey.substring(0, 8) + '...)' : 'UNDEFINED'}`);
        
        resend = new Resend(apiKey);
    }
    return resend;
}

// Default sender - update this to your verified domain
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "Print Audio Lab <onboarding@resend.dev>";

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

    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn("RESEND_API_KEY not set. Simulating email send.");
            return { success: true, message: "Simulated email sent (API key missing)" };
        }

        const { data: emailData, error } = await getResend().emails.send({
            from: DEFAULT_FROM,
            to: Array.isArray(to) ? to : [to],
            subject,
            html: html || undefined,
            text: text || undefined,
        });

        if (error) {
            console.error("Resend error:", error);
            throw new functions.https.HttpsError("internal", "Failed to send email.", error);
        }

        console.log("Email sent:", emailData.id);
        return { success: true, messageId: emailData.id };
    } catch (error) {
        console.error("Error sending email:", error);
        throw new functions.https.HttpsError("internal", "Failed to send email.", error);
    }
});

// Dev-only wrapper for functions-framework (bypassing auth context)
exports.sendEmailDev = functions.https.onRequest(async (req, res) => {
    const cors = require('cors')({ origin: true });

    cors(req, res, async () => {
        try {
            const data = req.body;
            const { to, subject, html, text } = data;

            console.log("Dev Email Request:", { to, subject });

            if (!to || !subject || (!html && !text)) {
                res.status(400).send({ error: "Missing fields" });
                return;
            }

            if (!process.env.RESEND_API_KEY) {
                console.warn("RESEND_API_KEY not set. Simulating email send.");
                res.send({ success: true, message: "Simulated email sent (API key missing)" });
                return;
            }

            const { data: emailData, error } = await getResend().emails.send({
                from: DEFAULT_FROM,
                to: Array.isArray(to) ? to : [to],
                subject,
                html: html || undefined,
                text: text || undefined,
            });

            if (error) {
                console.error("Resend error:", error);
                res.status(500).send({ error: error.message });
                return;
            }

            console.log("Email sent:", emailData.id);
            res.send({ success: true, messageId: emailData.id });

        } catch (error) {
            console.error("Error sending email:", error);
            res.status(500).send({ error: error.message });
        }
    });
});

// Export helper for use in other modules
exports.getResend = getResend;
exports.DEFAULT_FROM = DEFAULT_FROM;
