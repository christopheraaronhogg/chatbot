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
const addFilesContextButton = document.getElementById('add-files-context');
const uploadedFilesContainer = document.getElementById('uploaded-files-container');
const fileList = document.getElementById('file-list');

let conversation = [];
let currentHtml = '';
let currentCss = '';
let currentJs = '';
let currentReadme = '';
let projectContext = '';
let uploadedFiles = [];

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
        let prompt = `${projectContext}\n\nHuman: ${userMessage}\n\nAssistant: Please provide your response. If you include any code snippets, always wrap them in triple backticks (\`\`\`) for proper formatting.`;

        const response = await generateContent(prompt);
        addMessage(response);
    }
}

async function handleHtml() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Project context:\n${projectContext}\n\nCurrent HTML:\n${currentHtml}\n\nUser input: ${userMessage}\n\nPlease update or generate HTML based on the project context, current HTML, and user input. If starting fresh, create a complete HTML structure for the project described. Return only the HTML code without any explanation, comments, or markdown formatting. Do not include any text outside the HTML code.`;
    let newHtml = await generateContent(prompt);
    newHtml = cleanCodeBlock(newHtml, 'html');
    newHtml = newHtml.replace(/<!--[\s\S]*?-->/g, '');
    newHtml = newHtml.replace(/^([\s\S]*?html)?\s*<!DOCTYPE html>/i, '<!DOCTYPE html>');
    currentHtml = newHtml;
    addMessage("Updated HTML:");
    addMessage("```html\n" + currentHtml + "\n```");
}

async function handleCss() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Project context:\n${projectContext}\n\nCurrent CSS:\n${currentCss}\n\nUser input: ${userMessage}\n\nPlease update or generate CSS based on the project context, current CSS, and user input. If starting fresh, create complete styles for the project described. Return only the CSS code without any explanation, comments, or markdown formatting. Do not include any text outside the CSS code.`;
    let newCss = await generateContent(prompt);
    newCss = cleanCodeBlock(newCss, 'css');
    newCss = newCss.replace(/\/\*[\s\S]*?\*\//g, '');
    newCss = newCss.replace(/\/\/.*/g, '');
    currentCss = newCss;
    addMessage("Updated CSS:");
    addMessage("```css\n" + currentCss + "\n```");
}

async function handleJs() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Project context:\n${projectContext}\n\nCurrent JavaScript:\n${currentJs}\n\nUser input: ${userMessage}\n\nPlease update or generate JavaScript based on the project context, current JavaScript, and user input. If starting fresh, create complete functionality for the project described. Ensure all necessary functions and event listeners are included. Return only the JavaScript code without any explanation, comments, or markdown formatting. Do not include any text outside the JavaScript code.`;
    let newJs = await generateContent(prompt);
    newJs = cleanCodeBlock(newJs, 'javascript');
    newJs = newJs.replace(/\/\*[\s\S]*?\*\//g, '');
    newJs = newJs.replace(/\/\/.*/g, '');
    currentJs = newJs;
    addMessage("Updated JavaScript:");
    addMessage("```javascript\n" + currentJs + "\n```");
}

async function handleReadme() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = '';
    const prompt = `Project context:\n${projectContext}\n\nCurrent HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nCurrent JavaScript:\n${currentJs}\n\nUser input: ${userMessage}\n\nPlease generate a README.md file for this project. Include sections such as project description, installation instructions, usage, features, and any other relevant information. Format the content in Markdown. Return only the README content without any additional explanation or formatting.`;
    let newReadme = await generateContent(prompt);
    newReadme = cleanCodeBlock(newReadme, 'markdown');
    currentReadme = newReadme;
    addMessage("Generated README.md:");
    addMessage("```markdown\n" + currentReadme + "\n```");
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
    const question = await generateContent(prompt);
    addMessage(question);
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

    const advice = await generateContent(prompt);
    addMessage("Implementation Advice:");
    addMessage(advice);
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

uploadButton.addEventListener('click', () => {
    const files = fileUpload.files;
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedFiles.push({
                    name: files[i].name,
                    content: e.target.result
                });
                // Create file icon and name element
                const fileElement = document.createElement('div');
                fileElement.innerHTML = `
                    <i class="fas fa-file" style="margin-right: 5px;"></i>
                    ${files[i].name}
                `;
                fileElement.style.margin = '5px 0';
                fileList.appendChild(fileElement);
                
                if (i === files.length - 1) {
                    uploadedFilesContainer.style.display = 'block';
                    addFilesContextButton.style.display = 'block';
                    addMessage(`${files.length} file(s) uploaded successfully. Click 'Add Files to Context' to include them in the conversation.`, false);
                }
            };
            reader.readAsText(files[i]);
        }
    } else {
        addMessage("Please select files to upload.", false);
    }
});

addFilesContextButton.addEventListener('click', () => {
    if (uploadedFiles.length > 0) {
        let filesContext = "Uploaded Files:\n";
        uploadedFiles.forEach(file => {
            filesContext += `\nFile: ${file.name}\nContent:\n${file.content}\n`;
        });
        projectContext += filesContext;
        addMessage("Uploaded files added to conversation context.", false);
    } else {
        addMessage("No files have been uploaded yet.", false);
    }
});

addMessage("Hello! I'm here to help you with your project. What would you like to do?");