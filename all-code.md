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
    '.idea'
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
</head>
<body>
    <header>
        <h1>Project Generator Chatbot</h1>
    </header>
    <main>
        <section id="mode-toggle-container">
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
        </section>

        <section id="chat-section">
            <div id="chat-container"></div>
            <div id="input-container">
                <textarea id="user-input" placeholder="Type your message here..."></textarea>
                <button id="send-button"><i class="fas fa-paper-plane"></i> Send</button>
            </div>
        </section>

        <section id="generate-container">
            <h3>Generate:</h3>
            <div id="generate-buttons">
                <button id="html-button" class="generate-btn"><i class="fab fa-html5"></i> HTML</button>
                <button id="css-button" class="generate-btn"><i class="fab fa-css3-alt"></i> CSS</button>
                <button id="js-button" class="generate-btn"><i class="fab fa-js-square"></i> JS</button>
                <button id="readme-button" class="generate-btn"><i class="fas fa-file-alt"></i> README</button>
                <button id="implementation-button" class="generate-btn"><i class="fas fa-cogs"></i> How-To</button>
            </div>
        </section>

        <button id="question-button"><i class="fas fa-question-circle"></i> Ask Question</button>
        <label for="file-upload" class="file-upload-label">
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

let conversation = [];
let currentHtml = '';
let currentCss = '';
let currentJs = '';
let currentReadme = '';
let projectContext = '';
let uploadedFiles = [];
let selectedFiles = [];

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
        let prompt = `${projectContext}\n\nHuman: ${userMessage}\n\nSelected Files: ${selectedFiles.join(', ')}\n\nAssistant: Please provide your response. If you include any code snippets, always wrap them in triple backticks (\`\`\`) for proper formatting.`;

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

            // ... rest of the function remains the same

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
```

# public\styles.css

```css
/* General Styles */
body {
    background-color: #f0f4f8;
    color: #333;
    font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0 auto;
    max-width: 1000px;
    padding: 20px;
    line-height: 1.6;
}

h1 {
    color: #818d99;
    margin-bottom: 30px;
    text-align: center;
    font-size: 2.5em;
    font-weight: 300;
}

/* Chat Container */
#chat-container {
    background-color: #fff;
    border: none;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    height: 500px;
    margin-bottom: 20px;
    overflow-y: auto;
    padding: 20px;
}

.message {
    border-radius: 18px;
    margin-bottom: 15px;
    max-width: 80%;
    padding: 12px 16px;
    font-size: 0.95em;
    line-height: 1.4;
    position: relative;
}

.user-message {
    background-color: #4dabf7;
    color: white;
    margin-left: auto;
}

.bot-message {
    color: #34495e;
    background-color: #f1f3f5;
    border-radius: 21px;
    position: relative;
    z-index: 0;
}

.bot-message::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(to right, #ff7e5f, #feb47b);
    border-radius: 24px;
    z-index: -1;
}

.bot-message::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f1f3f5;
    border-radius: 21px;
    z-index: -1;
}

.bot-message.smart-response::before {
    background: linear-gradient(to right, #74c0fc, #339af0);
}

/* Input and Buttons */
#input-container {
    align-items: center;
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

#user-input {
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    flex-grow: 1;
    font-size: 16px;
    min-height: 50px;
    padding: 12px 16px;
    resize: vertical;
    transition: all 0.3s ease;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

#user-input:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.25);
}

button {
    background-color: #4dabf7;
    border: none;
    border-radius: 20px;
    color: white;
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

button:hover {
    background-color: #339af0;
    transform: translateY(-2px);
}

#send-button:hover {
    background-color: #ff7e5f;
}

/* Generate Container */
#generate-container {
    background-color: #34495e;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    margin-top: 20px;
    padding: 15px;
}

#generate-container h3 {
    color: #ecf0f1;
    font-size: 1.3em;
    margin: 0 0 15px 0;
    padding-left: 10px;
    font-weight: 400;
}

#generate-buttons {
    background-color: #2c3e50;
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
}

.generate-btn {
    background-color: #4dabf7;
    border: none;
    color: white;
    cursor: pointer;
    flex: 1;
    font-size: 14px;
    min-width: 80px;
    padding: 10px 14px;
    transition: all 0.3s ease;
    border-radius: 20px;
}

.generate-btn:hover {
    background-color: #339af0;
    transform: translateY(-2px);
}

/* Code Blocks */
pre, .code-block {
    background-color: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    margin: 15px 0;
    overflow-x: auto;
    padding: 20px;
    position: relative;
}

.code-block-container {
    background-color: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin: 10px 0;
}

.code-block-container pre {
    margin: 0;
    padding: 10px;
    padding-right: 40px;
}

.code-block-container code {
    display: block;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.code-block {
    counter-reset: line;
    white-space: pre;
}

.code-block code {
    display: block;
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
    background-color: #4dabf7;
    border: none;
    border-radius: 4px;
    color: white;
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
    background-color: #339af0;
    opacity: 1;
}

/* Toggle Switch */
.toggle-container {
    align-items: center;
    background-color: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    padding: 15px;
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
    background: linear-gradient(to right, #ff7e5f, #feb47b);
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
    background-color: white;
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
    background: linear-gradient(to right, #74c0fc, #339af0);
}

input:checked + .toggle-slider:before {
    transform: translateX(22px);
}

.toggle-label {
    color: #34495e;
    font-weight: 600;
    margin: 0 10px;
}

#mode-label {
    color: #4dabf7;
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
    background-color: #4dabf7;
    border-radius: 30px;
    color: white;
    cursor: pointer;
    display: inline-block;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-right: 10px;
    padding: 7px 18px;
    text-transform: uppercase;
    transition: all 0.3s ease;
}

.file-upload-label:hover {
    background-color: #2c3e50;
    transform: translateY(-2px);
}

#upload-button {
    background-color: #9b59b6;
    display: none;
}

#upload-button:hover {
    background-color: #8e44ad;
}

/* File List */
#uploaded-files-container, #files-to-add-container {
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
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
    background-color: #e74c3c;
}

.add-file {
    background-color: #4CAF50;
}

/* Question Button */
#question-button {
    background-color: #ff7e5f;
    margin-top: 20px;
}

#question-button:hover {
    background-color: #e4532f;
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
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.spinner {
    animation: spin 1s linear infinite;
    border: 6px solid #f3f3f3;
    border-radius: 50%;
    border-top: 6px solid #4dabf7;
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

/* Dark mode styles */
body.dark-mode {
    background-color: #1e1e1e;
    color: #f0f0f0;
}

body.dark-mode #chat-container {
    background-color: #2d2d2d;
    box-shadow: 0 1px 3px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.14);
}

body.dark-mode .user-message {
    background-color: #1c7ed6;
}

body.dark-mode .bot-message {
    background-color: #3a3a3a;
    color: #f0f0f0;
}

body.dark-mode .bot-message::after {
    background-color: #3a3a3a;
}

body.dark-mode .bot-message::before {
    background: linear-gradient(to right, #ff7e5f, #feb47b);
}

body.dark-mode .bot-message.smart-response::before {
    background: linear-gradient(to right, #74c0fc, #339af0);
}

body.dark-mode #user-input {
    background-color: #2d2d2d;
    color: #f0f0f0;
    border-color: #444;
}

body.dark-mode button {
    background-color: #4dabf7;
    border-radius: 20px;
}

body.dark-mode button:hover {
    background-color: #339af0;
}

body.dark-mode #generate-container {
    background-color: #2d2d2d;
}

body.dark-mode #generate-container h3 {
    color: #f0f0f0;
}

body.dark-mode #generate-buttons {
    background-color: #1e1e1e;
}

body.dark-mode .generate-btn {
    background-color: #4dabf7;
}

body.dark-mode .generate-btn:hover {
    background-color: #339af0;
}

body.dark-mode pre, body.dark-mode .code-block {
    background-color: #1e1e1e;
    color: #d4d4d4;
}

body.dark-mode .code-block code::before {
    color: #808080;
    border-right-color: #404040;
}

body.dark-mode .toggle-container {
    background-color: #2d2d2d;
    box-shadow: 0 1px 3px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.14);
}

body.dark-mode .toggle-label {
    color: #f0f0f0;
}

/* Update the existing styles for the toggle container */
#mode-toggle-container {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
}

/* Highlight.js overrides */
.hljs {
    background: transparent;
    padding: 0;
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
```

