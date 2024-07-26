require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const port = 3003;

app.use(bodyParser.json());
app.use(express.static('public'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/generate', async (req, res) => {
    const { model, prompt, openaiApiKey, anthropicApiKey } = req.body;

    console.log('Received request for model:', model);

    // Function to mask the API key
    const maskApiKey = (key) => {
        if (!key) return 'Not provided';
        return key.slice(0, 4) + '...' + key.slice(-4);
    };

    try {
        let response;
        if (model === 'gpt-4o-mini') {
            console.log('Calling OpenAI API');
            const usedKey = openaiApiKey || OPENAI_API_KEY;
            console.log('Using OpenAI API Key:', maskApiKey(usedKey));
            console.log('Key source:', openaiApiKey ? 'Custom' : 'Environment');
            
            response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${usedKey}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('OpenAI API Response:', response.data);
            return res.json({ content: response.data.choices[0].message.content });
        } else if (model === 'claude-3-5-sonnet') {
            console.log('Calling Anthropic API');
            const usedKey = anthropicApiKey || ANTHROPIC_API_KEY;
            console.log('Using Anthropic API Key:', maskApiKey(usedKey));
            console.log('Key source:', anthropicApiKey ? 'Custom' : 'Environment');
            
            response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 8192,
                temperature: 0,
                messages: [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            }, {
                headers: {
                    'x-api-key': usedKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
                    'Content-Type': 'application/json'
                }
            });
            console.log('Anthropic API Response:', response.data);
            return res.json({ content: response.data.content[0].text });
        } else {
            throw new Error(`Unsupported model: ${model}`);
        }
    } catch (error) {
        console.error('Detailed error:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        res.status(500).json({ error: 'An error occurred while generating content', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});