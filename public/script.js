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
const limitContextCheckbox = document.getElementById('limit-context-checkbox');
const contextDepthInput = document.getElementById('context-depth');
const openaiApiKeyInput = document.getElementById('openai-api-key');
const anthropicApiKeyInput = document.getElementById('anthropic-api-key');
const saveApiKeysButton = document.getElementById('save-api-keys');
const advancedOptionsToggle = document.getElementById('advanced-options-toggle');
const advancedOptions = document.getElementById('advanced-options');
const openAIInputPricePerMillion = 0.15;
const openAIOutputPricePerMillion = 0.60;
const anthropicInputPricePerMillion = 3.00;
const anthropicOutputPricePerMillion = 15.00;


let sessionCost = 0;
let conversation = [];
let currentHtml = '';
let currentCss = '';
let currentJs = '';
let currentReadme = '';
let projectContext = '';
let uploadedFiles = [];
let selectedFiles = [];
let limitContext = false;
let contextDepth = 5;
let customOpenAIKey = '';
let customAnthropicKey = '';

saveApiKeysButton.addEventListener('click', () => {
    customOpenAIKey = openaiApiKeyInput.value.trim();
    customAnthropicKey = anthropicApiKeyInput.value.trim();
    
    if (customOpenAIKey || customAnthropicKey) {
        localStorage.setItem('customOpenAIKey', customOpenAIKey);
        localStorage.setItem('customAnthropicKey', customAnthropicKey);
        alert('API keys saved successfully!');
    } else {
        alert('Please enter at least one API key.');
    }
});

// Load saved API keys on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedOpenAIKey = localStorage.getItem('customOpenAIKey');
    const savedAnthropicKey = localStorage.getItem('customAnthropicKey');
    
    if (savedOpenAIKey) openaiApiKeyInput.value = savedOpenAIKey;
    if (savedAnthropicKey) anthropicApiKeyInput.value = savedAnthropicKey;
    
    customOpenAIKey = savedOpenAIKey || '';
    customAnthropicKey = savedAnthropicKey || '';
});

function autoResize() {
    // Store the current cursor position and scroll position
    const cursorPosition = this.selectionStart;
    const scrollTop = this.scrollTop;
    const viewportHeight = this.clientHeight;
    const wasAtBottom = (this.scrollHeight - this.scrollTop === viewportHeight);

    // Temporarily shrink the textarea to get the correct scrollHeight
    this.style.height = '0px';
    
    // Get the scrollHeight and add a small buffer
    const scrollHeight = this.scrollHeight + 2;
    
    // Set the new height, capped at 150px
    const newHeight = Math.min(scrollHeight, 150);
    this.style.height = newHeight + 'px';

    // Force a minimum height of two lines
    const lineHeight = parseInt(window.getComputedStyle(this).lineHeight);
    const minHeight = lineHeight * 2;
    if (newHeight < minHeight) {
        this.style.height = minHeight + 'px';
    }

    // Show scrollbar only if content exceeds max height
    this.style.overflowY = scrollHeight > 150 ? 'scroll' : 'hidden';

    // Restore the cursor position
    this.setSelectionRange(cursorPosition, cursorPosition);

    // Scroll handling
    if (wasAtBottom || cursorPosition === this.value.length) {
        // If we were at the bottom before resizing or the cursor is at the end,
        // scroll to the bottom
        this.scrollTop = this.scrollHeight;
    } else {
        // Calculate if the cursor is now out of view
        const cursorY = this.scrollHeight - this.scrollTop - viewportHeight;
        
        if (cursorY > 0 && cursorY < lineHeight) {
            // If the cursor is just out of view, scroll to make it visible
            this.scrollTop = this.scrollHeight - viewportHeight;
        } else {
            // Otherwise, maintain the previous scroll position
            this.scrollTop = scrollTop;
        }
    }
}






document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

advancedOptionsToggle.addEventListener('click', () => {
    if (advancedOptions.classList.contains('show')) {
        // Closing the options
        advancedOptions.style.maxHeight = advancedOptions.scrollHeight + 'px';
        advancedOptions.offsetHeight; // Force reflow
        advancedOptions.style.maxHeight = '0px';
        advancedOptions.classList.remove('show');
    } else {
        // Opening the options
        advancedOptions.classList.add('show');
        advancedOptions.style.maxHeight = advancedOptions.scrollHeight + 'px';
    }
});

// Listen for the end of the transition
advancedOptions.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'max-height') {
        if (!advancedOptions.classList.contains('show')) {
            advancedOptions.style.maxHeight = null;
        }
    }
});

function cleanCodeBlock(code, language) {
    console.log("Cleaning code block:", code); // Debug log
    code = code.replace(new RegExp(`\`\`\`${language}\\s*\\n?|^\`\`\`|\\s*\`\`\`$`, 'g'), '');
    code = code.trim();
    console.log("Cleaned code block:", code); // Debug log
    return code;
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');

    if (!isUser) {
        // Apply the appropriate gradient border based on the current mode
        if (modeToggle.checked) {
            messageDiv.classList.add('smart-response');
        } else {
            messageDiv.classList.add('quick-response');
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function detectLanguage(code) {
        if (code.includes('<!DOCTYPE html') || code.includes('<html')) return 'html';
        if (code.includes('body {') || code.includes('@media')) return 'css';
        if (code.includes('function') || code.includes('const') || code.includes('let') || code.includes('var')) return 'javascript';
        if (code.includes('def ') || code.includes('import ') || code.includes('class ')) return 'python';
        return 'plaintext';
    }

    function processCodeBlock(code, lang) {
        const escapedCode = escapeHtml(code);
        return `<div class="code-block-container"><pre><code class="language-${lang}">${escapedCode}</code></pre><button class="copy-button" data-code="${encodeURIComponent(code)}">Copy</button></div>`;
    }

    let processedContent = '';
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    if (isUser) {
        // For user messages, we'll do our original code detection
        const lines = content.split('\n');
        let isInCodeBlock = false;
        let currentCodeBlock = '';
        let currentLanguage = '';

        lines.forEach((line, index) => {
            if (line.trim().startsWith('```')) {
                if (isInCodeBlock) {
                    // End of code block
                    processedContent += processCodeBlock(currentCodeBlock, currentLanguage);
                    isInCodeBlock = false;
                    currentCodeBlock = '';
                    currentLanguage = '';
                } else {
                    // Start of code block
                    isInCodeBlock = true;
                    currentLanguage = line.trim().slice(3) || 'plaintext';
                }
            } else if (isInCodeBlock) {
                currentCodeBlock += line + '\n';
            } else if (lines.length > 10 && index === 0 && !line.startsWith('```')) {
                // Auto-detect large code blocks for user messages
                isInCodeBlock = true;
                currentLanguage = detectLanguage(content);
                currentCodeBlock += line + '\n';
            } else {
                processedContent += escapeHtml(line) + '<br>';
            }
        });

        // Handle any remaining code block
        if (currentCodeBlock) {
            processedContent += processCodeBlock(currentCodeBlock, currentLanguage || detectLanguage(currentCodeBlock));
        }
    } else {
        // For bot messages, we'll only process explicit code blocks
        while ((match = codeBlockRegex.exec(content)) !== null) {
            // Add text before the code block
            processedContent += escapeHtml(content.slice(lastIndex, match.index)).replace(/\n/g, '<br>');

            // Process the code block
            const lang = match[1] || 'plaintext';
            const code = match[2];
            processedContent += processCodeBlock(code, lang);

            lastIndex = codeBlockRegex.lastIndex;
        }

        // Add any remaining text after the last code block
        processedContent += escapeHtml(content.slice(lastIndex)).replace(/\n/g, '<br>');
    }

    console.log("Processed content:", processedContent); // Debug log

    messageDiv.innerHTML = processedContent;

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Apply syntax highlighting
    messageDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    messageDiv.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', handleCopyClick);
    });

    conversation.push({
        role: isUser ? 'user' : 'assistant',
        content: content
    });

    projectContext += `${isUser ? 'User' : 'Assistant'}: ${content}\n`;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function handleCopyClick(e) {
    const code = decodeURIComponent(e.target.getAttribute('data-code'))
                 .replace(/{{BACKTICK}}/g, '`');  // Replace placeholders with backticks
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
            body: JSON.stringify({ 
                model, 
                prompt,
                openaiApiKey: customOpenAIKey,
                anthropicApiKey: customAnthropicKey
            }),
        });
        const data = await response.json();
        console.log('API Response:', data);
        if (data.content) {
            // Calculate the cost based on the number of input and output tokens and the model used
            const inputCost = model === 'gpt-4o-mini' ? 
                (data.inputTokens / 1000000) * openAIInputPricePerMillion : 
                (data.inputTokens / 1000000) * anthropicInputPricePerMillion;
            
            const outputCost = model === 'gpt-4o-mini' ? 
                (data.outputTokens / 1000000) * openAIOutputPricePerMillion : 
                (data.outputTokens / 1000000) * anthropicOutputPricePerMillion;
            
            const totalCost = inputCost + outputCost;
            
            updateSessionCost(totalCost);
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


document.getElementById('cost-info-button').addEventListener('click', () => {
    alert('This is an estimated cost based on the number of tokens processed. Prices are calculated per million tokens. Actual costs may vary.');
});

function updateSessionCost(cost) {
    sessionCost += cost;
    const costContainer = document.getElementById('session-cost');
    costContainer.textContent = `Session Cost: $${sessionCost.toFixed(4)}`;
}

async function handleSend() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
        resetInputBox(); // Reset the input box after sending
        loadingSpinner.style.display = 'flex';

        let contextString;
        if (limitContext) {
            // Get the last N back-and-forth messages based on contextDepth
            const recentContext = conversation.slice(-contextDepth * 2);
            contextString = recentContext.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        } else {
            // Use the entire conversation
            contextString = conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        }

        let prompt = `${contextString}\n\nHuman: ${userMessage}\n\nSelected Files: ${selectedFiles.join(', ')}\n\nAssistant: Please provide your response. If you include any code snippets, always wrap them in triple backticks (\`\`\`) for proper formatting.`;

        try {
            const response = await generateContent(prompt);
            addMessage(response);
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
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function handleFileUpload(files) {
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileObject = {
                name: files[i].name,
                content: e.target.result
            };
            uploadedFiles.push(fileObject);

            const fileElement = document.createElement('div');
            fileElement.classList.add('file-object');
            fileElement.innerHTML = `
                <div class="file-header">
                    <span class="file-name">${escapeHtml(files[i].name)}</span>
                    <button class="edit-file-button">Edit</button>
                    <button class="add-to-chat-button">+</button>
                </div>
                <div class="file-edit-area" style="display: none;">
                    <textarea class="file-edit-textarea"></textarea>
                    <button class="save-file-button">Save</button>
                </div>
            `;

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
            filesContext += `\nFile: ${file.name}\nContent:\n\`\`\`\n${file.content}\n\`\`\`\n`;
        });
        projectContext += filesContext;
    }
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference or default to light mode
    if (localStorage.getItem('dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('dark-mode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('dark-mode', 'false');
        }
    });
}

sendButton.addEventListener('click', handleSend);
htmlButton.addEventListener('click', handleHtml);
cssButton.addEventListener('click', handleCss);
jsButton.addEventListener('click', handleJs);
readmeButton.addEventListener('click', handleReadme);
questionButton.addEventListener('click', handleQuestion);
implementationButton.addEventListener('click', handleImplementationAdvice);

// Attach event listeners to the input
userInput.addEventListener('input', autoResize);
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        if (e.shiftKey) {
            // Shift+Enter: add a line break
            e.preventDefault();
            const cursorPosition = this.selectionStart;
            const currentValue = this.value;
            this.value = currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition);
            this.selectionStart = this.selectionEnd = cursorPosition + 1;
            autoResize.call(this);
        } else {
            // Enter without Shift: send the message
            e.preventDefault();
            handleSend();
        }
    }
});

function resetInputBox() {
    userInput.value = '';
    userInput.style.height = 'auto';
    const lineHeight = parseInt(window.getComputedStyle(userInput).lineHeight);
    const minHeight = lineHeight * 2;
    userInput.style.height = minHeight + 'px';
    userInput.style.overflowY = 'hidden';
}


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

limitContextCheckbox.addEventListener('change', function() {
    limitContext = this.checked;
    contextDepthInput.disabled = !limitContext;
    console.log(`Context limiting ${limitContext ? 'enabled' : 'disabled'}`);
});

contextDepthInput.addEventListener('change', function() {
    contextDepth = parseInt(this.value);
    console.log(`Context depth set to ${contextDepth}`);
});

// Initialize the chat
addMessage("Hello! I'm here to help you with your project. What would you like to do?");

// Initialize theme toggle
document.addEventListener('DOMContentLoaded', initThemeToggle);

// Initialize highlight.js
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
});

toggleAdvancedOptionsBtn.addEventListener('click', () => {
    const isHidden = advancedOptionsContent.style.display === 'none';
    advancedOptionsContent.style.display = isHidden ? 'block' : 'none';
    toggleAdvancedOptionsBtn.textContent = isHidden ? 'Hide Advanced Options' : 'Show Advanced Options';
});

document.addEventListener('DOMContentLoaded', function() {
    const stickyToggles = document.getElementById('sticky-toggles');
    const stickyToggleHeight = stickyToggles.offsetHeight;
    document.body.style.paddingTop = stickyToggleHeight + 'px';
});

