require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const tiktoken = require("tiktoken");
const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const port = process.env.PORT || 3003;

app.use(bodyParser.json());
app.use(express.static("public"));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Function to count tokens for OpenAI
function countTokensOpenAI(text) {
    const encoder = tiktoken.encoding_for_model("gpt-4");
    return encoder.encode(text).length;
}

// Function to estimate tokens for Anthropic (simple word-based estimation)
function estimateTokensAnthropic(text) {
    return text.split(/\s+/).length;
}

app.post("/generate", async (req, res) => {
    const { model, prompt, openaiApiKey, anthropicApiKey } = req.body;

    console.log("Received request for model:", model);

    // Function to mask the API key
    const maskApiKey = (key) => {
        if (!key) return "Not provided";
        return key.slice(0, 4) + "..." + key.slice(-4);
    };

    try {
        let response;
        let inputTokens, outputTokens;

        if (model === "gpt-4o-mini") {
            console.log("Calling OpenAI API");
            const usedKey = openaiApiKey || OPENAI_API_KEY;
            console.log("Using OpenAI API Key:", maskApiKey(usedKey));
            console.log("Key source:", openaiApiKey ? "Custom" : "Environment");

            inputTokens = countTokensOpenAI(prompt);

            response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                },
                {
                    headers: {
                        Authorization: `Bearer ${usedKey}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            outputTokens = response.data.usage.completion_tokens;
            console.log("OpenAI API Response:", response.data);

            return res.json({
                content: response.data.choices[0].message.content,
                inputTokens: inputTokens,
                outputTokens: outputTokens,
            });
        } else if (model === "claude-3-5-sonnet") {
            console.log("Calling Anthropic API");
            const usedKey = anthropicApiKey || ANTHROPIC_API_KEY;
            console.log("Using Anthropic API Key:", maskApiKey(usedKey));
            console.log(
                "Key source:",
                anthropicApiKey ? "Custom" : "Environment",
            );

            inputTokens = estimateTokensAnthropic(prompt);

            response = await axios.post(
                "https://api.anthropic.com/v1/messages",
                {
                    model: "claude-3-5-sonnet-20240620",
                    max_tokens: 8192,
                    temperature: 0,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                },
                {
                    headers: {
                        "x-api-key": usedKey,
                        "anthropic-version": "2023-06-01",
                        "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15",
                        "Content-Type": "application/json",
                    },
                },
            );

            outputTokens = estimateTokensAnthropic(
                response.data.content[0].text,
            );
            console.log("Anthropic API Response:", response.data);

            return res.json({
                content: response.data.content[0].text,
                inputTokens: inputTokens,
                outputTokens: outputTokens,
            });
        } else {
            throw new Error(`Unsupported model: ${model}`);
        }
    } catch (error) {
        console.error("Detailed error:", error);
        if (error.response) {
            console.error("Error response:", error.response.data);
        }
        res.status(500).json({
            error: "An error occurred while generating content",
            details: error.message,
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const multer = require("multer");
const path = require("path");

// Configure multer for handling file uploads
const upload = multer({ dest: "uploads/" });

// Add this route to your server.js file
app.post("/upload", upload.array("files"), (req, res) => {
    try {
        const uploadedFiles = req.files.map((file) => {
            const fileContent = fs.readFileSync(file.path, "utf8");
            fs.unlinkSync(file.path); // Delete the temporary file
            return {
                name: file.originalname,
                content: fileContent,
            };
        });

        res.json({ success: true, files: uploadedFiles });
    } catch (error) {
        console.error("Error handling file upload:", error);
        res.status(500).json({
            success: false,
            error: "Error uploading files",
        });
    }
});

async function storeHtmlPreview(html) {
    try {
        const response = await fetch("/store-preview", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ html }),
        });
        const data = await response.json();
        if (data.success) {
            return data.previewId;
        } else {
            console.error("Failed to store HTML preview");
            return null;
        }
    } catch (error) {
        console.error("Error storing HTML preview:", error);
        return null;
    }
}
