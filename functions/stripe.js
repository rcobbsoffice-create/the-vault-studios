const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require('path');

// Lazy clients
let stripe;

function initStripe() {
    if (!stripe) {
        require('dotenv').config({ path: path.resolve(__dirname, '.env') });
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
}

function ensureFirebase() {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
}

/**
 * Callable function to create a Stripe PaymentIntent.
 * Expects: { bookingId }
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only authenticated users can initiate payments."
        );
    }

    const { bookingId } = data;
    if (!bookingId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing bookingId."
        );
    }

    try {
        ensureFirebase();
        const stripeClient = initStripe();

        const bookingSnap = await admin.firestore().collection('bookings').doc(bookingId).get();
        if (!bookingSnap.exists) {
            throw new functions.https.HttpsError("not-found", "Booking not found.");
        }

        const booking = bookingSnap.data();
        const amount = booking.depositAmount || (booking.totalCost / 2);

        if (!amount || amount <= 0) {
            throw new functions.https.HttpsError("internal", "Invalid booking amount.");
        }

        console.log(`Creating PaymentIntent for Booking ${bookingId}: $${amount}`);

        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                bookingId: bookingId,
                userId: context.auth.uid,
                type: 'deposit'
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            amount: amount
        };

    } catch (error) {
        console.error("Error creating PaymentIntent:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

/**
 * Stripe Webhook Handler
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        ensureFirebase();
        const stripeClient = initStripe();
        const { getResend, DEFAULT_FROM } = require('./email');

        let event;
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripeClient.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } else {
            event = req.body;
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const customerDetails = session.customer_details;
            const email = customerDetails.email;
            const name = customerDetails.name;
            const phone = customerDetails.phone;

            if (email) {
                console.log(`Processing New User from Stripe: ${email}`);

                const bookingId = session.metadata ? session.metadata.bookingId : null;
                if (bookingId) {
                    console.log(`Updating Booking ${bookingId} to CONFIRMED`);
                    await admin.firestore().collection('bookings').doc(bookingId).update({
                        status: 'confirmed',
                        paymentStatus: 'paid',
                        remainingBalance: session.amount_total,
                        stripeSessionId: session.id,
                        customerEmail: email,
                        customerName: name
                    });
                }

                try {
                    await admin.auth().getUserByEmail(email);
                    console.log("User already exists.");
                } catch (userError) {
                    if (userError.code === 'auth/user-not-found') {
                        const padding = Math.random().toString(36).slice(-8);
                        const tempPassword = `Vault${padding}!`;

                        try {
                            const newUser = await admin.auth().createUser({
                                email: email,
                                emailVerified: true,
                                password: tempPassword,
                                displayName: name || 'Valued Client',
                                disabled: false,
                            });

                            await admin.firestore().collection('users').doc(newUser.uid).set({
                                email: email,
                                name: name || 'Valued Client',
                                phone: phone || '',
                                role: 'client',
                                createdAt: new Date(),
                                source: 'stripe_deposit',
                                stripeCustomerId: session.customer
                            });

                            // Send welcome email via Resend
                            if (process.env.RESEND_API_KEY) {
                                await getResend().emails.send({
                                    from: DEFAULT_FROM,
                                    to: [email],
                                    subject: "Welcome to Print Audio Lab",
                                    html: `
                                        <h1>Welcome, ${name || 'Client'}!</h1>
                                        <p>Thank you for your deposit.</p>
                                        <p>Your account has been created.</p>
                                        <p><strong>Email:</strong> ${email}</p>
                                        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                                        <p>Please log in and change your password.</p>
                                    `
                                });
                                console.log("New User Created and Email Sent via Resend");
                            } else {
                                console.warn("RESEND_API_KEY not set. Skipping welcome email.");
                            }
                        } catch (createError) {
                            if (createError.code && createError.code.startsWith('app/')) {
                                console.warn(`DEV MODE: Ignoring Admin SDK Error: ${createError.message}`);
                            } else {
                                throw createError;
                            }
                        }
                    } else if (userError.code && userError.code.startsWith('app/')) {
                        console.warn(`DEV MODE: Ignoring Admin SDK Error: ${userError.message}`);
                    } else {
                        throw userError;
                    }
                }
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});
