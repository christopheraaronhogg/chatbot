require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3003;

app.use(bodyParser.json());
app.use(express.static('public'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/generate', async (req, res) => {
    const { model, prompt } = req.body;

    console.log('Received request:', { model, prompt });

    try {
        let response;
        if (model === 'gpt-4o-mini') {
            console.log('Calling OpenAI API');
            response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('OpenAI API Response:', response.data);
            return res.json({ content: response.data.choices[0].message.content });
        } else if (model === 'claude-3-5-sonnet') {
            console.log('Calling Anthropic API');
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
                    'x-api-key': ANTHROPIC_API_KEY,
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