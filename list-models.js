const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const apiKey = "AIzaSyA-BJcZHBckk8_QmRMG-WXY2rY36xo9_6s";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; // Hack to get instance access if needed, strict method is listModels on older sdk?
        // Actually the SDK exposes listModels via GoogleGenerativeAI instance? 
        // Wait, typical usage:
        // const model = genAI.getGenerativeModel(...)
        // There isn't a direct listModels on the client in some versions.

        // Let's try raw fetch for list models to be sure, avoiding SDK version issues
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
