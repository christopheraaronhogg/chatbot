# .gitattributes

```
# Auto detect text files and perform LF normalization
* text=auto

```

# .gitignore

```
.env
node_modules/
*.log
config.js
secrets.json
```

# all-code.js

```js
const fs = require('fs').promises;
const path = require('path');

async function packageCodebase(rootDir, outputFile) {
  let content = '';

  // Patterns for files and directories to ignore
  const ignorePatterns = [
    '.env',
    '.git',
    'node_modules',
    'package-lock.json',
    '.DS_Store',
    '*.log',
    '*.tmp',
    '*.temp',
    '*.swp',
    '*.swo',
    'thumbs.db',
    '.vscode',
    '.idea',
    '*.png',
    '*.ico'
  ];

  function shouldIgnore(filePath) {
    const basename = path.basename(filePath);
    return ignorePatterns.some(pattern => {
      if (pattern.startsWith('*')) {
        return basename.endsWith(pattern.slice(1));
      }
      return basename === pattern || filePath.includes(`/${pattern}/`);
    });
  }

  async function processDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(rootDir, fullPath);

      // Exclude the output file itself and ignored patterns
      if (relativePath === path.basename(outputFile) || shouldIgnore(fullPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else {
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        const fileExtension = path.extname(entry.name).slice(1);
        
        content += `# ${relativePath}\n\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\`\n\n`;
      }
    }
  }

  await processDirectory(rootDir);
  await fs.writeFile(outputFile, content);
  console.log(`Codebase packaged into ${outputFile}`);
}

// Use the current directory as root and 'all-code.md' as the output file
const rootDirectory = process.cwd();
const outputFilePath = path.join(rootDirectory, 'all-code.md');

packageCodebase(rootDirectory, outputFilePath).catch(console.error);
```

# package.json

```json
{
  "name": "chatbot",
  "version": "1.0.0",
  "description": "Project Generator Chatbot is an AI-powered tool that helps developers quickly scaffold new projects. By leveraging natural language processing, it can understand user requirements and generate a basic project structure, complete with necessary files and configurations.",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.7.2",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "path": "^0.12.7"
  }
}

```

# public\index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Generator Chatbot</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://kit.fontawesome.com/0b3c182226.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
    <link rel="icon" href="code-maker.ico" type="image/x-icon">

</head>
<body>
    <header>
        
        <h1><img src="code-maker.png" height="180px"></h1>
        
    </header>
    <main>
        <section id="mode-toggle-container">
            <div id="toggles-wrapper">
                <div class="toggle-container">
                    <span class="toggle-label"><i class="fas fa-bolt"></i> Quick</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="mode-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label"><i class="fas fa-brain"></i> Smart</span>
                </div>
                <div class="toggle-container">
                    <span class="toggle-label"><i class="fas fa-sun"></i> Light</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="theme-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label"><i class="fas fa-moon"></i> Dark</span>
                </div>
            </div>
        </section>

        <section id="chat-section">
            <div id="chat-header">
                <h2>Conversation</h2>
                <button id="advanced-options-toggle">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
            <div id="advanced-options">
                <h3>Advanced Options</h3>
                <div id="context-control">
                    <div class="option-group">
                        <input type="checkbox" id="limit-context-checkbox">
                        <label for="limit-context-checkbox">Limit context</label>
                    </div>
                    <div class="option-group">
                        <label for="context-depth">Context Depth:</label>
                        <input type="number" id="context-depth" min="1" value="5" disabled>
                        <span>back-and-forth messages</span>
                    </div>
                </div>
                <div id="api-keys-section">
                    <h4>API Keys</h4>
                    <div class="api-key-input">
                        <label for="openai-api-key">OpenAI API Key:</label>
                        <div class="input-with-icon">
                            <input type="password" id="openai-api-key" placeholder="Enter OpenAI API Key">
                            <i class="fas fa-eye toggle-password"></i>
                        </div>
                    </div>
                    <div class="api-key-input">
                        <label for="anthropic-api-key">Anthropic API Key:</label>
                        <div class="input-with-icon">
                            <input type="password" id="anthropic-api-key" placeholder="Enter Anthropic API Key">
                            <i class="fas fa-eye toggle-password"></i>
                        </div>
                    </div>
                    <button id="save-api-keys" class="btn-primary">Save API Keys</button>
                </div>
            </div>
            
            <div id="chat-container"></div>
            <textarea id="user-input" placeholder="Type your message here..."></textarea>
            <button id="send-button"><i class="fas fa-paper-plane"></i></button>
            
            
        </section>

        <section id="generate-container" style="display: none;">
            <h3>Generate:</h3>
            <div id="generate-buttons">
                <button id="html-button" class="generate-btn"><i class="fab fa-html5"></i> HTML</button>
                <button id="css-button" class="generate-btn"><i class="fab fa-css3-alt"></i> CSS</button>
                <button id="js-button" class="generate-btn"><i class="fab fa-js-square"></i> JS</button>
                <button id="readme-button" class="generate-btn"><i class="fas fa-file-alt"></i> README</button>
                <button id="implementation-button" class="generate-btn"><i class="fas fa-cogs"></i> How-To</button>
            </div>
        </section>

        <button id="question-button" style="display: none;"><i class="fas fa-question-circle"></i> Ask Question</button>
        <label for="file-upload" class="file-upload-label" style="display: none;">
            <i class="fas fa-cloud-upload-alt"></i> Add Files
        </label>

        <section id="file-upload-section">
            <div id="file-upload-container">
                <input type="file" id="file-upload" multiple>
                <button id="upload-button"><i class="fas fa-upload"></i> Upload</button>
            </div>
        </section>

        <section id="uploaded-files-container" style="display: none;">
            <h3>Uploaded Files:</h3>
            <div id="file-list"></div>
        </section>

        <section id="files-to-add-container" style="display: none;">
            <h3>Files to be added with next message:</h3>
            <ul id="files-to-add-list"></ul>
        </section>
    </main>

    <div id="loading-spinner" class="loading-spinner" style="display: none;">
        <div class="spinner"></div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/html.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

# public\script.js

```js
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

// Function to auto-resize the input
function autoResize() {
    this.style.height = 'auto'; // Reset height to auto to calculate the new height
    const newHeight = Math.min(this.scrollHeight, 150); // Set height to the scroll height, capped at 150px
    this.style.height = newHeight + 'px'; // Apply the new height
}

// Attach event listener to the input
userInput.addEventListener('input', autoResize);

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

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (e.shiftKey) {
            // Shift+Enter: add a line break
            e.preventDefault();
            const cursorPosition = userInput.selectionStart;
            const currentValue = userInput.value;
            userInput.value = currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition);
            userInput.selectionStart = userInput.selectionEnd = cursorPosition + 1;
            autoResize();
        } else {
            // Enter without Shift: send the message
            e.preventDefault();
            handleSend();
        }
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

userInput.addEventListener('input', autoResize);
userInput.addEventListener('focus', autoResize);
```

# public\styles.css

```css
:root {
    /* Colors */
    --background-color: #f0f4f8;
    --text-color: #333;
    --heading-color: #1d1d1d;
    --primary-color: #4dabf7;
    --primary-hover-color: #339af0;
    --secondary-color: #ff7e5f;
    --secondary-hover-color: #e4532f;
    --tertiary-color: #9b59b6;
    --tertiary-hover-color: #8e44ad;
    --success-color: #4CAF50;
    --danger-color: #e74c3c;
    --light-gray: #f1f3f5;
    --medium-gray: #e9ecef;
    --dark-gray: #34495e;
    --darker-gray: #2c3e50;
    --true-white: #f8f9fa;
    --true-black: #000;

    /* Chat specific colors */
    --chat-background: var(--true-white);
    --chat-header-background: var(--light-gray);
    --chat-header-text: var(--text-color);
    --chat-message-background: var(--light-gray);
    --chat-message-text: var(--text-color);

    /* Gradients */
    --gradient-primary: linear-gradient(to right, #ff7e5f, #feb47b);
    --gradient-secondary: linear-gradient(to right, #74c0fc, #339af0);

    /* Fonts */
    --font-primary: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --font-code: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;

    /* Sizes */
    --max-width: 1000px;
    --border-radius: 12px;
    --border-radius-small: 8px;
    --border-radius-large: 20px;

    /* Shadows */
    --shadow-small: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    --shadow-large: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* General Styles */
body {
    background-color: var(--background-color);
    color: var(--text-color);
    font-family: var(--font-primary);
    margin: 0;
    padding: 0;
    line-height: 1.6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

main {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    max-width: var(--max-width);
    margin: 0 auto;
    width: 100%;
    padding: 20px;
    padding-bottom: 80px; /* Make room for the input and button */
    box-sizing: border-box;
}

h1, #chat-header h2 {
    color: var(--heading-color);
    text-align: center;
    font-weight: 300;
}

h1 {
    margin-bottom: 30px;
    font-size: 2.5em;
}

/* Chat Container */
#chat-section {
    background-color: var(--chat-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-small);
    margin-bottom: 20px;
    overflow: hidden;
    position: relative;
    transition: height 0.3s ease;
    flex-grow:1;
    display:flex;
    flex-direction:column;
    overflow: hidden;
}

#chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: var(--chat-header-background);
    color: var(--chat-header-text);
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
}

#chat-header h2 {
    margin: 0;
    font-size: 1.2em;
}

#advanced-options-toggle, #advanced-options h3 {
    background: none;
    border: none;
    color: var(--chat-header-text);
    cursor: pointer;
    font-size: 1.2em;
    padding: 5px;
}

#chat-container {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 20px;
    padding:18px;
}

.message {
    border-radius: 18px;
    margin-bottom: 20px;
    max-width: 80%;
    padding: 12px 16px;
    font-size: 0.95em;
    line-height: 1.4;
    position: relative;
}

.user-message {
    background-color: var(--primary-color);
    color: var(--true-white);
    margin-left: auto;
}

.bot-message {
    color: var(--chat-message-text);
    background-color: var(--chat-message-background);
    border-radius: 21px;
    position: relative;
    z-index: 0;
}

.bot-message::before, .bot-message::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 24px;
    z-index: -1;
}

.bot-message::before {
    background: var(--gradient-primary);
}

.bot-message::after {
    background: var(--chat-message-background);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 21px;
}

.bot-message.smart-response::before {
    background: var(--gradient-secondary);
}

/* Input and Buttons */
#input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--chat-background);
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

#user-input {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 40px);
    max-width: var(--max-width);
    border: 2px solid #e0e0e0;
    border-radius: var(--border-radius-small);
    font-size: 16px;
    min-height: 50px;
    max-height: 150px;
    overflow-y: auto;
    padding: 12px 16px;
    padding-right: 50px; /* Make room for the send button */
    resize: none;
    transition: all 0.3s ease;
    background-color: var(--chat-background);
    box-shadow: var(--shadow-small);
    box-sizing: border-box;
}
#user-input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
}

button {
    background-color: var(--primary-color);
    border: none;
    border-radius: var(--border-radius-large);
    color: var(--true-white);
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin: 5px;
    padding: 10px 20px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    font-size: 0.9em;
    box-shadow: none;
}

button:hover, .generate-btn:hover, .file-upload-label:hover {
    background-color: var(--primary-hover-color);
    transform: translateY(-2px);
}
#send-button {
    position: fixed;
    right: calc((100% - var(--max-width)) / 2 + 10px);
    bottom: 30px;
    background-color: var(--primary-color);
    color: var(--true-white);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
}

#send-button:hover {
    background-color: var(--primary-hover-color);
    transform: scale(1.1);
}

#send-button i {
    font-size: 18px;
}

/* Generate Container */
#generate-container {
    background-color: var(--dark-gray);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-large);
    margin-top: 20px;
    padding: 15px;
}

#generate-container h3 {
    color: var(--true-white);
    font-size: 1.3em;
    margin: 0 0 15px 0;
    padding-left: 10px;
    font-weight: 400;
}

#generate-buttons {
    background-color: var(--darker-gray);
    border-radius: var(--border-radius-small);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
}

.generate-btn {
    background-color: var(--primary-color);
    border: none;
    color: var(--true-white);
    cursor: pointer;
    flex: 1;
    font-size: 14px;
    min-width: 80px;
    padding: 10px 14px;
    transition: all 0.3s ease;
    border-radius: var(--border-radius-large);
}

/* Code Blocks */
pre, .code-block, .code-block-container {
    background-color: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: var(--border-radius-small);
    font-family: var(--font-code);
    font-size: 14px;
    line-height: 1.5;
    margin: 15px 0;
    overflow-x: auto;
    padding: 20px;
    position: relative;
}

.code-block-container {
    margin: 10px 0;
}

.code-block-container pre {
    margin: 0;
    padding: 10px 40px 10px 10px;
}

.code-block-container code, .code-block code {
    display: block;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.code-block {
    counter-reset: line;
    white-space: pre;
}

.code-block code {
    padding-left: 4em;
}

.code-block code::before {
    content: counter(line);
    counter-increment: line;
    position: absolute;
    left: 0;
    width: 3em;
    text-align: right;
    color: #606366;
    padding-right: 1em;
    border-right: 1px solid #404040;
}

.copy-button {
    background-color: var(--primary-color);
    border: none;
    border-radius: 4px;
    color: var(--true-white);
    cursor: pointer;
    font-size: 12px;
    padding: 6px 12px;
    position: absolute;
    right: 10px;
    top: 10px;
    transition: background-color 0.3s;
    opacity: 0.8;
}

.copy-button:hover {
    background-color: var(--primary-hover-color);
    opacity: 1;
}

/* Toggle Switch */
.toggle-container {
    display: flex;
    align-items: center;
    background-color: #f8f9fa;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-small);
    padding: 10px 15px;
}

.toggle-switch {
    display: inline-block;
    height: 28px;
    position: relative;
    width: 50px;
}

.toggle-switch input {
    height: 0;
    opacity: 0;
    width: 0;
}

.toggle-slider {
    background: var(--gradient-primary);
    border-radius: 34px;
    bottom: 0;
    cursor: pointer;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: .4s;
}

.toggle-slider:before {
    background-color: var(--true-white);
    border-radius: 50%;
    bottom: 3px;
    content: "";
    height: 22px;
    left: 3px;
    position: absolute;
    transition: .4s;
    width: 22px;
}

input:checked + .toggle-slider {
    background: var(--gradient-secondary);
}

input:checked + .toggle-slider:before {
    transform: translateX(22px);
}

.toggle-label {
    color: var(--dark-gray);
    font-weight: 600;
    margin: 0 10px;
}

#mode-label {
    color: var(--primary-color);
    font-weight: 600;
    margin-left: 10px;
}

/* File Upload */
#file-upload-container {
    align-items: center;
    display: flex;
    margin: 20px 0;
}

#file-upload {
    display: none;
}

.file-upload-label {
    background-color: var(--primary-color);
    border-radius: 30px;
    color: var(--true-white);
    cursor: pointer;
    display: inline-block;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-right: 10px;
    padding: 7px 18px;
    text-transform: uppercase;
    transition: all 0.3s ease;
}

#upload-button {
    background-color: var(--tertiary-color);
    display: none;
}

#upload-button:hover {
    background-color: var(--tertiary-hover-color);
}

/* File List */
#uploaded-files-container, #files-to-add-container {
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: var(--border-radius-small);
    margin-top: 20px;
    padding: 15px;
}

#file-list, #files-to-add-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

#file-list div, #files-to-add-list li {
    align-items: center;
    background-color: #e9ecef;
    border-radius: 6px;
    display: flex;
    padding: 8px 12px;
    font-size: 0.9em;
}

#file-list button, .remove-file-to-add {
    align-items: center;
    display: flex;
    font-size: 14px;
    height: 30px;
    justify-content: center;
    line-height: 1;
    margin: 0 4px;
    min-width: 30px;
    padding: 5px 10px;
    border-radius: 4px;
}

.remove-file, .remove-file-button, .remove-file-to-add {
    background-color: var(--danger-color);
}

.add-file {
    background-color: var(--success-color);
}

/* Question Button */
#question-button {
    background-color: var(--secondary-color);
    margin-top: 20px;
}

#question-button:hover {
    background-color: var(--secondary-hover-color);
}

/* Loading Spinner */
.loading-spinner {
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    height: 100px;
    justify-content: center;
    left: 50%;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    z-index: 9999;
    box-shadow: var(--shadow-large);
}

.spinner {
    animation: spin 1s linear infinite;
    border: 6px solid #f3f3f3;
    border-radius: 50%;
    border-top: 6px solid var(--primary-color);
    height: 60px;
    width: 60px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Miscellaneous */
.toggle-label img {
    height: 20px;
    margin-right: 5px;
    width: 20px;
}

.fas {
    font-size: 18px;
    margin-right: 5px;
}

.file-item.selected {
    background-color: #d9edf7;
    border-left: 5px solid #5bc0de;
}

#context-control {
    display: flex;
    align-items: center;
    gap: 20px;
}

#context-control > div, .context-toggle-container, .context-depth-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.context-depth-container {
    opacity: 1;
    transition: opacity 0.3s ease;
}

.context-depth-container.active {
    opacity: 1;
}

#context-depth {
    width: 60px;
    padding: 5px;
    border: 1px solid var(--primary-color);
    border-radius: 4px;
    font-size: 14px;
    background-color: var(--chat-background);
    color: var(--text-color);
}

#context-depth:disabled {
    background-color: var(--light-gray);
    color: var(--text-color);
    opacity: 0.7;
}

.context-depth-label {
    font-size: 14px;
    color: var(--dark-gray);
}

#advanced-options {
    background-color: var(--chat-header-background);
    padding: 0 20px;
    border-top: 1px solid var(--medium-gray);
    transition: max-height 0.3s ease-out, opacity 0.3s ease-out, padding 0.3s ease-out;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
}

#advanced-options.show {
    max-height: 200px; /* Adjust this value as needed */
    opacity: 1;
    padding: 10px 20px;
    pointer-events: auto;
}

#advanced-options h3 {
    margin-top: 0;
    color: var(--heading-color);
    font-size: 1.2em;
    margin-bottom: 15px;
}

#advanced-options h4 {
    color: var(--heading-color);
    font-size: 1.1em;
    margin-top: 20px;
    margin-bottom: 10px;
}

.option-group {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.option-group label {
    margin-left: 10px;
}

.api-key-input {
    margin-bottom: 15px;
}

.api-key-input label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
}

.input-with-icon {
    position: relative;
}

.input-with-icon input {
    width: 90%;
    padding: 10px;
    padding-right: 35px;
    border: 1px solid var(--medium-gray);
    border-radius: var(--border-radius-small);
    font-size: 14px;
    transition: border-color 0.3s ease;
}

.input-with-icon input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
}

.input-with-icon .toggle-password {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: var(--dark-gray);
}

#save-api-keys {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: var(--border-radius-small);
    cursor: pointer;
    transition: background-color 0.3s ease;
}

#save-api-keys:hover {
    background-color: var(--primary-hover-color);
}

/* Highlight.js overrides */
.hljs {
    background: transparent;
    padding: 0;
}

#mode-toggle-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    position: relative;
    width: 100%;
}

#toggles-wrapper {
    display: flex;
    justify-content: center;
    gap: 20px;
}

/* Dark mode styles */
body.dark-mode {
    --background-color: #1e1e1e;
    --text-color: #f0f0f0;
    --heading-color: #ffffff;
    --light-gray: #3a3a3a;
    --medium-gray: #2d2d2d;
    --chat-background: var(--medium-gray);
    --chat-header-background: var(--light-gray);
    --chat-header-text: var(--true-white);
    --chat-message-background: var(--light-gray);
    --chat-message-text: var(--text-color);
}

body.dark-mode h1,
body.dark-mode #chat-header h2,
body.dark-mode #advanced-options h3,
body.dark-mode #generate-container h3 {
    color: var(--heading-color);
}

body.dark-mode #user-input {
    background-color: var(--light-gray);
    color: var(--text-color);
    border-color: #444;
}

body.dark-mode button,
body.dark-mode .generate-btn,
body.dark-mode .file-upload-label {
    background-color: var(--primary-color);
    color: var(--true-white);
}

body.dark-mode button:hover,
body.dark-mode .generate-btn:hover,
body.dark-mode .file-upload-label:hover {
    background-color: var(--primary-hover-color);
}

body.dark-mode #generate-container {
    background-color: var(--medium-gray);
}

body.dark-mode #generate-buttons {
    background-color: var(--dark-gray);
}

body.dark-mode pre,
body.dark-mode .code-block,
body.dark-mode .code-block-container {
    background-color: var(--dark-gray);
    color: #d4d4d4;
    border-color: var(--light-gray);
}

body.dark-mode .code-block code::before {
    color: #808080;
    border-right-color: var(--light-gray);
}

body.dark-mode .toggle-container {
    background-color: var(--medium-gray);
    box-shadow: 0 1px 3px rgba(255, 255, 255, 0.1), 0 1px 2px rgba(255, 255, 255, 0.14);
}

body.dark-mode .toggle-label,
body.dark-mode #upload-button,
body.dark-mode .remove-file,
body.dark-mode .remove-file-button,
body.dark-mode .remove-file-to-add,
body.dark-mode .add-file {
    color: var(--true-white);
}

body.dark-mode #advanced-options {
    border-top-color: var(--light-gray);
}

body.dark-mode .loading-spinner {
    background-color: rgba(30, 30, 30, 0.9);
}

body.dark-mode .spinner {
    border-color: #333;
    border-top-color: var(--primary-color);
}

body.dark-mode #uploaded-files-container,
body.dark-mode #files-to-add-container {
    background-color: var(--medium-gray);
    border-color: var(--light-gray);
}

body.dark-mode #file-list div,
body.dark-mode #files-to-add-list li {
    background-color: var(--dark-gray);
    color: var(--text-color);
}

body.dark-mode .file-item.selected {
    background-color: #2c3e50;
    border-left-color: #3498db;
}

@media (max-width: var(--max-width)) {
    #user-input {
        width: calc(100% - 20px);
    }

    #send-button {
        right: 20px;
    }
}

/* Adjust other sections to fit within the main content area */
#mode-toggle-container,
#generate-container,
#question-button,
.file-upload-label,
#file-upload-section,
#uploaded-files-container,
#files-to-add-container {
    max-width: calc(var(--max-width) - 40px);
    margin-left: auto;
    margin-right: auto;
    width: 100%;
}
```

# README.md

```md
# AI-Powered Project Generator Chatbot

## 🚀 Introduction
Welcome to the AI-Powered Project Generator Chatbot! This innovative tool is designed to revolutionize the way developers kickstart their projects. By harnessing the power of advanced language models, our chatbot understands your project requirements and instantly generates a tailored project structure, complete with boilerplate code and configurations.

## 🌟 Key Features
- 🗣️ **Natural Language Interface**: Describe your project ideas in plain English.
- 🧠 **Dual AI Integration**: Leverage both OpenAI's GPT and Anthropic's Claude models for diverse and powerful responses.
- 🛠️ **Multi-Language Support**: Generate projects for various programming languages and frameworks.
- 📁 **Custom Project Scaffolding**: Get a complete project structure based on your specifications.
- 🔄 **Interactive Refinement**: Iteratively improve and adjust your project setup through conversation.
- 📤 **Code Export**: Easily download or copy generated code snippets and project files.
- 🎨 **Sleek UI**: User-friendly interface with syntax highlighting and easy navigation.

## 🛠️ Technology Stack
- **Backend**: Node.js with Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **AI Integration**: OpenAI API, Anthropic API
- **Development Tools**: Git, npm

## 🚀 Quick Start
1. Clone the repository:
git clone https://github.com/christopheraaronhogg/chatbot.git

2. Navigate to the project directory:
cd chatbot

3. Install dependencies:
npm install

4. Set up environment variables:
Create a `.env` file in the root directory with the following:

OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

5. Start the server:
npm start

6. Open your browser and visit `http://localhost:3003`

## 💡 How It Works
1. **Describe Your Project**: Use natural language to tell the chatbot about your project idea.
2. **AI Processing**: The chatbot processes your input using advanced language models.
3. **Generate Structure**: Receive a suggested project structure and boilerplate code.
4. **Refine and Iterate**: Engage in a conversation to refine the generated content.
5. **Export**: Download or copy the final code and project structure.

## 🤝 Contributing
We welcome contributions! If you have ideas for improvements or new features, please:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgements
- OpenAI for their GPT models
- Anthropic for the Claude AI model
- The open-source community for various libraries and tools used in this project

## 📞 Contact
Christopher Aaron Hogg - christopher.aaron.hogg@gmail.com

Project Link: https://github.com/christopheraaronhogg/chatbot

---

Get ready to supercharge your project initialization process with AI! 🚀✨
```

# server.js

```js
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
```

