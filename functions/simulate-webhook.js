const fetch = require('node-fetch');

async function testWebhook() {
    const email = `test.user.${Date.now()}@example.com`;
    const payload = {
        type: 'checkout.session.completed',
        data: {
            object: {
                id: 'cs_test_1234567890',
                object: 'checkout.session',
                amount_total: 5000,
                customer_details: {
                    email: email,
                    name: 'Test Automatic User',
                    phone: '+15550001234'
                },
                metadata: {
                    // bookingId: "optional-booking-id"
                }
            }
        }
    };

    console.log(`Sending Webhook for ${email}...`);

    try {
        const response = await fetch('http://localhost:5003', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        const text = await response.text();
        console.log("Response Status:", response.status);
        console.log("Response Body:", text);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testWebhook();
