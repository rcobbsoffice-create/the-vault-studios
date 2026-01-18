
try {
    const functions = require('firebase-functions');
    console.log("SUCCESS: firebase-functions loaded", typeof functions);

    const admin = require('firebase-admin');
    console.log("SUCCESS: firebase-admin loaded", typeof admin);

    require('dotenv').config();
    console.log("SUCCESS: dotenv loaded");

} catch (e) {
    console.error("FAILURE: Dependency missing or corrupt:", e.message);
}
