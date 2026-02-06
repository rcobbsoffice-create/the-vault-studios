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
 * Callable function to create a Stripe Checkout Session for services.
 * Expects: { items: [{ id, name, price, quantity }] }
 */
exports.createServiceCheckout = functions.https.onCall(async (data, context) => {
    // Firebase v2 may wrap data differently, handle both cases
    const payload = data.data || data;
    const items = payload.items;
    const customerEmail = payload.customerEmail;
    
    console.log('createServiceCheckout received:', JSON.stringify(payload));
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        console.error('Invalid items:', items);
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing or invalid items array."
        );
    }

    try {
        ensureFirebase();
        const stripeClient = initStripe();

        // Build line items for Stripe Checkout
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.type === 'website' ? 'Website Design Service' : 'Press Release Service',
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity || 1,
        }));

        // Calculate total for metadata
        const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

        console.log(`Creating Checkout Session for ${items.length} items, total: $${total}`);

        // Create Stripe Checkout Session
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/services?checkout=success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/services?checkout=cancelled`,
            customer_email: customerEmail || (context.auth ? undefined : undefined),
            metadata: {
                userId: context.auth ? context.auth.uid : 'guest',
                itemIds: items.map(i => i.id).join(','),
                type: 'service_purchase'
            },
        });

        console.log(`Checkout Session created: ${session.id}`);

        return {
            url: session.url,
            sessionId: session.id
        };

    } catch (error) {
        console.error("Error creating Checkout Session:", error);
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
            const metadata = session.metadata || {};
            const customerDetails = session.customer_details;
            const email = customerDetails?.email;
            const name = customerDetails?.name;
            const phone = customerDetails?.phone;

            console.log(`Webhook: checkout.session.completed [${session.id}] - Type: ${metadata.type}`);

            // HANDLE SERVICE PURCHASE
            if (metadata.type === 'service_purchase') {
                const userId = metadata.userId;
                const itemIds = metadata.itemIds ? metadata.itemIds.split(',') : [];
                
                console.log(`Processing Service Purchase for ${userId}: ${itemIds.join(', ')}`);

                // Create Order record
                const orderData = {
                    userId,
                    items: itemIds,
                    amount: session.amount_total / 100,
                    currency: session.currency,
                    status: 'paid',
                    stripeSessionId: session.id,
                    customerEmail: email,
                    customerName: name,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                };

                await admin.firestore().collection('orders').add(orderData);

                // Send Confirmation Email
                if (email && process.env.RESEND_API_KEY) {
                    await getResend().emails.send({
                        from: DEFAULT_FROM,
                        to: [email],
                        subject: "Order Confirmation - Print Audio Lab",
                        html: `
                            <h1>Thank you for your order, ${name || 'Client'}!</h1>
                            <p>We've received your payment of $${(session.amount_total / 100).toFixed(2)} for our services.</p>
                            <p>Your order is now being processed. Our team will reach out shortly for next steps.</p>
                            <p><strong>Order ID:</strong> ${session.id}</p>
                        `
                    });
                }
            }

            // HANDLE BOOKING DEPOSIT (via Checkout)
            const bookingId = metadata.bookingId;
            if (bookingId || metadata.type === 'deposit') {
                console.log(`Processing Booking Deposit [Checkout]: ${bookingId}`);
                await handleBookingSuccess(bookingId, session, { email, name, phone });
            }
        }

        if (event.type === 'payment_intent.succeeded') {
            const pi = event.data.object;
            const metadata = pi.metadata || {};
            
            console.log(`Webhook: payment_intent.succeeded [${pi.id}] - Type: ${metadata.type}`);

            if (metadata.type === 'deposit' && metadata.bookingId) {
                console.log(`Processing Booking Deposit [PaymentIntent]: ${metadata.bookingId}`);
                // For PaymentIntents from our modal, email/name might not be in customer_details of PI objects directly
                // but we can look them up or use the booking data
                await handleBookingSuccess(metadata.bookingId, pi, {});
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

/**
 * Helper to handle successful booking payments
 */
async function handleBookingSuccess(bookingId, stripeObject, customerInfo) {
    const { getResend, DEFAULT_FROM } = require('./email');
    const email = customerInfo.email || stripeObject.receipt_email;
    const name = customerInfo.name;
    const phone = customerInfo.phone;

    if (bookingId) {
        console.log(`Updating Booking ${bookingId} to CONFIRMED`);
        await admin.firestore().collection('bookings').doc(bookingId).update({
            status: 'Confirmed',
            paymentStatus: 'paid',
            stripePaymentId: stripeObject.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    if (email) {
        try {
            await admin.auth().getUserByEmail(email);
        } catch (userError) {
            if (userError.code === 'auth/user-not-found') {
                const padding = Math.random().toString(36).slice(-8);
                const tempPassword = `Vault${padding}!`;

                const newUser = await admin.auth().createUser({
                    email: email,
                    emailVerified: true,
                    password: tempPassword,
                    displayName: name || 'Valued Client',
                });

                await admin.firestore().collection('users').doc(newUser.uid).set({
                    email: email,
                    name: name || 'Valued Client',
                    phone: phone || '',
                    role: 'ARTIST',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    source: 'stripe_payment',
                    stripeCustomerId: stripeObject.customer
                });

                if (process.env.RESEND_API_KEY) {
                    await getResend().emails.send({
                        from: DEFAULT_FROM,
                        to: [email],
                        subject: "Welcome to Print Audio Lab",
                        html: `
                            <h1>Welcome, ${name || 'Client'}!</h1>
                            <p>Thank you for your payment.</p>
                            <p>Your account has been created so you can manage your recordings and sessions.</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                            <p>Please log in at <a href="${process.env.FRONTEND_URL}/login">Print Audio Lab</a> and change your password.</p>
                        `
                    });
                }
            }
        }
    }
}
