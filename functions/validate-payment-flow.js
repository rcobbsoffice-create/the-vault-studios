const http = require('http');

function runTests() {
    // Test 1: Confirm Booking Details
    const postData = JSON.stringify({
        'SpeechResult': 'Please confirm, I want to book Studio A for January 20th 2026 at 2pm for 2 hours. Details confirmed.',
        'From': '+15551234567'
    });

    const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log("Sending Booking Confirmation Test to http://localhost:8080/ ...");
    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

runTests();
