const functions = require("firebase-functions");

// Lazy load nodemailer
let transporter;
function getTransporter() {
    if (!transporter) {
        require('dotenv').config();
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined;

        console.log("DEBUG: Initializing Transporter");
        console.log(`DEBUG: User: ${user ? user.substring(0, 3) + '***' : 'UNDEFINED'}`);
        console.log(`DEBUG: Pass: ${pass ? 'Set (' + pass.length + ' chars)' : 'UNDEFINED'}`);

        const nodemailer = require("nodemailer");
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: user || "demo@example.com",
                pass: pass || "demo-password",
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

// Export helper for use in other modules
exports.getTransporter = getTransporter;
