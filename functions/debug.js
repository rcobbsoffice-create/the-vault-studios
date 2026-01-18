

require('dotenv').config();
try {
    console.log("Attempting to require voice-agent...");
    const agent = require('./voice-agent');
    console.log("Success! Exported keys:", Object.keys(agent));
} catch (e) {
    console.error("CRITICAL IMPORT ERROR:", e.message);
    console.error(e.stack);
}
