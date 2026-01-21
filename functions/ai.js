const functions = require("firebase-functions");
const { OpenAI } = require("openai");
const express = require('express');
const cors = require('cors')({ origin: true });

const app = express();
app.use(cors);
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

app.post('/', async (req, res) => {
    const { prompt, mode, currentLyrics, context } = req.body;

    if (!prompt && mode !== 'continue') {
        return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    let systemPrompt = "You are a professional songwriter and lyricist. ";
    let userPrompt = "";

    switch (mode) {
        case 'verse':
            systemPrompt += "Generate a compelling 8-16 line verse based on the user's theme. Use rich imagery and rhythmic flow.";
            userPrompt = `Theme: ${prompt}\nContext: ${context || 'None'}`;
            break;
        case 'hook':
            systemPrompt += "Generate a catchy, repetitive, and memorable hook (chorus). Focus on the main message.";
            userPrompt = `Theme: ${prompt}\nContext: ${context || 'None'}`;
            break;
        case 'rhymes':
            systemPrompt += "Provide a list of creative rhymes for the given words. Include both perfect and slant rhymes.";
            userPrompt = `Words to rhyme: ${prompt}`;
            break;
        case 'continue':
            systemPrompt += "Continue the existing lyrics naturally. Maintain the same rhyme scheme, tone, and rhythm.";
            userPrompt = `Current Lyrics:\n${currentLyrics}\n\nContinue from here:`;
            break;
        default:
            systemPrompt += "Help the user with their songwriting task.";
            userPrompt = prompt;
    }

    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
        });

        const result = chatCompletion.choices[0].message.content;
        res.json({ success: true, result });
    } catch (error) {
        console.error("AI Writer Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.aiWriter = functions.https.onRequest(app);
