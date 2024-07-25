# .gitattributes

```
# Auto detect text files and perform LF normalization
* text=auto

```

# .gitignore

```
# Ignore .env file
.env

# Ignore node_modules
node_modules/

# Ignore log files
*.log

# Ignore any other sensitive or unnecessary files
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
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

        <section id="file-upload-section">
            <div id="file-upload-container">
                <label for="file-upload" class="file-upload-label">
                    <i class="fas fa-cloud-upload-alt"></i> Choose Files
                </label>
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
let selectedFiles = []; // New array to keep track of selected files

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
        loadingSpinner.style.display = 'flex'; // Show loading spinner
        // Include selected files in the prompt
        let prompt = `${projectContext}\n\nHuman: ${userMessage}\n\nSelected Files: ${selectedFiles.join(', ')}\n\nAssistant: Please provide your response. If you include any code snippets, always wrap them in triple backticks (\`\`\`) for proper formatting.`;

        try {
            const response = await generateContent(prompt);
            addMessage(response);
        } catch (error) {
            console.error('Error:', error);
            addMessage('An error occurred while generating the response. Please try again.');
        } finally {
            loadingSpinner.style.display = 'none'; // Hide loading spinner
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

addMessage("Hello! I'm here to help you with your project. What would you like to do?");
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
    color: #2c3e50;
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
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
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
}

.user-message {
    background-color: #3498db;
    color: white;
    margin-left: auto;
    box-shadow: 2px 2px 10px rgba(52, 152, 219, 0.3);
}

.bot-message {
    background-color: #f1f3f5;
    color: #34495e;
    box-shadow: 2px 2px 10px rgba(52, 73, 94, 0.1);
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
    background-color: #3498db;
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    color: white;
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin: 5px;
    padding: 12px 18px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    font-size: 0.9em;
}

button:hover {
    background-color: #2980b9;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

#send-button {
    background-color: #e74c3c;
    width: 110px;
}

#send-button:hover {
    background-color: #c0392b;
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
    background-color: #3498db;
    border: none;
    color: white;
    cursor: pointer;
    flex: 1;
    font-size: 14px;
    min-width: 80px;
    padding: 10px 14px;
    transition: all 0.3s ease;
    border-radius: 6px;
}

.generate-btn:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
}

/* Code Blocks */
pre, .code-block {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    margin: 15px 0;
    overflow-x: auto;
    padding: 20px;
    white-space: pre-wrap;
    word-wrap: break-word;
}

pre {
    max-height: 300px;
    overflow-y: auto;
}

.code-block-container {
    position: relative;
}

.copy-button {
    background-color: #2980b9;
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
    background-color: #3498db;
    opacity: 1;
}

/* Toggle Switch */
.toggle-container {
    align-items: center;
    background-color: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
    background: linear-gradient(to right, #6dd5ed, #2193b0);
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
    color: #3498db;
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
    background-color: #34495e;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    display: inline-block;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-right: 10px;
    padding: 12px 18px;
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
    background-color: #f39c12;
    margin-top: 20px;
}

#question-button:hover {
    background-color: #d35400;
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
    border-top: 6px solid #3498db;
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
```

# README.md

```md
# Project Generator Chatbot

## Description
Project Generator Chatbot is an AI-powered tool that helps developers quickly scaffold new projects. By leveraging natural language processing, it can understand user requirements and generate a basic project structure, complete with necessary files and configurations.

## Features
- Natural language interface for project creation
- Supports multiple programming languages and frameworks
- Generates basic project structure and boilerplate code
- Customizable templates for different project types
- Authentication system for user accounts

## Technologies Used
- Node.js
- Express.js
- React
- OpenAI API (or whichever AI model you're using)
- PostgreSQL
- JSON Web Tokens (JWT) for authentication

## Installation

1. Clone the repository
git clone https://github.com/christopheraaronhogg/chatbot.git
2. Navigate to the project directory
cd chatbot
3. Install dependencies
npm install
4. Set up environment variables
Create a `.env` file in the root directory and add the following:
    DATABASE_URL=your_postgres_database_url
    JWT_SECRET=your_jwt_secret
    AI_API_KEY=your_ai_api_key
5. Start the server
npm start

## Usage
1. Register for an account or log in
2. Describe your project requirements in natural language
3. Review the generated project structure
4. Download or copy the generated code

## API Endpoints
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Log in a user
- POST /api/generate - Generate a new project (requires authentication)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgements
- OpenAI for their powerful language model
- The open-source community for various libraries and tools used in this project

## Contact
Your Name - your.email@example.com

Project Link: https://github.com/christopheraaronhogg/chatbot
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

