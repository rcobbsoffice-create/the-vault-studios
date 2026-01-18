
const agent = require('./voice-agent');
console.log("Exports:", Object.keys(agent));
console.log("incomingCall type:", typeof agent.incomingCall);
console.log("processSpeech type:", typeof agent.processSpeech);
