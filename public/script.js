const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const htmlButton = document.getElementById('html-button');
const cssButton = document.getElementById('css-button');
const jsButton = document.getElementById('js-button');
const readmeButton = document.getElementById('readme-button');
const questionButton = document.getElementById('question-button');
const implementationButton = document.getElementById('implementation-button');
const modeToggle = document.getElementById('mode-toggle');
const fileUpload = document.getElementById('file-upload');
const uploadButton = document.getElementById('upload-button');
const uploadedFilesContainer = document.getElementById('uploaded-files-container');
const fileList = document.getElementById('file-list');
const loadingSpinner = document.getElementById('loading-spinner');

let conversation = [];
let currentHtml = '';
let currentCss = '';
let currentJs = '';
let currentReadme = '';
let projectContext = '';
let uploadedFiles = [];
let selectedFiles = [];

let sessionInputTokens = 0;
let sessionOutputTokens = 0;
let sessionCost = 0;

const COST_PER_1K_TOKENS = {
    'gpt-4o-mini': {
        input: 0.00015,  // Example cost for GPT-4 Mini input tokens
        output: 0.00060  // Example cost for GPT-4 Mini output tokens
    },
    'claude-3-5-sonnet': {
        input: 0.003,  // Example cost for Claude 3.5 Sonnet input tokens
        output: 0.015  // Example cost for Claude 3.5 Sonnet output tokens
    }
};

function updateCost(model, inputTokens, outputTokens) {
    sessionInputTokens += inputTokens;
    sessionOutputTokens += outputTokens;
    
    const inputCost = (inputTokens / 1000) * COST_PER_1K_TOKENS[model].input;
    const outputCost = (outputTokens / 1000) * COST_PER_1K_TOKENS[model].output;
    
    sessionCost += inputCost + outputCost;
    
    // Update a hidden element with the cost and token counts
    const costElement = document.getElementById('session-cost');
    costElement.textContent = `Session Cost: $${sessionCost.toFixed(4)} (${sessionInputTokens} input tokens, ${sessionOutputTokens} output tokens)`;
}

function cleanCodeBlock(code, language) {
    code = code.replace(new RegExp(`\`\`\`${language}\\s*\\n?|^\`\`\`|\\s*\`\`\`$`, 'g'), '');
    code = code.trim();
    return code;
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');

    content = content.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, language, code) => {
        code = cleanCodeBlock(code, language);
        return `
        <div class="code-block-container">
        <pre class="code-block"><code>${escapeHtml(code)}</code></pre>
        <button class="copy-button" data-code="${encodeURIComponent(code)}">Copy</button>
        </div>
        `;
    });

    messageDiv.innerHTML = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    messageDiv.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', handleCopyClick);
    });

    conversation.push({
        role: isUser ? 'user' : 'assistant',
        content: content
    });

    projectContext += `${isUser ? 'User' : 'Assistant'}: ${content}\n`;
}

function handleCopyClick(e) {
    const code = decodeURIComponent(e.target.getAttribute('data-code'));
    navigator.clipboard.writeText(code).then(() => {
        const originalText = e.target.textContent;
        e.target.textContent = 'Copied!';
        setTimeout(() => {
            e.target.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getCurrentModel() {
    return modeToggle.checked ? 'claude-3-5-sonnet' : 'gpt-4o-mini';
}

async function generateContent(prompt) {
    const model = getCurrentModel();
    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model, prompt }),
        });
        const data = await response.json();
        console.log('API Response:', data);
        if (data.content) {
            return data.content;
        } else if (data.error) {
            console.error('API Error:', data.error);
            return `Error: ${data.error}`;
        } else {
            console.error('Unexpected API response format:', data);
            return 'Error: Unexpected response format from the API.';
        }
    } catch (error) {
        console.error('Error generating content:', error);
        return 'Error generating content. Please check the console for more details.';
    }
}

async function handleSend() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
        userInput.value = '';
        loadingSpinner.style.display = 'flex';
        
        // Include selected files in the prompt
        let prompt = `${projectContext}\n\nHuman: ${userMessage}\n\nSelected Files: ${selectedFiles.join(', ')}\n\nAssistant: Please provide your response. If you include any code snippets, always wrap them in triple backticks (\`\`\`) for proper formatting.`;

        try {
            const response = await generateContent(prompt);
            addMessage(response);
            
            // Estimate tokens (this is still a rough estimate)
            const estimatedInputTokens = prompt.length / 4;
            const estimatedOutputTokens = response.length / 4;
            updateCost(getCurrentModel(), estimatedInputTokens, estimatedOutputTokens);
        } catch (error) {
            console.error('Error:', error);
            addMessage('An error occurred while generating the response. Please try again.');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }
}

async function handleHtml() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Project context:\n${projectContext}\n\nCurrent HTML:\n${currentHtml}\n\nUser input: ${userMessage}\n\nPlease update or generate HTML based on the project context, current HTML, and user input. If starting fresh, create a complete HTML structure for the project described. Return only the HTML code without any explanation, comments, or markdown formatting. Do not include any text outside the HTML code.`;
    loadingSpinner.style.display = 'flex';
    try {
        let newHtml = await generateContent(prompt);
        newHtml = cleanCodeBlock(newHtml, 'html');
        newHtml = newHtml.replace(/<!--[\s\S]*?-->/g, '');
        newHtml = newHtml.replace(/^([\s\S]*?html)?\s*<!DOCTYPE html>/i, '<!DOCTYPE html>');
        currentHtml = newHtml;
        addMessage("Updated HTML:");
        addMessage("```html\n" + currentHtml + "\n```");
        
        // Estimate tokens and update cost
        const estimatedInputTokens = prompt.length / 4;
        const estimatedOutputTokens = newHtml.length / 4;
        updateCost(getCurrentModel(), estimatedInputTokens, estimatedOutputTokens);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

async function handleCss() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Project context:\n${projectContext}\n\nCurrent CSS:\n${currentCss}\n\nUser input: ${userMessage}\n\nPlease update or generate CSS based on the project context, current CSS, and user input. If starting fresh, create complete styles for the project described. Return only the CSS code without any explanation, comments, or markdown formatting. Do not include any text outside the CSS code.`;
    loadingSpinner.style.display = 'flex';
    try {
        let newCss = await generateContent(prompt);
        newCss = cleanCodeBlock(newCss, 'css');
        newCss = newCss.replace(/\/\*[\s\S]*?\*\//g, '');
        newCss = newCss.replace(/\/\/.*/g, '');
        currentCss = newCss;
        addMessage("Updated CSS:");
        addMessage("```css\n" + currentCss + "\n```");
        
        // Estimate tokens and update cost
        const estimatedInputTokens = prompt.length / 4;
        const estimatedOutputTokens = newCss.length / 4;
        updateCost(getCurrentModel(), estimatedInputTokens, estimatedOutputTokens);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

async function handleJs() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Project context:\n${projectContext}\n\nCurrent JavaScript:\n${currentJs}\n\nUser input: ${userMessage}\n\nPlease update or generate JavaScript based on the project context, current JavaScript, and user input. If starting fresh, create complete functionality for the project described. Ensure all necessary functions and event listeners are included. Return only the JavaScript code without any explanation, comments, or markdown formatting. Do not include any text outside the JavaScript code.`;
    loadingSpinner.style.display = 'flex';
    try {
        let newJs = await generateContent(prompt);
        newJs = cleanCodeBlock(newJs, 'javascript');
        newJs = newJs.replace(/\/\*[\s\S]*?\*\//g, '');
        newJs = newJs.replace(/\/\/.*/g, '');
        currentJs = newJs;
        addMessage("Updated JavaScript:");
        addMessage("```javascript\n" + currentJs + "\n```");
        
        // Estimate tokens and update cost
        const estimatedInputTokens = prompt.length / 4;
        const estimatedOutputTokens = newJs.length / 4;
        updateCost(getCurrentModel(), estimatedInputTokens, estimatedOutputTokens);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

async function handleReadme() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Project context:\n${projectContext}\n\nCurrent HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nCurrent JavaScript:\n${currentJs}\n\nUser input: ${userMessage}\n\nPlease generate a README.md file for this project. Include sections such as project description, installation instructions, usage, features, and any other relevant information. Format the content in Markdown. Return only the README content without any additional explanation or formatting.`;
    loadingSpinner.style.display = 'flex';
    try {
        let newReadme = await generateContent(prompt);
        newReadme = cleanCodeBlock(newReadme, 'markdown');
        currentReadme = newReadme;
        addMessage("Generated README.md:");
        addMessage("```markdown\n" + currentReadme + "\n```");
        
        // Estimate tokens and update cost
        const estimatedInputTokens = prompt.length / 4;
        const estimatedOutputTokens = newReadme.length / 4;
        updateCost(getCurrentModel(), estimatedInputTokens, estimatedOutputTokens);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

async function handleQuestion() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Based on the following project context and user input, generate a relevant clarifying question about the project:

Project context:
${projectContext}

User input:
${userMessage}

Clarifying question:`;
    loadingSpinner.style.display = 'flex';
    try {
        const question = await generateContent(prompt);
        addMessage(question);
        
        // Estimate tokens and update cost
        const estimatedInputTokens = prompt.length / 4;
        const estimatedOutputTokens = question.length / 4;
        updateCost(getCurrentModel(), estimatedInputTokens, estimatedOutputTokens);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

async function handleImplementationAdvice() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Based on the following project context, generated code, and user input, provide advice on how to implement and run this project. Include information about whether a local server is needed, any necessary setup steps, and how to view or interact with the project. If there are multiple files, explain how they should be organized and linked.

Project context:
${projectContext}

Current HTML:
${currentHtml}

Current CSS:
${currentCss}

Current JavaScript:
${currentJs}

User input:
${userMessage}
Implementation advice:`;

    loadingSpinner.style.display = 'flex';
    try {
        const advice = await generateContent(prompt);
        addMessage("Implementation Advice:");
        addMessage(advice);
        
        // Estimate tokens and update cost
        const estimatedInputTokens = prompt.length / 4;
        const estimatedOutputTokens = advice.length / 4;
        updateCost(getCurrentModel(), estimatedInputTokens, estimatedOutputTokens);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

sendButton.addEventListener('click', handleSend);
htmlButton.addEventListener('click', handleHtml);
cssButton.addEventListener('click', handleCss);
jsButton.addEventListener('click', handleJs);
readmeButton.addEventListener('click', handleReadme);
questionButton.addEventListener('click', handleQuestion);
implementationButton.addEventListener('click', handleImplementationAdvice);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSend();
    }
});

modeToggle.addEventListener('change', () => {
    const mode = modeToggle.checked ? 'Smart' : 'Quick';
    addMessage(`Switched to ${mode} mode (${getCurrentModel()})`, false);
});

uploadButton.addEventListener('click', function() {
    document.getElementById('file-upload').click();
});

document.getElementById('file-upload').addEventListener('change', function(event) {
    const files = event.target.files;
    if (files.length > 0) {
        handleFileUpload(files);
    }
});

function handleFileUpload(files) {
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileObject = {
                name: files[i].name,
                content: e.target.result
            };
            uploadedFiles.push(fileObject);

            // Create a visual representation of the file in the chat
            const fileElement = document.createElement('div');
            fileElement.classList.add('file-object');
            fileElement.innerHTML = `
                <div class="file-header">
                    <span class="file-name">${files[i].name}</span>
                    <button class="edit-file-button">Edit</button>
                    <button class="add-to-chat-button">+</button>
                </div>
                <div class="file-edit-area" style="display: none;">
                    <textarea class="file-edit-textarea"></textarea>
                    <button class="save-file-button">Save</button>
                </div>
            `;

            const editButton = fileElement.querySelector('.edit-file-button');
            const addToChatButton = fileElement.querySelector('.add-to-chat-button');
            const editArea = fileElement.querySelector('.file-edit-area');
            const textArea = fileElement.querySelector('.file-edit-textarea');
            const saveButton = fileElement.querySelector('.save-file-button');

            editButton.onclick = () => {
                // Toggle edit area visibility
                if (editArea.style.display === 'none') {
                    editArea.style.display = 'block';
                    textArea.value = fileObject.content;
                    editButton.textContent = 'Close';
                } else {
                    editArea.style.display = 'none';
                    editButton.textContent = 'Edit';
                }
            };

            saveButton.onclick = () => {
                fileObject.content = textArea.value;
                addMessage(`File "${files[i].name}" has been updated.`, true);
            };

            addToChatButton.onclick = () => {
                if (!selectedFiles.includes(files[i].name)) {
                    selectedFiles.push(files[i].name);
                    addMessage(`File added to chat: ${files[i].name}`, true);
                    addToChatButton.textContent = '✓';
                } else {
                    selectedFiles = selectedFiles.filter(file => file !== files[i].name);
                    addMessage(`File removed from chat: ${files[i].name}`, true);
                    addToChatButton.textContent = '+';
                }
            };

            fileList.appendChild(fileElement);

            if (i === files.length - 1) {
                uploadedFilesContainer.style.display = 'block';
                addMessage(`${files.length} file(s) uploaded successfully.`, false);
                addFilesToContext();
            }
        };
        reader.readAsText(files[i]);
    }
}

function addFilesToContext() {
    if (uploadedFiles.length > 0) {
        let filesContext = "Uploaded Files:\n";
        uploadedFiles.forEach(file => {
            filesContext += `\nFile: ${file.name}\nContent:\n${file.content}\n`;
        });
        projectContext += filesContext;
    }
}

document.getElementById('cost-info-button').addEventListener('click', function() {
    alert('This is an estimated cost based on the number of tokens processed. ' +
          'Actual costs may vary. The cost is calculated using the following rates:\n\n' +
          `GPT-4 Mini:\n` +
          `  Input: $${COST_PER_1K_TOKENS['gpt-4o-mini'].input} per 1K tokens\n` +
          `  Output: $${COST_PER_1K_TOKENS['gpt-4o-mini'].output} per 1K tokens\n\n` +
          `Claude 3.5 Sonnet:\n` +
          `  Input: $${COST_PER_1K_TOKENS['claude-3-5-sonnet'].input} per 1K tokens\n` +
          `  Output: $${COST_PER_1K_TOKENS['claude-3-5-sonnet'].output} per 1K tokens\n\n` +
          `Current Session:\n` +
          `  Input Tokens: ${sessionInputTokens}\n` +
          `  Output Tokens: ${sessionOutputTokens}\n` +
          `  Total Cost: $${sessionCost.toFixed(4)}`);
});

addMessage("Hello! I'm here to help you with your project. What would you like to do?");