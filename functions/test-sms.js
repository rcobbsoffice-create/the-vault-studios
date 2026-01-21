const { OpenAI } = require("openai");
const Twilio = require("twilio");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testSms() {
    console.log("Starting SMS Test...");
    const client = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

    const to = "+17575240053"; // The user's number from the log
    const link = "https://checkout.stripe.com/test-link";

    console.log(`Sending SMS to ${to} from ${process.env.TWILIO_PHONE_NUMBER}...`);

    try {
        const message = await client.messages.create({
            body: `TEST: Print Lab Studios Booking Link: ${link}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        console.log("SUCCESS: Message SID:", message.sid);
        console.log("Status:", message.status);
    } catch (error) {
        console.error("FAILURE:", error);
    }
}

testSms();
